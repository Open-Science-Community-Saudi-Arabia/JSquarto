import * as Cheerio from "cheerio";
import fs from 'fs'
import logger from "../utils/logger";
import path from "path";

export async function fixWrongLanguageReferences(languages: string[]) {
    // Get the index files for each language
    for (const lang of languages) {
        const directoryForHtmlFiles = path.join(__dirname, `../../docs/_book/${lang}/`);

        logger.info('Reading index file for language: ' + lang)
        const indexFile = await fs.promises.readFile(directoryForHtmlFiles + `index.${lang}.html`, "utf-8");
        logger.info('Finished reading index file for language: ' + lang)

        // Get the html elements (anchor elements) with classname 'dropdown-item' from each index file
        const $ = Cheerio.load(indexFile);

        // Get the html element referencing the main language
        const mainLang = $(`#language-link-${languages[0]}`)

        // Correct the href attribute of the main language element
        mainLang.attr('href', `../index.html`);

        // Get the html elements referencing the other languages
        const otherLangs = languages.slice(1)
            .map((code) => ({ code: code, htmlRef: $(`#language-link-${code}`) }))

        // Correct the href attribute of the other language elements
        logger.info('Correcting href attribute of other language elements')
        otherLangs.forEach((language) => language.htmlRef.attr('href', `../${language.code}/index.${language.code}.html`))
        logger.info('Finished correcting href attribute of other language elements')

        await fs.promises.writeFile(directoryForHtmlFiles + `index.${lang}.html`, $.html());
        logger.info('Updated index file for language: ' + lang)
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

    fixWrongLanguageReferences(langs)
}