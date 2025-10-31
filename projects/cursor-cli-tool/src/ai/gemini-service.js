import ora from "ora";
import { convertToModelMessages, streamText } from "ai";
import { google } from "@ai-sdk/google";
import { config } from "../config/config.js";

export async function sendMessage({ messages, onChunk, retries = 2 }) {
  if (!messages || !Array.isArray(messages)) {
    throw new Error("Messages must be an array");
  }
  if (!config.model) {
    throw new Error("Model configuration is missing");
  }

  let attempt = 0;
  let lastErr;

  while (attempt <= retries) {
    const spinner = ora(
      attempt === 0 ? "Thinking..." : `Retrying (${attempt}/${retries})...`
    ).start();

    try {
      const model = google(config.model);

      const { textStream } = streamText({
        model,
        messages: convertToModelMessages(messages),
        maxOutputTokens: 2048,
        temperature: 0.7,
      });
      let full = ``;
      spinner.stop();
      for await (const chunk of textStream) {
        full += chunk;
        if (onChunk) onChunk(chunk);
      }

      return full.trim();
    } catch (error) {
      spinner.stop();
      lastErr = error;
      const msg = String(error?.message || "");
      await new Promise((r) => setTimeout(r, 600 * Math.pow(2, attempt)));
      attempt += 1;
      if (attempt > retries) break;
    }
  }
  throw lastErr;
}
