import chalk from 'chalk';
import boxen from 'boxen';

export function printSystem(text) {
  const boxed = boxen(chalk.yellow(text), {
    padding: 1,
    margin: 1,
    borderColor: 'yellow',
    borderStyle: 'round',
  });
  console.log(boxed);
}

export function printUser(text) {
  console.log(chalk.greenBright.bold('You') + ': ' + chalk.green(text));
}

export function printAssistantStart() {
  process.stdout.write(chalk.cyanBright.bold('OrbitAI') + ': ');
}

export function printAssistantChunk(chunk) {
  process.stdout.write(chalk.cyan(chunk));
}

export function printAssistantEnd() {
  process.stdout.write('\n');
}

export function printHelp() {
  const help = `
Commands:
  /help   Show this help
  /tools  Manage and enable AI tools (Google Search, Code Execution, URL Context)
  /agent  Generate a complete application from a description
           Usage: /agent [description] or just /agent to be prompted
  /exit   Quit the chat

Tips:
  - Ask questions or paste content to discuss.
  - If the assistant lists options (1., 2., 3.), you'll be prompted to pick one.
  - Use /tools to enable features like Google Search for real-time information.
  - Use /agent to create complete applications with all files and setup commands.
`;
  const boxed = boxen(chalk.white(help), {
    padding: 1,
    margin: 1,
    borderColor: 'white',
    borderStyle: 'classic',
  });
  console.log(boxed);
}

export function printToolsMenu(availableTools) {
  const enabledTools = availableTools.filter(t => t.enabled);
  const enabledList = enabledTools.length > 0
    ? enabledTools.map(t => `  ✓ ${t.name}`).join('\n')
    : '  (none enabled)';
  
  const toolsInfo = `
Available Tools:

${availableTools.map(tool => {
  const status = tool.enabled ? chalk.green('✓ ENABLED') : chalk.gray('○ Disabled');
  return `  ${tool.name} [${status}]
    ${chalk.dim(tool.description)}`;
}).join('\n\n')}

Currently Enabled:
${enabledList}

Use spacebar to toggle tools, then press Enter to save.
`;
  
  const boxed = boxen(chalk.white(toolsInfo), {
    padding: 1,
    margin: 1,
    borderColor: 'cyan',
    borderStyle: 'round',
    title: 'Tools Manager',
    titleAlignment: 'center',
  });
  console.log(boxed);
}

export function printToolsStatus(availableTools) {
  const enabledTools = availableTools.filter(t => t.enabled);
  if (enabledTools.length === 0) {
    printSystem('No tools are currently enabled. Use /tools to enable some.');
    return;
  }
  
  const statusText = `Enabled tools: ${enabledTools.map(t => chalk.green(t.name)).join(', ')}`;
  printSystem(statusText);
}
