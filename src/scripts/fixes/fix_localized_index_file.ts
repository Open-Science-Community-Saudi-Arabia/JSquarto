import Writer from "../../utils/writer";
import ConfigMgr from "../../utils/config_mgr";

export default async function fixLocalizedIndexFiles() {
    const CONFIG = ConfigMgr.getConfig();
    const langs = CONFIG.languages;
    await Writer.fixMissingLocalizedIndexFiles(langs);
}

if (require.main === module) {
    fixLocalizedIndexFiles();
}
