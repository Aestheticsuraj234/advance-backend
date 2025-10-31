import chalk from "chalk";
import boxen from "boxen";

export function printSystem(text) {
  const boxed = boxen(chalk.yellow(text), {
    padding: 1,
    margin: 1,
    borderColor: 'yellow',
    borderStyle: 'round',
  });
  console.log(boxed);
}


export function printHelp() {
  const help = `
Commands:
  /help   Show this help
  /exit   Quit the chat

Tips:
  - Ask questions or paste content to discuss.
  - If the assistant lists options (1., 2., 3.), you'll be prompted to pick one.

Planned features:
  - /tools  Access tool-calling (filesystem, shell, etc.)
  - /search Web search integration
`;
  const boxed = boxen(chalk.white(help), {
    padding: 1,
    margin: 1,
    borderColor: 'white',
    borderStyle: 'classic',
  });
  console.log(boxed);
}

export function printUser(text) {
  console.log(chalk.greenBright.bold('🔥You') + ': ' + chalk.green(text));
}


export function printAssistantStart() {
  process.stdout.write(chalk.cyanBright.bold('🧠OrbitAI') + ': ');
}

export function printAssistantChunk(chunk) {
  process.stdout.write(chalk.cyan(chunk));
}

export function printAssistantEnd() {
  process.stdout.write('\n');
}