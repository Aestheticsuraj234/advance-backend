import { sendMessage } from "./ai/gemini-service.js";
import { renderBanner } from "./cli/banner.js";
import { promptUser } from "./cli/inputer-handler.js";
import {
  printAssistantChunk,
  printAssistantEnd,
  printAssistantStart,
  printHelp,
  printSystem,
  printUser,
} from "./cli/output-formatter.js";
import { safeExit } from "./utils/helper.js";
import dotenv from "dotenv";

dotenv.config();

const messages = [];
async function main() {
  renderBanner();
  printSystem("Type '/help' for commands. Type '/exit' to quite. ");

  while (true) {
    const userText = await promptUser();

    if (!userText) continue;

    if (userText.trim().toLowerCase() === "/exit") {
      await safeExit(0);
      return;
    }

    if (userText.trim().toLowerCase() === "/help") {
      printHelp();
      return;
    }

    // ai-sdk
    messages.push({
      role: "user",
      parts: [
        {
          type: "text",
          text: userText,
        },
      ],
    });

    printUser(userText);

    let reply = "";

    try {
      printAssistantStart();
      reply = await sendMessage({
        messages,
        onChunk: (chunk) => printAssistantChunk(chunk),
      });
      printAssistantEnd();
      messages.push({
        role: "assistant",
        parts: [{ type: "text", text: reply }],
      });
      
    } catch (error) {
        printAssistantEnd();
        printSystem(`Provider error: ${String(error?.message || error)}`);
        continue;
    }
  }
}

main();
