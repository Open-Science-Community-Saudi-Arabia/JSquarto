import CONFIG from "../config";
import { fixDuplicateLanguageReferences } from "./fix_duplicate_language_refs";
import { fixLocalizedIndexFiles } from "./fix_localized_index_file";
import { fixWrongLanguageReferences } from "./fix_wrong_language_refs";

async function start() {
    const langs = process.argv
        .find((arg) => arg.startsWith("languages"))
        ?.split("=")[1]
        ?.split(",");

    if (!langs) {
        console.warn(
            "Languages not specified in cli arguments, setting languages to default",
        );
    }

    CONFIG.languages = langs ?? CONFIG.languages;

    await fixLocalizedIndexFiles();
    await fixDuplicateLanguageReferences();
    await fixWrongLanguageReferences();
}

start();

