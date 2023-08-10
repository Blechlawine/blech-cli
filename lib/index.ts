import chalk from "chalk";
import figlet from "figlet";
import inquirer from "inquirer";
import { handleCLI } from "./cli";
import fonts from "./fonts";
import { handleTemplate } from "./template";
import { GeneralAnswers } from "./types";

console.log(""); // in macos and linux the ascii art needs an empty line before
const font = fonts[(Math.random() * fonts.length) | 0];
console.log("Font:", font);
console.log(
    chalk.green(
        figlet.textSync("Blech-cli", {
            font,
            horizontalLayout: "full",
        }),
    ),
);
inquirer
    .prompt<GeneralAnswers>([
        {
            type: "input",
            name: "name",
            message: "What should be the name of the app? -",
        },
        {
            type: "list",
            name: "type",
            default: "Template",
            message: "Use a template or another cli?",
            choices: ["CLI", "Template"],
        },
    ])
    .then(async (_answers) => {
        if (_answers.type === "Template") {
            await handleTemplate(_answers);
        } else {
            await handleCLI(_answers);
        }
    });
