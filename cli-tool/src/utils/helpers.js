export function parseOptionsFromText(text) {
  const lines = text.split(/\r?\n/);
  const options = [];
  const numbered = /^\s*(?:\d+\.|[-*])\s+(.*)$/;
  for (const line of lines) {
    const m = line.match(numbered);
    if (m && m[1]) {
      const opt = m[1].trim();
      if (opt.length > 0) options.push(opt);
    }
  }
  // Deduplicate and limit
  return Array.from(new Set(options)).slice(0, 6);
}

export async function safeExit(code = 0) {
  // Give stdout time to flush on Windows
  await new Promise((r) => setTimeout(r, 10));
  process.exit(code);
}


