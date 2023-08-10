import { Clis, ValidClis } from "./types";
import chalk from "chalk";
import { ChildProcess, execSync, spawn } from "child_process";
import consola from "consola";
import fs from "fs-extra";
import inquirer from "inquirer";
import path from "path";
import { cwd } from "process";
import { fileURLToPath } from "url";
import * as yml from "yaml";

export async function handleCLI(_answers: { name: string }) {
    const { clis } = yml.parse(
        fs.readFileSync(path.join(fileURLToPath(import.meta.url), "../..", "clis.yml"), {
            encoding: "utf8",
        }),
    ) as Clis;
    const answers = Object.assign(
        _answers,
        await inquirer.prompt<{
            cli: ValidClis;
        }>([
            {
                type: "list",
                name: "cli",
                message: "Which cli do you want to run?",
                choices: clis.map((cli) => cli.display),
            },
        ]),
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
            consola.info(`${answers.cli} CLI terminated:`, code);
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
            consola.start(chalk.greenBright("Installing dependencies"));
            execSync(`${yarnCommand} install`, {
                cwd: path.join(cwd(), answers.name),
                stdio: "inherit",
            });
        }
    }
}
