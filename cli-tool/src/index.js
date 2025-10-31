import { renderBanner } from "./cli/banner.js";
import { promptUser, confirmChoice } from "./cli/inputHandler.js";
import {
  printSystem,
  printUser,
  printHelp,
  printAssistantStart,
  printAssistantChunk,
  printAssistantEnd,
} from "./cli/outputFormatter.js";
import { sendMessage } from "./ai/geminiService.js";
import { parseOptionsFromText, safeExit } from "./utils/helpers.js";
import { config } from "./config.js";

const messages = [];

async function main() {
  try {
    renderBanner();

    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      printSystem(
        "Missing GOOGLE_GENERATIVE_AI_API_KEY. Set it in your environment before running.\nTip: create a .env file with GOOGLE_GENERATIVE_AI_API_KEY=..."
      );
      await safeExit(1);
      return;
    }

    printSystem("Type '/help' for commands. Type '/exit' to quit.");

    // Chat loop
    while (true) {
      const userText = await promptUser();
      if (!userText) continue;

      if (userText.trim().toLowerCase() === "/exit") {
        await safeExit(0);
        return;
      }

      if (userText.trim().toLowerCase() === "/help") {
        printHelp();
        continue;
      }

      // Push in correct AI SDK v5 format
      messages.push({ role: "user", parts: [{ type: "text", text: userText }] });
      printUser(userText);

      let reply = "";
      try {
        printAssistantStart();
        reply = await sendMessage({
          messages,
          onChunk: (chunk) => printAssistantChunk(chunk),
        });
        printAssistantEnd();
        messages.push({ role: "assistant", parts: [{ type: "text", text: reply }] });
      } catch (err) {
        printAssistantEnd();
        printSystem(`Provider error: ${String(err?.message || err)}`);
        continue;
      }

      // Option picking
      const options = parseOptionsFromText(reply);
      if (options.length > 0) {
        const { choose } = await confirmChoice(options);
        if (choose) {
          messages.push({ role: "user", parts: [{ type: "text", text: choose }] });
          printUser(choose);
          try {
            printAssistantStart();
            const branchReply = await sendMessage({
              messages,
              onChunk: (chunk) => printAssistantChunk(chunk),
            });
            printAssistantEnd();
            messages.push({ role: "assistant", parts: [{ type: "text", text: branchReply }] });
          } catch (err) {
            printAssistantEnd();
            printSystem(`Provider error: ${String(err?.message || err)}`);
          }
        }
      }
    }
  } catch (err) {
    printSystem(`Error: ${String(err?.message || err)}`);
    await safeExit(1);
  }
}

main();
