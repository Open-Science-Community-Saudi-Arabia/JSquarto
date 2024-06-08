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
    config: "configDirectory";
}

interface ProjectConfig {
    paths: { projectDir: string; configDir: string }[];
}

type CliArgs = Partial<{ [k in keyof ConfigMap]: string }>;

const DEFAULT_CONFIG = {
    outputDirectory: config.outputDirectory,
    sourceDirectory: config.sourceDirectory,
    tutorialDirectory: config.tutorialDirectory,
    translationsDirectory: config.translationsDirectory,
    includeLocalizedVersions: config.includeLocalizedVersions,
    languages: config.languages,
};
export default class ConfigMgr {
    private static CONFIG = DEFAULT_CONFIG as Config & {
        configDirectory: string;
    };
    private static configHasBeenUpdated = false;
    private static currentWorkingDirectory: string;
    private static projectConfigPaths: ProjectConfig["paths"] | null = null;
    static configMap: ConfigMap = {
        source: "sourceDirectory",
        output: "outputDirectory",
        tutorial: "tutorialDirectory",
        include_localized_versions: "includeLocalizedVersions",
        languages: "languages",
        translations: "translationsDirectory",
        config: "configDirectory",
    } as const;

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

        // Check if project path already exists in store
        const projectPathExists = config.paths.some(
            (path: { projectDir: string }) => path.projectDir === projectDir,
        );
        if (projectPathExists) {
            logger.warn("Project path already exists in store, updating...");
            const projectIndex = config.paths.findIndex(
                (path: { projectDir: string }) =>
                    path.projectDir === projectDir,
            );

            config.paths[projectIndex] = {
                projectDir,
                configDir,
            };
        } else {
            logger.info("Adding project path to store...");
            config.paths.push({ projectDir, configDir });
        }

