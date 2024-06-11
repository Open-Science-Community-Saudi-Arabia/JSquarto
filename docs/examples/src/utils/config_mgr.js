"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = __importDefault(require("./logger"));
const config_json_1 = __importDefault(require("../../config.json"));
const arg_parser_1 = __importDefault(require("./arg-parser"));
class ConfigMgr {
    static getArgsFromCli() {
        const args = process.argv.slice(2);
        const argMap = new Map();
        // Find working directory
        for (let i = 0; i < args.length; i++) {
            const arg = args[i];
            if (arg.startsWith("workingDir")) {
                // Directory where user called the `jsq` command from
                // Will be used to resolve relative paths
                this.currentWorkingDirectory = arg.split("=")[1];
                break;
            }
        }
        if (!this.currentWorkingDirectory) {
            logger_1.default.error("No working directory provided");
            process.exit(1);
        }
        const parser = arg_parser_1.default.pullCliArguments();
        console.log({ parser });
        for (let i = 0; i < args.length; i++) {
            const arg = args[i];
            let [key, value] = arg.split("=");
            if (key === "source" ||
                key === "output" ||
                key === "tutorial" ||
                key === "translations") {
                value = `${this.currentWorkingDirectory}/${value}`;
            }
            argMap.set(key.startsWith("--") ? key.slice(2) : key, value);
        }
        return argMap;
    }
    static updateConfigStore() {
        const cliArgs = this.getArgsFromCli();
        const currentConfig = this.CONFIG;
        const configToUpdate = {};
        for (const entries of cliArgs.entries()) {
            const [cliKey, cliValue] = entries;
            if (cliValue) {
                const _key = this.configMap[cliKey];
                if (_key === "languages") {
                    configToUpdate[_key] = cliValue.split(",");
                }
                else if (_key === "includeLocalizedVersions") {
                    configToUpdate[_key] = cliValue ? true : false;
                }
                else {
                    configToUpdate[_key] = cliValue;
                }
            }
            else {
                logger_1.default.warn(`No value provided for ${cliKey}`);
            }
        }
        const updatedConfig = Object.assign(Object.assign({}, currentConfig), configToUpdate);
        logger_1.default.info("Updating config store...", {
            meta: {
                updatedConfig,
                newData: configToUpdate,
            },
        });
        for (const [key, value] of Object.entries(updatedConfig)) {
            if (key === "languages") {
                this.CONFIG.languages = value;
            }
            else {
                this.CONFIG[key] = value;
            }
        }
        return {
            inputData: configToUpdate,
            config: updatedConfig,
        };
    }
    static getConfig() {
        this.updateConfigStore();
        return this.CONFIG;
    }
}
ConfigMgr.CONFIG = {
    outputDirectory: config_json_1.default.outputDirectory,
    sourceDirectory: config_json_1.default.sourceDirectory,
    tutorialDirectory: config_json_1.default.tutorialDirectory,
    translationsDirectory: config_json_1.default.translationsDirectory,
    includeLocalizedVersions: config_json_1.default.includeLocalizedVersions,
    languages: config_json_1.default.languages,
};
// keys are the cli arguments, values are the config keys
ConfigMgr.configMap = {
    source: "sourceDirectory",
    output: "outputDirectory",
    tutorial: "tutorialDirectory",
    include_localized_versions: "includeLocalizedVersions",
    languages: "languages",
    translations: "translationsDirectory",
};
exports.default = ConfigMgr;
