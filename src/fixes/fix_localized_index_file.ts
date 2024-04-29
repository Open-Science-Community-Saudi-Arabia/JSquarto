import Writer from "../utils/writer";

const langs = process.argv
    .find((arg) => arg.startsWith("languages"))
    ?.split("=")[1]
    ?.split(",");
console.log({
    langs: langs,
    include: process.env.npm_create_localized_docs,
    args: process.argv,
});

if (process.env.npm_create_localized_docs && !langs) {
    console.log(
        "Please provide languages to create localized docs for using the languages flag",
    );
    process.exit(1);
}


Writer.fixMissingLocalizedIndexFiles(langs ?? [])