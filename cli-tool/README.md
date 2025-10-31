# OrbitAI CLI

Interactive Gemini-powered chat for your terminal. Built with Vercel AI SDK, Chalk, Figlet, and Boxen.

## Features

- Styled banner and readable CLI output
- Multi-turn conversation with in-session history
- Option selection when the assistant proposes choices
- Modular structure, with placeholders for tool-calling and web search

## Quick Start

```bash
npm install
```

Set your API key in environment:

```bash
# Windows PowerShell
$env:GOOGLE_GENERATIVE_AI_API_KEY = "YOUR_KEY"

# macOS/Linux
export GOOGLE_GENERATIVE_AI_API_KEY="YOUR_KEY"
```

Optional: choose a model (defaults to `gemini-1.5-flash`):

```bash
export ORBITAI_MODEL="gemini-1.5-pro"
```

Run:

```bash
npm start
# or
npx orbitai
```

## Commands

- `/help` Show help
- `/exit` Quit

## Troubleshooting

- "Unable to reach the model provider" or ConnectError:
  - Check internet connectivity and retry.
  - Ensure `GOOGLE_GENERATIVE_AI_API_KEY` is set in the current shell.
  - Verify the key is valid and has access to the chosen model.
  - If behind a proxy, configure your proxy env vars.
  - Try a simpler model: `ORBITAI_MODEL=gemini-1.5-flash`.

## Project Structure

```plaintext
src/
  ai/geminiService.js
  cli/
    banner.js
    inputHandler.js
    outputFormatter.js
  utils/helpers.js
  config.js
  index.js
```

## Extensibility

- `src/ai/` Add provider wrappers and streaming utilities
- `src/cli/` Add richer TUI components or command switcher
- `src/utils/` Add tool-calling and web search modules

## License

MIT