        const updatedConfig = {
            paths: config.paths,
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

    private static getProjectConfigPath({
        projectDir,
    }: {
        projectDir: string;
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

    private static async getConfigForProject({
        projectDir,
    }: {
        projectDir: string;
    }) {
        const projectConfig = this.getProjectConfigPath({ projectDir });
        if (!projectConfig || !projectConfig.configDir) {
            logger.warn("No config found for project");
            return {};
        }

        const configFileExists = fs.existsSync(projectConfig.configDir);
        if (!configFileExists) {
            logger.error("Config path in store but file doesn't exist");
            process.exit(1);
        }

        const configFile = fs.readFileSync(projectConfig.configDir, "utf-8");
        const config = JSON.parse(configFile) as Config;

        return config;
    }

    private static transformCliArgsToConfigData({
        config: configToUpdate,
        cliArgs,
    }: {
        config: Config & ExternalConfig;
        cliArgs: CliArgs;
    }) {
        const allowedConfigKeys = Object.keys(this.configMap);
        // const booleanConfigKeys = ["includeLocalizedVersions", "force"] as (keyof ConfigMap)[];
        const dirConfigKeys = [
            "translationsDirectory",
            "sourceDirectory",
            "outputDirectory",
            "tutorialDirectory",
            "configDirectory",
        ] as const;

        for (const entry of Object.entries(cliArgs)) {
            const configKeyIsAllowed = allowedConfigKeys.includes(
                entry[0] as string,
            );
            if (!configKeyIsAllowed) {
                continue;
            }

            const [cliKey, cliValue] = entry as [
                keyof CliArgs,
                ValueOf<CliArgs>,
            ];
            const _key = this.configMap[cliKey];

            if (_key === "includeLocalizedVersions" || _key === "force") {
                console.log({ equal: cliValue === "true" });
                configToUpdate[_key] = (cliValue as unknown) != false;
                continue;
            }

            if (!cliValue) {
                logger.warn(`No value provided for ${cliKey}`);
                continue;
            }

            if (_key === "languages") {
                configToUpdate[_key] = cliValue!.split(",");
            } else if (dirConfigKeys.includes(_key)) {
                configToUpdate[_key] = path.join(
                    this.currentWorkingDirectory,
                    cliValue,
                );
            } else {
                configToUpdate[_key] = cliValue;
            }
        }

        return configToUpdate;
    }

            this.updateProjectPathsToConfigRecord({
                projectDir: this.currentWorkingDirectory,
                configDir: configToUpdate["configDirectory"],
            });
        }
        const updatedConfig = { ...currentConfig, ...configToUpdate };

        // If there is new data to update, save to class  instance variable and project config file
        if (Object.keys(configToUpdate).length !== 0) {
            logger.info("Updating config store...", {
                meta: {
                    updatedConfig,
                    newData: configToUpdate,
                },
            });

            for (const [key, value] of Object.entries(configToUpdate)) {
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

            // Update config in  project config config file
            const projectConfig = this.getProjectConfigPath({
                projectDir: this.currentWorkingDirectory,
            });
            if (!projectConfig || !projectConfig.configDir) {
                logger.error("No config found for project");
                process.exit(1);
            }

            const configFileExists = fs.existsSync(projectConfig.configDir);
            if (!configFileExists) {
                logger.error("No config file found for project");
                process.exit(1);
            }

            fs.writeFileSync(
                projectConfig.configDir,
                JSON.stringify(configToUpdate, null, 4),
            );

            this.configHasBeenUpdated = true;
            logger.info("Config file updated successfully");
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
            throw new Error("No working directory provided");
        }

        const DEFAULT_PATH_FOR_CONFIG = path.join(
            currentWorkingDirectory,
            "/.jsquarto/config.json",
        );

        let configPath = cliArgument.get("config") ?? null;
        configPath = configPath
            ? path.isAbsolute(configPath)
                ? path.resolve(configPath)
                : path.resolve(currentWorkingDirectory, configPath)
            : null;

        // const updatedConfig = this.updateConfigStore().config;
        //
        // logger.info("Writing updated config to file...", {
        //     meta: {
        //         updatedConfig,
        //     },
        // });

        const projectConfigPathSavedInStore = this.getProjectConfigPath({
            projectDir: currentWorkingDirectory,
        })?.configDir;
        let configFileFromArgsExists = configPath && fs.existsSync(configPath);

        if (
            configPath &&
            configFileFromArgsExists &&
            fs.statSync(configPath).isDirectory()
        ) {
            configPath = path.join(configPath, ".jsquarto/config.json");
            configFileFromArgsExists = fs.existsSync(configPath);
        }

        const configFileAlreadyExists =
            projectConfigPathSavedInStore || configFileFromArgsExists;
        const configExistsInDefaultPath = fs.existsSync(
            DEFAULT_PATH_FOR_CONFIG,
        );

        // If it's a directory, that means the user wants to initialize a new config file
        // Default config can exists in cases where it was initialized from another device or manually created
        // In this case the store wouldn't have a record of it
        if (configFileAlreadyExists || configExistsInDefaultPath) {
            const forceOverwrite = cliArgument.has("force");
            // If the config dir passed already exists, we should overwrite
            // The --force flagg is required to overwrite any record
            if (!forceOverwrite) {
                let msg = "";
                if (configFileFromArgsExists || configExistsInDefaultPath) {
                    msg = `An existing config file was found at ${configPath ?? DEFAULT_PATH_FOR_CONFIG}`;
                } else {
                    msg = `An existing record was set for ${projectConfigPathSavedInStore ?? DEFAULT_PATH_FOR_CONFIG}`;
                }
                msg += `\n Run 'jsq config:init --force' to overwrite the current record or \n Run 'jsq config:set --config <path>' to set a new config file path
                             `;
                throw new Error(msg);
            }

            logger.warn("Overwriting existing config file...");
        }

        configPath = configPath ?? DEFAULT_PATH_FOR_CONFIG;

        const configFileExists = fs.existsSync(configPath);
        !configFileExists &&
            fs.mkdirSync(path.dirname(configPath), {
                recursive: true,
            });

        const { projectDir } = this.addProjectConfigPathToStore({
            projectDir: currentWorkingDirectory,
            configDir: configPath,
        });

        return {
            projectDir,
            configDir: configPath,
            config: updatedConfig,
        };
    }

    static writeConfigToFile() {
        const cliArgs = CliArgParser.getArgs();
        const workingDir = cliArgs.get("workingDirectory");
        if (!workingDir) {
            logger.error("No working directory provided");
            process.exit(1);
        }

        let configPath = this.getProjectConfigPath({
            projectDir: workingDir,
        })?.configDir;
        const configFileExists = configPath && fs.existsSync(configPath);

        configPath = configFileExists
            ? configPath
            : this.initializeConfigFile().configDir;

        // Just for typescript sake
        if (!configPath) {
            throw new Error("No config file found");
        }

        let config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
        config = this.transformCliArgsToConfigData({
            config,
            cliArgs: Object.fromEntries(cliArgs),
        });

        logger.info("Writing updated config to file...", {
            meta: {
                updatedConfig: config,
            },
        });

        fs.writeFileSync(configPath, JSON.stringify(config, null, 4));
        logger.info("Config file written successfully");
    }

    static getConfig(): Config {
        let config = DEFAULT_CONFIG;

        if (this.configHasBeenUpdated) {
            config = { ...config, ...this.CONFIG };
        } else {
            const updatedConfig = this.updateConfigStore().config;
            config = { ...config, ...updatedConfig };
        }

        return config;
    }
}

/**
 * Specify path to config file in any project
 * The config in that path should be used whenever a jsq command is run within the project
 * Find a way to reference the config if even if you're in a subdirectory of the project
 * */
