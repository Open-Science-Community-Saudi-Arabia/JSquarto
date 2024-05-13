import CONFIG from "../config";
import Writer from "../utils/writer";

export async function fixLocalizedIndexFiles() {
    const langs = CONFIG.languages;
    await Writer.fixMissingLocalizedIndexFiles(langs);
}

if (require.main === module) {
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

    fixLocalizedIndexFiles();
}

