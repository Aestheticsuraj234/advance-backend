import inquirer from 'inquirer';

export async function promptUser() {
  const { text } = await inquirer.prompt([
    {
      type: 'input',
      name: 'text',
      message: 'You:',
      prefix: '>',
      transformer: (val) => val,
    },
  ]);
  return text;
}

export async function confirmChoice(options) {
  const { choose } = await inquirer.prompt([
    {
      type: 'list',
      name: 'choose',
      message: 'Pick an option to continue:',
      choices: [
        ...options,
        new inquirer.Separator(),
        { name: 'Skip', value: '' },
      ],
      pageSize: Math.min(10, options.length + 2),
    },
  ]);
  return { choose };
}

export async function selectTools(availableTools) {
  const { selectedTools } = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'selectedTools',
      message: 'Select tools to enable (use space to toggle, enter to confirm):',
      choices: availableTools.map(tool => ({
        name: `${tool.name}${tool.enabled ? ' ✓' : ''} - ${tool.description}`,
        value: tool.id,
        checked: tool.enabled,
      })),
      pageSize: 10,
    },
  ]);
  return selectedTools || [];
}

export async function promptApplicationDescription() {
  const { description } = await inquirer.prompt([
    {
      type: 'input',
      name: 'description',
      message: 'Describe the application you want to create:',
      prefix: '>',
      validate: (input) => {
        if (!input || input.trim().length < 10) {
          return 'Please provide a detailed description (at least 10 characters)';
        }
        return true;
      },
    },
  ]);
  return description.trim();
}


