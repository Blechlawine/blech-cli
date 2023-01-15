import chalk from "chalk";
import { ChildProcess, execSync, spawn } from "child_process";
import inquirer from "inquirer";
import path from "path";
import fs from "fs-extra";
import { cwd } from "process";
import * as yml from "yaml";
import { fileURLToPath } from "url";

export async function handleCLI(_answers: { name: string }) {
    const { clis } = yml.parse(
        fs.readFileSync(path.join(fileURLToPath(import.meta.url), "../..", "clis.yml"), {
            encoding: "utf8",
        })
    ) as TClis;
    const answers = Object.assign(
        _answers,
        await inquirer.prompt<{
            cli: TValidClis;
        }>([
            {
                type: "list",
                name: "cli",
                message: "Which cli do you want to run?",
                choices: clis.map((cli) => cli.display),
            },
        ])
    );
    const selectedCli = clis.find((cli) => cli.display === answers.cli);
    if (!selectedCli) {
        console.log(chalk.redBright("Error selecting Cli"));
        process.exit(1);
    }

    const yarnCommand = process.platform === "win32" ? "yarn.cmd" : "yarn";
    let subProc: ChildProcess;
    if (selectedCli.createProjectFolder) {
        if (!fs.existsSync(path.join(cwd(), answers.name)))
            fs.mkdirSync(path.join(cwd(), answers.name), { recursive: true });
        subProc = spawn(yarnCommand, ["create", selectedCli.command], {
            stdio: "inherit",
            cwd: path.join(cwd(), answers.name),
        });
    } else {
        subProc = spawn(yarnCommand, ["create", selectedCli.command, answers.name], {
            stdio: "inherit",
        });
    }
    subProc.on("error", (err) => console.error(err));
    await new Promise<void>((res) => {
        subProc.on("close", (code) => {
            console.log(`${answers.cli} CLI terminated:`, code);
            res();
        });
    });
    if (selectedCli.askForInstall) {
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
