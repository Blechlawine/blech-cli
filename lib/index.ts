import chalk from "chalk";
import figlet from "figlet";
import inquirer from "inquirer";
import { cwd } from "process";
import * as yml from "yaml";
import { fileURLToPath } from "url";
import fs from "fs-extra";
import path from "path";
import { handleCLI } from "./cli";
import { copyTemplateFiles, runTemplateSetup } from "./template";

console.log(chalk.green(figlet.textSync("Blech-cli")));
inquirer
    .prompt<{
        name: string;
        type: "CLI" | "Template";
    }>([
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
            // fileUrlToPath(import.meta.url) is the module equivalent of __dirname
            const { templates } = yml.parse(
                fs.readFileSync(path.join(fileURLToPath(import.meta.url), "../..", "templates.yml"), {
                    encoding: "utf8",
                })
            ) as {
                templates: {
                    name: string;
                    display: string;
                    type: "bundled" | "git";
                }[];
            };
            const answers = Object.assign(
                _answers,
                await inquirer.prompt<{
                    template: string;
                }>([
                    {
                        type: "list",
                        name: "template",
                        message: "Which template do you want?",
                        choices: templates,
                    },
                ])
            );
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
            const templateConfigPath = path.join(templateDir, "_template.yml");
            const templateConfig: TTemplateConfig = yml.parse(fs.readFileSync(templateConfigPath, "utf-8"));
            copyTemplateFiles(templateDir, projectDir, templateConfig);
            await runTemplateSetup(projectDir, templateConfig);
        } else {
            handleCLI(_answers);
        }
    });
