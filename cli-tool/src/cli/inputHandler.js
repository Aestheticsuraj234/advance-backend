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


