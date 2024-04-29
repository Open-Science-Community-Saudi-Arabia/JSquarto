import { fixDuplicateLanguageReferences } from "./fix_duplicate_language_refs";
import { fixLocalizedIndexFiles } from "./fix_localized_index_file";

async function start() {
    const langs = process.argv
        .find((arg) => arg.startsWith("languages"))
        ?.split("=")[1]
        ?.split(",");

    if (!langs) {
        console.log(
            "Please provide languages to create localized docs for using the languages flag",
        );
        process.exit(1);
    }

    await fixDuplicateLanguageReferences(langs)
    await fixLocalizedIndexFiles(langs)
    await fixLocalizedIndexFiles(langs)
}

start()