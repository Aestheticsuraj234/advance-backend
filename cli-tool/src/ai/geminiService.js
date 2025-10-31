import ora from 'ora';
import { convertToModelMessages, streamText } from 'ai';
import { google } from '@ai-sdk/google';
import { config } from '../config.js';

export async function sendMessage({ messages, onChunk, retries = 2 }) {
  if (!messages || !Array.isArray(messages)) {
    throw new Error('Messages must be an array');
  }
  if (!config.model) {
    throw new Error('Model configuration is missing');
  }
  
  let attempt = 0;
  let lastErr;
  while (attempt <= retries) {
    const spinner = ora(attempt === 0 ? 'Thinking...' : `Retrying (${attempt}/${retries})...`).start();
    try {
      // messages already in correct format: [{role, parts: [{type, text}]}]
      const model = google(config.model, {
        apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY, // Always use env
      });
      const { textStream } = streamText({
        model,
        messages:convertToModelMessages(messages),
        maxOutputTokens: 2048,
        temperature: 0.7,
      });
      spinner.stop();
      let full = '';
      for await (const chunk of textStream) {
        full += chunk;
        if (onChunk) onChunk(chunk);
      }
      return full.trim();
    } catch (err) {
      spinner.stop();
      lastErr = err;
      const msg = String(err?.message || '');
      if (attempt === 0) console.error('Error details:', err);
      if (/\b(401|403|404)\b/.test(msg) || /Not Found/i.test(msg)) break;
      await new Promise((r) => setTimeout(r, 600 * Math.pow(2, attempt)));
      attempt += 1;
      if (attempt > retries) break;
    }
  }
  throw lastErr;
}
