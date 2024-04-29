import * as Cheerio from "cheerio";
import fs from 'fs'
import logger from "../utils/logger";
import path from "path";



export async function fixDuplicateLanguageReferences(languages: string[]) {
    // Get the index files for each language
    for (const lang of languages) {
        const directoryForHtmlFiles = path.join(__dirname, `../../docs/_book/${lang}/`);

        logger.info('Reading index file for language: ' + lang)
        const indexFile = await fs.promises.readFile(directoryForHtmlFiles + `index.${lang}.html`, "utf-8");
        logger.info('Finished reading index file for language: ' + lang)

        // Get the html elements (anchor elements) with classname 'dropdown-item' from each index file
        const $ = Cheerio.load(indexFile);
        const dropdownItems = $('.dropdown-item');
        const uniqueItems = new Set();

        // Remove duplicate elements from index file (use the href as the unique idendifier)
        dropdownItems.each((index, element) => {
            logger.info('Removing duplicate items from index file for language: ' + lang)
            const href = $(element).attr('href');
            if (uniqueItems.has(href)) {
                $(element).remove();
            }
            uniqueItems.add(href);
        });

        await fs.promises.writeFile(directoryForHtmlFiles + `index.${lang}.html`, $.html());
        logger.info('Finished removing duplicate items from index file for language: ' + lang)
    }
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

    fixDuplicateLanguageReferences(langs)
}