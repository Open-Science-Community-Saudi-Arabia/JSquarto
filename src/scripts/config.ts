import CliArgParser from "../utils/arg-parser";
import ConfigMgr from "../utils/config_mgr";
import logger from "../utils/logger";

const command = CliArgParser.getArgs().get("command");

switch (command) {
    case "init":
        ConfigMgr.initializeConfigFile();
        break;
    case "set":
        ConfigMgr.setConfigInFile();
        break;
    case "get":
        // const configValue = ConfigMgr.getConfigValue();
        // logger.info(configValue);
        break;
    default:
        logger.error("Invalid command");
        break;
}
