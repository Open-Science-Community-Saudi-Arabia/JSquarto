import ConfigMgr from "../utils/config_mgr";
import CliArgParser from "../utils/arg-parser";
import Fixes from "./fixes";
import logger from "../utils/logger";
import { generateDoc } from "./gen_doc";
import { execSync } from "child_process";

const command = CliArgParser.getArgs().get("command");

const CONFIG = ConfigMgr.getConfig();
switch (command) {
    case "config:init":
        ConfigMgr.initializeConfigFile();
        break;
    case "config:set":
        ConfigMgr.writeConfigToFile();
        break;
    case "config:get":
        logger.info(CONFIG);
        break;
    case "doc:generate":
        generateDoc();
        break;
    case "doc:preview":
        const shellCommand = `quarto preview  ${CONFIG.outputDirectory}`;

        logger.info("Starting quarto server...");

        execSync(shellCommand, {
            stdio: "inherit",
        });
        break;
    case "doc:clean":
        logger.info("Cleaning up...");

        execSync(`rm -rf ${CONFIG.outputDirectory}`, {
            stdio: "inherit",
        });
        break;
    case "doc:serve":
        logger.info("Serving documentation...");

        execSync(`serve ${CONFIG.outputDirectory}/_book`, {
            stdio: "inherit",
        });
        break;
    case "fix:all":
        Fixes.run();
        break;
    case "fix:crowdin_files":
        Fixes.fixCrowdinTranslations();
        break;
    case "fix:localized_files":
        Fixes.fixLocalizedIndexFiles();
        break;
    case "fix:duplicate_languages_ref":
        Fixes.fixDuplicateLanguageReferences();
        break;
    case "fix:wrong_languages_ref":
        Fixes.fixWrongLanguageReferences();
        break;
    default:
        logger.error("Invalid command");
        break;
}
