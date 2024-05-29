import * as Cheerio from "cheerio";
import fs from "fs";
import logger from "../utils/logger";
import path from "path";
import ConfigMgr from "../utils/config_mgr";
const CONFIG = ConfigMgr.getConfig();

export async function fixDuplicateLanguageReferences() {
    const languages = CONFIG.languages;
    // Get the index files for each language
    for (const lang of languages.slice(1)) {
        const directoryForHtmlFiles = path.join(
            CONFIG.outputDirectory,
            `_book/${lang}/`,
        );

        logger.info("Reading index file for language: " + lang);
        const indexFile = await fs.promises.readFile(
            directoryForHtmlFiles + `index.${lang}.html`,
            "utf-8",
        );
        logger.info("Finished reading index file for language: " + lang);

        // Get the html elements (anchor elements) with classname 'dropdown-item' from each index file
        const $ = Cheerio.load(indexFile);
        const dropdownItems = $(".dropdown-item");
        const uniqueItems = new Set();

        // Remove duplicate elements from index file (use the href as the unique idendifier)
        dropdownItems.each((index, element) => {
            logger.info(
                "Removing duplicate items from index file for language: " +
                    lang,
            );
            const href = $(element).attr("href");
            if (uniqueItems.has(href)) {
                $(element).remove();
            }
            uniqueItems.add(href);
        });

        await fs.promises.writeFile(
            directoryForHtmlFiles + `index.${lang}.html`,
            $.html(),
        );
        logger.info(
            "Finished removing duplicate items from index file for language: " +
                lang,
        );
    }
}

if (require.main === module) {
    fixDuplicateLanguageReferences();
}
