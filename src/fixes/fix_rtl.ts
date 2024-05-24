import * as Cheerio from "cheerio";
import fs from "fs";
import logger from "../utils/logger";
import path from "path";
import CONFIG from "../config";

async function processHtmlFilesInDirectory(
    directory: string,
    cssContent: string,
) {
    const files = await fs.promises.readdir(directory, { withFileTypes: true });

    for (const file of files) {
        const filePath = path.join(directory, file.name);

        if (file.isDirectory()) {
            // Recursively process subdirectories
            await processHtmlFilesInDirectory(filePath, cssContent);
        } else if (file.isFile() && file.name.endsWith(".html")) {
            await processHtmlFile(filePath, cssContent);
        }
    }
}

async function processHtmlFile(filePath: string, cssContent: string) {
    logger.info(`Reading file: ${filePath}`);

    const htmlContent = await fs.promises.readFile(filePath, "utf-8");
    logger.info(`Finished reading file: ${filePath}`);

    const $ = Cheerio.load(htmlContent);

    // Add the CSS content into a <style> tag in the head of the HTML file
    $("head").append(`<style>${cssContent}</style>`);

    await fs.promises.writeFile(filePath, $.html());
    logger.info(`Finished processing file: ${filePath}`);
}

export async function fixAndStyleArabicHtmlFiles() {
    if (!CONFIG.languages.includes("ar")) {
        console.log({
            config: CONFIG,
        });
        logger.info("Arabic language not found in the list of languages");
        return;
    }

    const directoryForHtmlFiles = path.join(
        CONFIG.outputDirectory,
        `_book/ar/`,
    );
    const cssFilePath = path.join(__dirname, "/rtl.css");

    // Read the CSS file
    const cssContent = await fs.promises.readFile(cssFilePath, "utf-8");

    // Start processing from the root directory
    await processHtmlFilesInDirectory(directoryForHtmlFiles, cssContent);
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

    fixAndStyleArabicHtmlFiles();
}
