import Writer from "../utils/writer";

export function fixLocalizedIndexFiles(langs: string[]) {
    Writer.fixMissingLocalizedIndexFiles(langs)
}

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