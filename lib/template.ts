import { execSync } from "child_process";
import path from "node:path";
import { cwd } from "node:process";
import { fileURLToPath } from "node:url";
import chalk from "chalk";
import consola from "consola";
import fs from "fs-extra";
import inquirer from "inquirer";
import { minimatch } from "minimatch";
import * as yml from "yaml";
import { GeneralAnswers, TemplateConfig, Templates } from "./types";

export async function handleTemplate(previousAnswers: GeneralAnswers) {
    // fileUrlToPath(import.meta.url) is the module equivalent of __dirname
    const { templates } = yml.parse(
        fs.readFileSync(path.join(fileURLToPath(import.meta.url), "../..", "templates.yml"), {
            encoding: "utf8",
        }),
    ) as Templates;
    const answers = Object.assign(
        previousAnswers,
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
        consola.error(chalk.redBright("Error selecting template"));
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
            consola.info(chalk.redBright("Cancelling..."));
            process.exit(1);
        }
    }
    const templateConfig = selectedTemplate.config;
    if (selectedTemplate.type === "bundled") {
        copyTemplateFiles(templateDir, projectDir, templateConfig);
    } else if (selectedTemplate.type === "git") {
        consola.start(`Cloning ${selectedTemplate.url} into ${projectDir}`);
        execSync(`npx degit ${selectedTemplate.url} ${projectDir}`);
        for (const file of fs.readdirSync(projectDir)) {
            if (
                ["_template.yml"].concat(templateConfig.ignore ?? []).some((glob) => {
                    return minimatch(file, glob, { matchBase: true });
                })
            ) {
                // Remove every file that matches a glob pattern in ignore
                fs.removeSync(path.join(projectDir, file));
            }
        }
    }
    await runTemplateSetup(projectDir, templateConfig);
}

export function copyTemplateFiles(
    templateDir: string,
    projectDir: string,
    templateConfig: TemplateConfig,
) {
    // TODO: add progress bar when copying
    consola.start(chalk.yellow("Copying template..."));
    fs.copySync(templateDir, projectDir, {
        overwrite: true,
        filter: (src, dest) => {
            return !["_template.yml"].concat(templateConfig.ignore ?? []).some((glob) => {
                return minimatch(src, glob, { matchBase: true });
            });
        },
    });
    consola.success(chalk.greenBright("Template copied successfully"));
}

export async function runTemplateSetup(projectDir: string, templateConfig: TemplateConfig) {
    if (templateConfig.commands) {
        consola.start("Running template setup...");
        const answers = await inquirer.prompt<{ commands: string[] }>([
            {
                type: "checkbox",
                name: "commands",
                message: "Which command would you like to run in your project directory?",
                choices: templateConfig.commands,
            },
        ]);
        if (answers.commands) {
            for (const command of answers.commands) {
                consola.start(chalk.greenBright(`Running command: ${command}`));
                execSync(command, { cwd: projectDir });
            }
        }
    }
}

export function readTemplateConfig(configPath: string) {
    let templateConfig: TemplateConfig = {};
    if (fs.existsSync(configPath)) {
        templateConfig = yml.parse(fs.readFileSync(configPath, "utf8"));
    }
    return templateConfig;
}
