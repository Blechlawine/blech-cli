import chalk from "chalk";
import minimatch from "minimatch";
import path from "path";
import fs from "fs-extra";
import { execSync } from "child_process";
import inquirer from "inquirer";

export function copyTemplateFiles(templateDir: string, projectDir: string, templateConfig: TTemplateConfig) {
    // TODO: add progress bar when copying
    console.log(chalk.yellow("Copying template..."));
    fs.copySync(templateDir, projectDir, {
        overwrite: true,
        filter: (src, dest) => {
            return !["_template.yml"].concat(templateConfig.ignore ?? []).some((glob) => {
                return minimatch(src, glob, { matchBase: true });
            });
        },
    });
    console.log(chalk.greenBright("Template copied successfully"));
}

export async function runTemplateSetup(projectDir: string, templateConfig: TTemplateConfig) {
    if (templateConfig.commands) {
        console.log("Running template setup...");
        console.log(chalk.redBright("Going to run these commands in your project directory:"));
        for (const command of templateConfig.commands) {
            console.log(` | ${command}`);
        }
        const { confirmed } = await inquirer.prompt([
            {
                type: "confirm",
                name: "confirmed",
                default: true,
                message: "Do you want to continue?",
            },
        ]);
        if (confirmed) {
            for (const command of templateConfig.commands) {
                console.log(chalk.greenBright(`Running command: ${command}`));
                execSync(command, { cwd: projectDir });
            }
        }
    }
}
