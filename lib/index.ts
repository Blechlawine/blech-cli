import chalk from "chalk";
import figlet from "figlet";
import inquirer from "inquirer";
import { cwd } from "process";
import * as yml from "yaml";
import { fileURLToPath } from "url";
import fs from "fs-extra";
import path from "path";
import { handleCLI } from "./cli";
import { copyTemplateFiles, readTemplateConfig, runTemplateSetup } from "./template";
import { execSync } from "child_process";
import minimatch from "minimatch";

console.log(""); // in macos and linux the ascii art needs an empty line before
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
                fs.readFileSync(
                    path.join(fileURLToPath(import.meta.url), "../..", "templates.yml"),
                    {
                        encoding: "utf8",
                    },
                ),
            ) as TTemplates;
            const answers = Object.assign(
                _answers,
                await inquirer.prompt<{
                    template: string;
                }>([
                    {
                        type: "list",
                        name: "template",
                        message: "Which template do you want?",
                        choices: templates.map((t) => t.display),
                    },
                ]),
            );
            const selectedTemplate = templates.find((t) => t.display === answers.template);
            if (!selectedTemplate) {
                console.log(chalk.redBright("Error selecting template"));
                process.exit(1);
            }
            const projectDir = path.join(cwd(), answers.name);
            const templateDir = path.join(
                fileURLToPath(import.meta.url),
                "../..",
                "templates",
                selectedTemplate.name,
            );
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
            let templateConfig: TTemplateConfig = {};
            if (selectedTemplate.type === "bundled") {
                templateConfig = readTemplateConfig(path.join(templateDir, "_template.yml"));
                copyTemplateFiles(templateDir, projectDir, templateConfig);
            } else if (selectedTemplate.type === "git") {
                execSync(`npx degit ${selectedTemplate.url} ${projectDir}`);
                templateConfig = readTemplateConfig(path.join(projectDir, "_template.yml"));
                for (const file of fs.readdirSync(projectDir)) {
                    if (
                        ["_template.yml"].concat(templateConfig.ignore ?? []).some((glob) => {
                            return minimatch(file, glob, { matchBase: true });
                        })
                    ) {
                        // Remove every file that matches a glob pattern in ignore
                        fs.removeSync(file);
                    }
                }
            }
            await runTemplateSetup(projectDir, templateConfig);
        } else {
            handleCLI(_answers);
        }
    });
