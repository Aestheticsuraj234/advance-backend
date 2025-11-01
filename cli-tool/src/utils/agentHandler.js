import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { sendMessage } from '../ai/geminiService.js';
import { printSystem, printAssistantStart, printAssistantChunk, printAssistantEnd } from '../cli/outputFormatter.js';
import chalk from 'chalk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * System prompt for agent mode - instructs AI to generate complete applications
 */
const AGENT_SYSTEM_PROMPT = `You are an expert software engineer specializing in creating complete, production-ready applications from descriptions.

Your task is to generate a complete application with all necessary files, dependencies, and setup instructions.

CRITICAL INSTRUCTIONS:
1. Generate ALL files needed for the application to run
2. Include package.json, README.md, and any configuration files
3. Provide bash commands for setup and execution
4. Format your response using this EXACT structure:

\`\`\`STRUCTURE
folder-name/
├── file1.ext
├── file2.ext
└── ...
\`\`\`

Then for each file, use this format:

\`\`\`file:folder-name/file1.ext
[file content here]
\`\`\`

\`\`\`file:folder-name/file2.ext
[file content here]
\`\`\`

Finally, provide bash commands in this format:

\`\`\`bash
# Setup commands
cd folder-name
npm install
# ... other setup commands
\`\`\`

\`\`\`bash:run
# Run commands
npm start
# ... other run commands
\`\`\`

IMPORTANT:
- Create a meaningful, descriptive folder name (use kebab-case)
- Include ALL dependencies in package.json
- Make code clean, well-commented, and production-ready
- Provide complete, working applications
- Include error handling
- Add proper README with instructions
`;

/**
 * Parse file content from AI response
 */
function parseFilesFromResponse(response) {
  const files = [];
  const fileRegex = /```file:([^\n]+)\n([\s\S]*?)```/g;
  let match;
  
  while ((match = fileRegex.exec(response)) !== null) {
    const filePath = match[1].trim();
    const content = match[2].trim();
    files.push({ path: filePath, content });
  }
  
  return files;
}

/**
 * Parse bash commands from AI response
 */
function parseBashCommands(response) {
  const commands = [];
  // Match ```bash and ```bash:run blocks
  const bashRegex = /```bash(?::run)?\n([\s\S]*?)```/g;
  let match;
  
  while ((match = bashRegex.exec(response)) !== null) {
    const commandBlock = match[1].trim();
    // Split by lines and filter out comments for main commands
    const lines = commandBlock.split('\n').filter(line => {
      const trimmed = line.trim();
      return trimmed && !trimmed.startsWith('#');
    });
    commands.push(...lines);
  }
  
  return commands;
}

/**
 * Get folder name from structure or files
 */
function getFolderName(response, files) {
  // Try to extract from STRUCTURE block
  const structureMatch = response.match(/```STRUCTURE\n([\s\S]*?)```/);
  if (structureMatch) {
    const firstLine = structureMatch[1].split('\n')[0];
    const folderMatch = firstLine.match(/([^\s\/]+)\//);
    if (folderMatch) {
      return folderMatch[1];
    }
  }
  
  // Extract from first file path
  if (files.length > 0) {
    const parts = files[0].path.split('/');
    return parts[0];
  }
  
  // Default fallback
  return 'generated-app';
}

/**
 * Create application from AI response
 */
async function createApplicationFiles(baseDir, folderName, files) {
  const appDir = path.join(baseDir, folderName);
  
  // Create directory
  await fs.mkdir(appDir, { recursive: true });
  
  // Write all files
  for (const file of files) {
    const filePath = path.join(appDir, file.path.replace(`${folderName}/`, ''));
    const fileDir = path.dirname(filePath);
    
    // Create directory structure if needed
    await fs.mkdir(fileDir, { recursive: true });
    
    // Write file
    await fs.writeFile(filePath, file.content, 'utf8');
    printSystem(chalk.green(`Created: ${file.path}`));
  }
  
  return appDir;
}

/**
 * Generate application using agent mode
 */
export async function generateApplication(description, cwd = process.cwd()) {
  try {
    printSystem(chalk.cyan('🤖 Agent Mode: Generating your application...'));
    
    // Create user message
    const messages = [
      {
        role: 'user',
        parts: [{ type: 'text', text: `Create a complete application for: ${description}` }]
      }
    ];
    
    // Get AI response with increased token limit for code generation
    let response = '';
    try {
      printAssistantStart();
      response = await sendMessage({
        messages,
        system: AGENT_SYSTEM_PROMPT,
        onChunk: (chunk) => {
          response += chunk;
          printAssistantChunk(chunk);
        },
        maxOutputTokens: 8192, // Increased for generating multiple files
        temperature: 0.3, // Lower temperature for more deterministic code generation
      });
      printAssistantEnd();
    } catch (err) {
      printAssistantEnd();
      throw new Error(`AI generation failed: ${err.message}`);
    }
    
    // Parse files and commands
    const files = parseFilesFromResponse(response);
    const bashCommands = parseBashCommands(response);
    const folderName = getFolderName(response, files);
    
    if (files.length === 0) {
      printSystem(chalk.yellow('⚠️  No files found in response. The AI might not have followed the format correctly.'));
      printSystem(chalk.dim('Raw response preview:\n' + response.substring(0, 500)));
      return null;
    }
    
    // Create application directory and files
    const appDir = await createApplicationFiles(cwd, folderName, files);
    
    // Display results
    printSystem(chalk.green(`\n✅ Application created in: ${chalk.bold(appDir)}`));
    printSystem(chalk.green(`📁 Generated ${files.length} file(s)`));
    
    // Display bash commands
    if (bashCommands.length > 0) {
      printSystem(chalk.cyan('\n📋 Setup & Run Commands:'));
      printSystem(chalk.white('```bash'));
      printSystem(chalk.white(`cd ${folderName}`));
      bashCommands.forEach(cmd => {
        printSystem(chalk.white(cmd));
      });
      printSystem(chalk.white('```'));
    }
    
    return {
      folderName,
      appDir,
      files: files.map(f => f.path),
      commands: bashCommands,
    };
    
  } catch (err) {
    printSystem(chalk.red(`❌ Error generating application: ${err.message}`));
    throw err;
  }
}

