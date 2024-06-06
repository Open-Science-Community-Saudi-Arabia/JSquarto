import { ValueOf } from "../interfaces";
import logger from "./logger";
import config from "../../config.json";
import CliArgParser from "./arg-parser";
import path from "path";
import fs from "fs";
import { PROJECTS_CONFIG_STORE_PATH } from "../constants";

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

interface ProjectConfig {
    paths: { projectDir: string; configDir: string }[];
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
    private static projectConfigPaths: ProjectConfig["paths"] | null = null;

    private static async updateProjectPathsToConfigRecord({
        projectDir,
        configDir,
    }: {
        projectDir: string;
        configDir: string;
    }) {
        const configFileExists = fs.existsSync(configDir);
        if (!configFileExists) {
            logger.error("No config file found");
            process.exit(1);
        }

        // Get current records of project paths
        const configStore = fs.readFileSync(
            PROJECTS_CONFIG_STORE_PATH,
            "utf-8",
        );
        let config = JSON.parse(configStore);

        // Check if our records are empty
        const configStoreIsEmpty = Object.keys(config).length === 0;
        if (configStoreIsEmpty) {
            config = {
                paths: [],
            } as ProjectConfig;
        }

        const updatedConfig = {
            paths: [...config.paths, { projectDir, configDir }],
        };

        logger.info("Updating config store...", {
            meta: {
                currentConfig: config,
                newConfig: updatedConfig,
            },
        });

        // Update the config store
        fs.writeFileSync(
            PROJECTS_CONFIG_STORE_PATH,
            JSON.stringify(updatedConfig, null, 4),
        );

        this.projectConfigPaths = updatedConfig.paths;

        logger.info("Config store updated successfully", {
            meta: {
                updatedConfig,
            },
        });

        return {
            projectDir,
            configDir,
            config: updatedConfig,
        };
    }

    private static async getProjectPathToConfigRecord({
        projectDir,
    }: {
        projectDir: string;
        configDir: string;
    }) {
        if (this.projectConfigPaths) {
            return this.projectConfigPaths.find(
                (config) => config.projectDir === projectDir,
            );
        }

        const storeExists = fs.existsSync(PROJECTS_CONFIG_STORE_PATH);
        if (!storeExists) {
            logger.error("No config store found");
            process.exit(1);
        }

        const configStore = fs.readFileSync(
            PROJECTS_CONFIG_STORE_PATH,
            "utf-8",
        );
        const config = JSON.parse(configStore) as ProjectConfig;

        this.projectConfigPaths = config.paths;

        return {
            projectDir,
            configDir: config.paths.find(
                (config) => config.projectDir === projectDir,
            )?.configDir,
        };
    }

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

        const updatedConfig = this.updateConfigStore().config;

        logger.info("Writing updated config to file...", {
            meta: {
                updatedConfig: updatedConfig,
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

        fs.writeFileSync(configPath, JSON.stringify(updatedConfig, null, 4));
        logger.info("Config file written successfully");
    }

    static async writeConfigToFile() {
        const cliArgs = CliArgParser.getArgs();
        const workingDir = cliArgs.get("workingDirectory");
        if (!workingDir) {
            logger.error("No working directory provided");
            process.exit(1);
        }

        const configFileExists = fs.existsSync(
            workingDir + "/.jsquarto/config.json",
        );
        if (!configFileExists) {
            this.initializeConfigFile();
            process.exit(1);
        }

        const allowedConfigKeys = Object.keys(this.configMap);
        const configToSet = new Map<string, string>();

        for (const [key, value] of cliArgs.entries()) {
            if (allowedConfigKeys.includes(key)) {
                configToSet.set(key, value);
            }
        }

        const configPath = workingDir + "/.jsquarto/config.json";
        const configFile = fs.readFileSync(configPath, "utf-8");
        const config = JSON.parse(configFile);

        for (const [_key, value] of cliArgs.entries()) {
            const key = this.configMap[_key as keyof ConfigMap];

            if (key === "languages") {
                config[key] = value.split(",");
            } else if (key === "includeLocalizedVersions") {
                config[key] = value ? true : false;
            } else if (
                [
                    "translationsDirectory",
                    "sourceDirectory",
                    "outputDirectory",
                    "tutorialDirectory",
                ].includes(key)
            ) {
                config[key] = workingDir + "/" + value;
            } else {
                config[key] = value;
            }
        }

        logger.info("Writing updated config to file...", {
            meta: {
                updatedConfig: config,
            },
        });

        fs.writeFileSync(configPath, JSON.stringify(config, null, 4));
        logger.info("Config file written successfully");
    }

    static getConfig() {
        this.updateConfigStore();
        return this.CONFIG;
    }
}

/**
 * Specify path to config file in any project
 * The config in that path should be used whenever a jsq command is run within the project
 * Find a way to reference the config if even if you're in a subdirectory of the project
 * */
