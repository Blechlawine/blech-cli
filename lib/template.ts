import chalk from "chalk";
import { minimatch } from "minimatch";
import fs from "fs-extra";
import { execSync } from "child_process";
import inquirer from "inquirer";
import * as yml from "yaml";
import consola from "consola";

export function copyTemplateFiles(
    templateDir: string,
    projectDir: string,
    templateConfig: TTemplateConfig,
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

export async function runTemplateSetup(projectDir: string, templateConfig: TTemplateConfig) {
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
    let templateConfig: TTemplateConfig = {};
    if (fs.existsSync(configPath)) {
        templateConfig = yml.parse(fs.readFileSync(configPath, "utf8"));
    }
    return templateConfig;
}
