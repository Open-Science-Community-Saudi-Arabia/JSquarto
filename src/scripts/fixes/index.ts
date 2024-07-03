import ConfigMgr from "../../utils/config_mgr";
import fixCrowdinTranslations from "./fix_crowdin_translation";
import fixDuplicateLanguageReferences from "./fix_duplicate_language_refs";
import fixLocalizedIndexFiles from "./fix_localized_index_file";
import fixAndStyleArabicHtmlFiles from "./fix_rtl";
import fixWrongLanguageReferences from "./fix_wrong_language_refs";

export default class Fixes {
    static async run() {
        ConfigMgr.updateConfigStore();

        // await fixLocalizedIndexFiles();
        // await fixDuplicateLanguageReferences();
        // await fixWrongLanguageReferences();
        await fixAndStyleArabicHtmlFiles();
    }

    static fixCrowdinTranslations = fixCrowdinTranslations;
    static fixLocalizedIndexFiles = fixLocalizedIndexFiles;
    static fixDuplicateLanguageReferences = fixDuplicateLanguageReferences;
    static fixWrongLanguageReferences = fixWrongLanguageReferences;
    static fixAndStyleArabicHtmlFiles = fixAndStyleArabicHtmlFiles;
}

if (require.main === module) {
    Fixes.run();
}
