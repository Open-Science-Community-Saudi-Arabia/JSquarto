import ConfigMgr from "../utils/config_mgr";
import { fixDuplicateLanguageReferences } from "./fix_duplicate_language_refs";
import { fixLocalizedIndexFiles } from "./fix_localized_index_file";
import { fixAndStyleArabicHtmlFiles } from "./fix_rtl";
import { fixWrongLanguageReferences } from "./fix_wrong_language_refs";

async function start() {
    ConfigMgr.updateConfigStore();

    await fixLocalizedIndexFiles();
    await fixDuplicateLanguageReferences();
    await fixWrongLanguageReferences();
    await fixAndStyleArabicHtmlFiles();
}

start();
