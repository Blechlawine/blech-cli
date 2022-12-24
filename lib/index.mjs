import chalk from "chalk";
import figlet from "figlet";
import inquirer from "inquirer";
import { spawn } from "child_process";
import { cwd } from "process";
import * as yml from "yaml";
import { fileURLToPath } from "url";
import fs from "fs-extra";
import path from "path";

console.log(chalk.green(figlet.textSync("Blech-cli")));
inquirer
    .prompt([
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
    .then(async (answers) => {
        if (answers.type === "Template") {
            // fileUrlToPath(import.meta.url) is the module equivalent of __dirname
            const { templates } = yml.parse(
                fs.readFileSync(path.join(fileURLToPath(import.meta.url), "../..", "templates.yml"), {
                    encoding: "utf8",
                })
            );
            answers = {
                ...answers,
                ...(await inquirer.prompt([
                    {
                        type: "list",
                        name: "template",
                        message: "Which template do you want?",
                        choices: templates,
                    },
                ])),
            };
            const projectDir = path.join(cwd(), answers.name);
            const templateDir = path.join(fileURLToPath(import.meta.url), "../..", "templates", answers.template);
            if (!fs.existsSync(projectDir)) fs.mkdirSync(projectDir, { recursive: true });
            const filesInProjectDir = fs.readdirSync(projectDir);
            if (filesInProjectDir.length > 0) {
                const { continueAnyways } = await inquirer.prompt([
                    {
                        type: "confirm",
                        name: "continueAnyways",
                        message: `Selected directory: ${projectDir} is not empty, continue? (conflicting files will be overwritten) -`,
                    },
                ]);
                if (!continueAnyways) {
                    console.log(chalk.redBright("Cancelling..."));
                    process.exit(1);
                }
            }
            // TODO: add progress bar when copying
            console.log(chalk.yellow("Copying template..."));
            fs.copySync(templateDir, projectDir, { overwrite: true });
            console.log(chalk.greenBright("Template copied successfully"));
        } else {
            answers = {
                ...answers,
                ...(await inquirer.prompt([
                    {
                        type: "list",
                        name: "cli",
                        message: "Which cli do you want to run?",
                        choices: ["Vite", "Next.js", "T3", "Solid-start"],
                    },
                ])),
            };
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
                    break;
            }
            subProc.on("error", (err) => console.error(err));
            subProc.on("close", (code) => {
                console.log(`${answers.cli} CLI terminated:`, code);
            });
        }
    });
