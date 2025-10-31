import inquirer from "inquirer";

export async function promptUser() {
    const {text} = await inquirer.prompt([
        {
            type:"input",
            name:"text",
            message:"You:",
            prefix:"🔥",
            transformer:(val)=>val
        }
    ]);

    return text
}