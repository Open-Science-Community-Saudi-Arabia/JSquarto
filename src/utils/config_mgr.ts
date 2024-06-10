import { ValueOf } from "../interfaces";
import logger from "./logger";
import config from "../config.json";
import CliArgParser from "./arg-parser";
import path from "path";
import fs, { copyFileSync } from "fs";
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
    force: "force";
}

export interface ExternalConfig {
    configDirectory: string;
    force: boolean;
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
const dirConfigKeys = [
    "translationsDirectory",
    "sourceDirectory",
    "outputDirectory",
    "tutorialDirectory",
    "configDirectory",
] as const;
type DirConfigKeys = (typeof dirConfigKeys)[number];
export default class ConfigMgr {
    private static CONFIG = DEFAULT_CONFIG as Config & ExternalConfig;
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
        force: "force",
    } as const;

    static ensureFileExists(filePath: string) {
        logger.info("Checking if file exists", { filePath });
        const dirPath = path.dirname(filePath);

        fs.mkdirSync(dirPath, { recursive: true });

        const fileExists = fs.existsSync(filePath);
        if (!fileExists) {
            fs.writeFileSync(filePath, "{}");
        }
    }

    private static addProjectConfigPathToStore({
        projectDir,
        configDir,
    }: {
        projectDir: string;
        configDir: string;
    }) {
        console.log({ configDir });
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

        logger.info("Updating config path store...", {
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

        logger.info("Config paths store updated successfully", {
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

    private static getConfigForProject({ projectDir }: { projectDir: string }) {
        const projectConfig = this.getProjectConfigPath({ projectDir });
        if (!projectConfig || !projectConfig.configDir) {
            logger.warn("No config found for project");
            return {};
        }

        const configFileExists = fs.existsSync(projectConfig.configDir);
        if (!configFileExists) {
            logger.warn("Config path in store but file doesn't exist");
            return {};
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
                configToUpdate[_key] = cliValue != "false";
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

    private static updateProjectConfigFile({
        configToUpdate,
        workingDir,
        force,
    }: {
        workingDir: string;
        force: boolean;
        configToUpdate: Config & ExternalConfig;
    }) {
        const DEFAULT_PATH_FOR_CONFIG = path.resolve(
            workingDir + "/.jsquarto/config.json",
        );

        // If configDir is folder add .jsquarto/config.json to the path
        const projectConfigDirInStore = this.getProjectConfigPath({
            projectDir: workingDir,
        })?.configDir;
        configToUpdate["configDirectory"] =
            configToUpdate["configDirectory"] ?? // If no config path is provided, use the project's config path
            projectConfigDirInStore ?? // If no config path saved in store use default path
            DEFAULT_PATH_FOR_CONFIG;

        const configDir = path.resolve(configToUpdate["configDirectory"]);
        const pathStat = fs.statSync(configDir, {
            throwIfNoEntry: false,
        });
        const pathIsDir = pathStat?.isDirectory();
        const defaultConfigDir = path.resolve(workingDir + "/.jsquarto/");

        // If it's a directory, that means the user wants to initialize a new config file
        const pathIsDirAndIsDefault =
            pathIsDir && configDir === defaultConfigDir;
        configToUpdate["configDirectory"] = pathIsDir
            ? pathIsDirAndIsDefault
                ? path.join(configDir, "config.json")
                : path.join(configDir, "/.jsquarto/config.json")
            : configDir;

        const updatedConfig = {
            ...this.getConfigForProject({ projectDir: workingDir }),
            ...configToUpdate,
        };

        if (Object.keys(configToUpdate).length == 0) {
            return {
                config: updatedConfig,
                inputData: configToUpdate,
            };
        }

        logger.info("Updating config store...", {
            meta: {
                updatedConfig,
                newData: configToUpdate,
            },
        });

        // Update config in  project config config file
        if (!projectConfigDirInStore) {
            logger.warn("No config found for project");
        }

        const configDirInStoreExists =
            projectConfigDirInStore && fs.existsSync(projectConfigDirInStore);
        const configFileFromArgsExists = fs.existsSync(
            configToUpdate["configDirectory"],
        );
        const configFileExists =
            configDirInStoreExists || configFileFromArgsExists;
        const forcefullyUpdateNonExistentFile = force && !configFileExists;
        const upsertConfigFile =
            configFileExists || forcefullyUpdateNonExistentFile;
        if (upsertConfigFile) {
            this.upsertProjectConfigFileIfForce({
                path: configToUpdate["configDirectory"],
                config: configToUpdate,
            });
        } else {
            throw new Error(
                "No config file found at specified path. Use the --force flag to create a new config file",
            );
        }

        this.configHasBeenUpdated = true;

        logger.info("Config file updated successfully");
        this.addProjectConfigPathToStore({
            projectDir: this.currentWorkingDirectory,
            configDir: configToUpdate["configDirectory"],
        });
    }

    static updateConfigStore(): {
        config: Config & ExternalConfig;
        inputData: Partial<Config>;
    } {
        const cliArgs = CliArgParser.getArgs();

        const workingDir = cliArgs.get("workingDirectory");
        if (!workingDir) {
            throw new Error("No working directory provided");
        }
        this.currentWorkingDirectory = workingDir;

        const currentConfig = {
            ...this.CONFIG,
            ...this.getConfigForProject({ projectDir: workingDir }),
        };

        // Extract data to update
        const configToUpdate = this.transformCliArgsToConfigData({
            config: { ...currentConfig },
            cliArgs: Object.fromEntries(cliArgs),
        });
        const updatedConfig = { ...currentConfig, ...configToUpdate };
        const nothingToUpdate = Object.keys(configToUpdate).length === 0;
        if (nothingToUpdate) {
            return {
                config: updatedConfig,
                inputData: configToUpdate,
            };
        }

        Object.entries(configToUpdate).forEach(([key, value], index) => {
            logger.info("Updating config store", { meta: { key, value } });
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

            const lastEntry =
                index === Object.entries(configToUpdate).length - 1;
            lastEntry && logger.info("Config updated successfully");
        });

        return {
            inputData: configToUpdate,
            config: updatedConfig,
        };
    }

    private static upsertProjectConfigFileIfForce({
        path: filePath,
        config,
    }: {
        path: string;
        config?: Config;
    }) {
        const fileExists = fs.existsSync(filePath);
        let updatedConfig = config ?? {};
        if (fileExists) {
            const configInFile = fs.readFileSync(
                path.resolve(filePath),
                "utf-8",
            );
            const config = JSON.parse(configInFile);
            updatedConfig = { ...config, ...updatedConfig };
        } else {
            logger.warn("Creating new config file...");
            fs.mkdirSync(path.dirname(filePath), {
                recursive: true,
            });
        }

        fs.writeFileSync(filePath, JSON.stringify(config, null, 4));
    }

    static initializeConfigFile() {
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
        !configFileExists && this.ensureFileExists(configPath);

        const { projectDir } = this.addProjectConfigPathToStore({
            projectDir: currentWorkingDirectory,
            configDir: configPath,
        });

        return {
            projectDir,
            configDir: configPath,
        };
    }

    static writeConfigToFile() {
        const cliArgs = CliArgParser.getArgs();
        const workingDir = cliArgs.get("workingDirectory");
        if (!workingDir) {
            logger.error("No working directory provided");
            process.exit(1);
        }

        this.currentWorkingDirectory = workingDir;

        let configPath = this.getProjectConfigPath({
            projectDir: workingDir,
        })?.configDir;
        const configFileExists = configPath && fs.existsSync(configPath);

        // Check if user is trying to set the path to a new config file
        const configPathFromArgs = cliArgs.get("config");
        if (configPathFromArgs) {
            configPath = path.isAbsolute(configPathFromArgs)
                ? path.resolve(configPathFromArgs)
                : path.resolve(workingDir, configPathFromArgs);

            const configFileExists = fs.existsSync(configPath);
            if (!configFileExists) {
                throw new Error("No config file found at specified path");
            }

            this.addProjectConfigPathToStore({
                projectDir: workingDir,
                configDir: configPath,
            });
        }

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

        // Remove cli commands from keys
        config = Object.fromEntries(
            Object.entries(config).filter(
                ([key, _]) => !key.includes("config") && !key.includes("force"),
            ),
        );

        fs.writeFileSync(configPath, JSON.stringify(config, null, 4));
        logger.info("Config file written successfully");
    }

    static getConfig(): Config {
        let config = DEFAULT_CONFIG;
        let configFromCli = {};

        const configForProject = this.getConfigForProject({
            projectDir: this.currentWorkingDirectory,
        });

        if (this.configHasBeenUpdated) {
            config = { ...config, ...this.CONFIG };
        } else {
            configFromCli = this.updateConfigStore().config;
        }
        console.log({ config, configForProject, configFromCli });

        const finalConfig = {
            ...config,
            ...configForProject,
            ...configFromCli,
        } as Config & ExternalConfig;

        // Resolve all directories in config
        for (const key in finalConfig) {
            const _key = key as DirConfigKeys;
            if (key.includes("Directory")) {
                finalConfig[_key] = path.resolve(finalConfig[_key]);
            }
        }

        return finalConfig;
    }
}

/**
 * Specify path to config file in any project
 * The config in that path should be used whenever a jsq command is run within the project
 * Find a way to reference the config if even if you're in a subdirectory of the project
 * */
