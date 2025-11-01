import { renderBanner } from "./cli/banner.js";
import { promptUser, confirmChoice, selectTools, promptApplicationDescription } from "./cli/inputHandler.js";
import {
  printSystem,
  printUser,
  printHelp,
  printAssistantStart,
  printAssistantChunk,
  printAssistantEnd,
  printToolsMenu,
  printToolsStatus,
} from "./cli/outputFormatter.js";
import { sendMessage } from "./ai/geminiService.js";
import { parseOptionsFromText, safeExit } from "./utils/helpers.js";
import { config } from "./config.js";
import { availableTools, getEnabledTools, toggleTool, resetTools } from "./utils/tools.js";
import { generateApplication } from "./utils/agentHandler.js";

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

      if(userText.trim().toLowerCase() === "/tools"){
        printToolsMenu(availableTools);
        const selectedToolIds = await selectTools(availableTools);
        
        // Reset all tools first
        resetTools();
        
        // Enable selected tools
        for (const toolId of selectedToolIds) {
          toggleTool(toolId);
        }
        
        printToolsStatus(availableTools);
        continue;
      }

      if(userText.trim().toLowerCase() === "/agent" || userText.trim().toLowerCase().startsWith("/agent ")){
        let description = userText.trim().substring(7).trim();
        
        if (!description) {
          description = await promptApplicationDescription();
        }
        
        try {
          await generateApplication(description, process.cwd());
          printSystem("Type '/help' for commands. Type '/exit' to quit.");
        } catch (err) {
          printSystem(`Agent mode error: ${String(err?.message || err)}`);
        }
        continue;
      }

      // Push in correct AI SDK v5 format
      messages.push({ role: "user", parts: [{ type: "text", text: userText }] });
      printUser(userText);

      let reply = "";
      try {
        printAssistantStart();
        const enabledTools = getEnabledTools();
        reply = await sendMessage({
          messages,
          tools: enabledTools,
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
            const enabledTools = getEnabledTools();
            const branchReply = await sendMessage({
              messages,
              tools: enabledTools,
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
