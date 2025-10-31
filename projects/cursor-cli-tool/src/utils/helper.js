import { printSystem } from "../cli/output-formatter.js";

export async function safeExit(code = 0) {
 
  await new Promise((r) => setTimeout(r, 10));
  printSystem("GoodBye🫡")
  process.exit(code);
}
