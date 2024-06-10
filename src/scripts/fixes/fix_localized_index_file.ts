import Writer from "../../utils/writer";
import ConfigMgr from "../../utils/config_mgr";
const CONFIG = ConfigMgr.getConfig();

export default async function fixLocalizedIndexFiles() {
    const langs = CONFIG.languages;
    await Writer.fixMissingLocalizedIndexFiles(langs);
}

if (require.main === module) {
    fixLocalizedIndexFiles();
}
