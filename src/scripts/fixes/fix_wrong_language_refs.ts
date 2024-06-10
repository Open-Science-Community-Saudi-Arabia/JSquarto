import * as Cheerio from "cheerio";
import fs from "fs";
import logger from "../../utils/logger";
import path from "path";
import ConfigMgr from "../../utils/config_mgr";

export default async function fixWrongLanguageReferences() {
    const CONFIG = ConfigMgr.getConfig();
    const languages = CONFIG.languages;

    // Get the index files for each language
    for (const lang of languages.slice(1)) {
        const directoryForHtmlFiles = path.join(
            CONFIG.outputDirectory,
            `/_book/${lang}/`,
        );

        logger.info("Reading index file for language: " + lang);
        const indexFile = await fs.promises.readFile(
            directoryForHtmlFiles + `index.${lang}.html`,
            "utf-8",
        );
        logger.info("Finished reading index file for language: " + lang);

        // Get the html elements (anchor elements) with classname 'dropdown-item' from each index file
        const $ = Cheerio.load(indexFile);

        // Get the html element referencing the main language
        const mainLang = $(`#language-link-${languages[0]}`);

        // Correct the href attribute of the main language element
        mainLang.attr("href", `../index.html`);

        // Get the html elements referencing the other languages
        const otherLangs = languages.slice(1).map((code) => ({
            code: code,
            htmlRef: $(`#language-link-${code}`),
        }));

        // Correct the href attribute of the other language elements
        logger.info("Correcting href attribute of other language elements");
        otherLangs.forEach((language) =>
            language.htmlRef.attr(
                "href",
                `../${language.code}/index.${language.code}.html`,
            ),
        );
        logger.info(
            "Finished correcting href attribute of other language elements",
        );

        await fs.promises.writeFile(
            directoryForHtmlFiles + `index.${lang}.html`,
            $.html(),
        );
        logger.info("Updated index file for language: " + lang);
    }
}

if (require.main === module) {
    fixWrongLanguageReferences();
}
