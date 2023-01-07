import chalk from "chalk";
import { ChildProcess, execSync, spawn } from "child_process";
import inquirer from "inquirer";
import path from "path";
import fs from "fs-extra";
import { cwd } from "process";

export async function handleCLI(_answers: { name: string }) {
    const answers = Object.assign(
        _answers,
        await inquirer.prompt<{
            cli: "Vite" | "Next.js" | "T3" | "Solid-start" | "Astro" | "Tauri";
        }>([
            {
                type: "list",
                name: "cli",
                message: "Which cli do you want to run?",
                choices: ["Vite", "Next.js", "T3", "Solid-start", "Astro", "Tauri"],
            },
        ])
    );
    let subProc: ChildProcess;
    const yarnCommand = process.platform === "win32" ? "yarn.cmd" : "yarn";
    let askForInstall = true;
    switch (answers.cli) {
        case "Vite":
            subProc = spawn(yarnCommand, ["create", "vite", answers.name], { stdio: "inherit" });
            break;
        case "Next.js":
            subProc = spawn(yarnCommand, ["create", "next-app", answers.name], {
                stdio: "inherit",
            });
            askForInstall = false; // Next.js already asks about installing dependencies
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
            askForInstall = false; // T3 already asks about installing dependencies
            break;
        case "Astro":
            subProc = spawn(yarnCommand, ["create", "astro", answers.name], { stdio: "inherit" });
            askForInstall = false; // astro cli already asks about installing dependencies
            break;
        case "Tauri":
            subProc = spawn(yarnCommand, ["create", "tauri-app", answers.name], {
                stdio: "inherit",
            });
            break;
        default:
            console.log(chalk.red("Unknown CLI"));
            process.exit(1);
    }
    subProc.on("error", (err) => console.error(err));
    await new Promise<void>((res) => {
        subProc.on("close", (code) => {
            console.log(`${answers.cli} CLI terminated:`, code);
            res();
        });
    });
    if (askForInstall) {
        const { shouldInstall } = await inquirer.prompt<{ shouldInstall: boolean }>([
            {
                type: "confirm",
                name: "shouldInstall",
                message: "Do you want to install dependencies? `yarn install` - ",
                default: true,
            },
        ]);
        if (shouldInstall) {
            console.log(chalk.greenBright("Installing dependencies"));
            execSync(`${yarnCommand} install`, {
                cwd: path.join(cwd(), answers.name),
                stdio: "inherit",
            });
        }
    }
}
