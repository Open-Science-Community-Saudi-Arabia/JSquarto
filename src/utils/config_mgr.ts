import { ValueOf } from "../interfaces";
import logger from "./logger";
import config from "../../config.json";
import CliArgParser from "./arg-parser";
import path from "path";
import fs from "fs";

export interface Config {
    outputDirectory: string;
    sourceDirectory: string;
    tutorialDirectory: string;
    translationsDirectory: string;
    includeLocalizedVersions: boolean;
    languages: string[];
}

export interface ConfigMap {
    source: "sourceDirectory";
    output: "outputDirectory";
    tutorial: "tutorialDirectory";
    include_localized_versions: "includeLocalizedVersions";
    languages: "languages";
    translations: "translationsDirectory";
}

type CliArgs = Partial<{ [k in keyof ConfigMap]: string }>;

export default class ConfigMgr {
    private static CONFIG = {
        outputDirectory: config.outputDirectory,
        sourceDirectory: config.sourceDirectory,
        tutorialDirectory: config.tutorialDirectory,
        translationsDirectory: config.translationsDirectory,
        includeLocalizedVersions: config.includeLocalizedVersions,
        languages: config.languages,
    } as Config;
    private static currentWorkingDirectory: string;

    // keys are the cli arguments, values are the config keys
    static configMap: ConfigMap = {
        source: "sourceDirectory",
        output: "outputDirectory",
        tutorial: "tutorialDirectory",
        include_localized_versions: "includeLocalizedVersions",
        languages: "languages",
        translations: "translationsDirectory",
    } as const;

    static getArgsFromCli() {
        const cliArguments = CliArgParser.getArgs();
        const workingDir = cliArguments.get("workingDirectory");
        if (!workingDir) {
            logger.error("No working directory provided");
            process.exit(1);
        }

        this.currentWorkingDirectory = workingDir;

        return cliArguments;
    }

    static updateConfigStore(): { config: Config; inputData: Partial<Config> } {
        const cliArgs = this.getArgsFromCli();

        const currentConfig = this.CONFIG;
        const configToUpdate = {} as Config;
        for (const entries of cliArgs.entries()) {
            const [cliKey, cliValue] = entries as [
                keyof CliArgs,
                ValueOf<CliArgs>,
            ];
            if (cliValue) {
                const _key = this.configMap[cliKey];
                if (_key === "languages") {
                    configToUpdate[_key] = cliValue.split(",");
                } else if (_key === "includeLocalizedVersions") {
                    configToUpdate[_key] = cliValue ? true : false;
                } else if (
                    [
                        "translationsDirectory",
                        "sourceDirectory",
                        "outputDirectory",
                        "tutorialDirectory",
                    ].includes(_key)
                ) {
                    configToUpdate[_key] =
                        this.currentWorkingDirectory + "/" + cliValue;
                } else {
                    configToUpdate[_key] = cliValue;
                }
            } else {
                logger.warn(`No value provided for ${cliKey}`);
            }
        }

        const updatedConfig = { ...currentConfig, ...configToUpdate };

        logger.info("Updating config store...", {
            meta: {
                updatedConfig,
                newData: configToUpdate,
            },
        });
        for (const [key, value] of Object.entries(updatedConfig)) {
            if (key === "languages") {
                this.CONFIG.languages = value as string[];
            } else {
                this.CONFIG[
                    key as
                        | "outputDirectory"
                        | "sourceDirectory"
                        | "tutorialDirectory"
                        | "translationsDirectory"
                ] = value as string;
            }
        }

        return {
            inputData: configToUpdate,
            config: updatedConfig,
        };
    }

    static async initializeConfigFile() {
        const cliArgument = CliArgParser.getArgs();

        const currentWorkingDirectory = cliArgument.get("workingDirectory");
        if (!currentWorkingDirectory) {
            console.error("No working directory provided");
            process.exit(1);
        }

        const defaultConfigPath = path.join(
            currentWorkingDirectory,
            "/.jsquarto/config.json",
        );
        const configPath = cliArgument.get("config") ?? defaultConfigPath;

        const updatedConfig = this.updateConfigStore();

        logger.info("Writing updated config to file...", {
            meta: {
                updatedConfig,
            },
        });

        const dirExists = fs.existsSync(path.dirname(configPath));
        if (!dirExists) {
            fs.mkdirSync(path.dirname(configPath), { recursive: true });
        }

        const configFileAlreadyExists = fs.existsSync(configPath);
        if (configFileAlreadyExists) {
            const forceOverwrite = cliArgument.get("force");
            if (!forceOverwrite) {
                logger.error(
                    `Config file already exists at ${configPath}. Use the --force flag to overwrite`,
                );
                process.exit(1);
            }

            // TODO: Ask for confirmation before overwriting
            logger.warn("Overwriting existing config file...");
        }

        fs.writeFileSync(
            configPath,
            JSON.stringify(updatedConfig.config, null, 4),
        );
        logger.info("Config file written successfully");
    }

    static getConfig() {
        this.updateConfigStore();
        return this.CONFIG;
    }
}
