import figlet from "figlet";
import boxen from "boxen";
import chalk from "chalk";

export function renderBanner(){
    const title = chalk.green(figlet.textSync("OrbitAI" , {
        horizontalLayout:"fitted",
        
    }))
    const subtitle = `${chalk.cyan('Gemini-powered')} ${chalk.gray("•")} ${chalk.magenta("Cli Chat")}`

    const content = `${title}\n${subtitle}`;

    const boxed = boxen(content , {
        padding:1,
        margin:1,
        borderColor:"cyan",
        borderStyle:"round"
    })

    console.log(boxed)
}