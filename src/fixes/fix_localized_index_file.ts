import Writer from "../utils/writer";

export async function fixLocalizedIndexFiles(langs: string[]) {
    await Writer.fixMissingLocalizedIndexFiles(langs)
}

if (require.main === module) {
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

    fixLocalizedIndexFiles(langs)
}