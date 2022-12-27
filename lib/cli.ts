import chalk from "chalk";
import { spawn } from "child_process";
import inquirer from "inquirer";
import path from "path";
import fs from "fs-extra";
import { cwd } from "process";

export async function handleCLI(_answers: { name: string }) {
    const answers = Object.assign(
        _answers,
        await inquirer.prompt<{
            cli: "Vite" | "Next.js" | "T3" | "Solid-start";
        }>([
            {
                type: "list",
                name: "cli",
                message: "Which cli do you want to run?",
                choices: ["Vite", "Next.js", "T3", "Solid-start"],
            },
        ])
    );
    let subProc;
    const yarnCommand = process.platform == "win32" ? "yarn.cmd" : "yarn";
    switch (answers.cli) {
        case "Vite":
            subProc = spawn(yarnCommand, ["create", "vite", answers.name], { stdio: "inherit" });
            break;
        case "Next.js":
            subProc = spawn(yarnCommand, ["create", "next-app", answers.name], { stdio: "inherit" });
            break;
        case "Solid-start":
            if (!fs.existsSync(path.join(cwd(), answers.name)))
                fs.mkdirSync(path.join(cwd(), answers.name), { recursive: true });
            subProc = spawn(yarnCommand, ["create", "solid"], {
                stdio: "inherit",
                cwd: path.join(cwd(), answers.name),
            });
            break;
        case "T3":
            subProc = spawn(yarnCommand, ["create", "t3-app", answers.name], { stdio: "inherit" });
            break;
        default:
            console.log(chalk.red("Unknown CLI"));
            process.exit(1);
    }
    subProc.on("error", (err) => console.error(err));
    subProc.on("close", (code) => {
        console.log(`${answers.cli} CLI terminated:`, code);
    });
}
