/**
 * This should only be run after the translations have been downloaded from Crowdin
 *
 * This script will move the translated files from the Crowdin structure to the output directory
 * Fix the structure of the translated files in the output directory
 * Merge the paths for the translated files
 * And fix the file extensions for the translated files
 */
import path from "path";
import fs from "fs";
import ConfigMgr from "../utils/config_mgr";
const CONFIG = ConfigMgr.getConfig();

/**
 * Move the updated crowdin translations from translations folder to the output directory
 */
export async function moveTranslatedFilesToOutputDir() {
    const translationsFolderPath = path.join(
        __dirname,
        "/../../" + CONFIG.translationsDirectory,
    );

    async function copyAllFoldersAndFiles(source: string, destination: string) {
        const files = await fs.promises.readdir(source);

        console.log({ source, destination });

        for (const file of files) {
            const filePath = path.join(source, file);
            const newFilePath = path.join(destination, file);

            const stats = await fs.promises.stat(filePath);
            if (stats.isDirectory()) {
                console.log({ newFilePath });
                await fs.promises.mkdir(newFilePath, { recursive: true });
                await copyAllFoldersAndFiles(filePath, newFilePath);
            } else {
                await fs.promises.copyFile(filePath, newFilePath);
            }
        }
    }

    // Find all folders that are named after the language code
    for (const language of CONFIG.languages) {
        const langFolderPath = path.join(translationsFolderPath, language);

        // Copy the language folder to the output directory
        const newLangFolderPath = path.join(
            __dirname,
            `../../${CONFIG.outputDirectory}`,
            language,
        );
        await copyAllFoldersAndFiles(langFolderPath, newLangFolderPath);
    }
}

/**
 * Fix the structure of the translated files in the output directory
 */
export async function fixTranslatedFilesStructureInOutputDir() {
    // Check the output dir for the localized files
    const folderPath = path.join(CONFIG.outputDirectory);

    for (const language of CONFIG.languages) {
        const langFolderPath = path.join(
            folderPath,
            language + `/${CONFIG.outputDirectory}`,
        );

        // Move the folders and files from the language/<ouput folder> to the language folder
        const files = await fs.promises.readdir(langFolderPath);

        for (const file of files) {
            const filePath = path.join(langFolderPath, file);
            const newFilePath = path.join(
                path.join(folderPath, language),
                file,
            );

            await fs.promises.rename(filePath, newFilePath);
        }
    }
}

/**
 * Merge the paths for the translated files
 *
 * @description This is necessary because the Crowdin CLI creates a folder for each language
 * and places the translated files within that folder. This function will move the files from the language folder
 * to the same level as the original files.
 */
export async function mergePathsForTranslatedFiles() {
    // Go to the folders for the languages within the output dir
    const folderPath = path.join(CONFIG.outputDirectory);

    // Go through each language folder
    for (const language of CONFIG.languages) {
        const languageFolderPath = path.join(folderPath, language);

        async function recursivelyMoveSubFiles(folderPath: string) {
            const files = await fs.promises.readdir(folderPath);

            for (const file of files) {
                const filePath = path.join(folderPath, file);
                // Remove the prefix /language/outputDir from the file path
                // Example move docs/ar/chapter/index.ar.qmd to docs/chapter/index.ar.qmd
                const index = filePath.indexOf(`/${language}`);
                let newFilePathArr = filePath.split("");
                for (let i = 0; i < +language.length + 2; i++) {
                    newFilePathArr[i + index] = "/";
                }
                const newFilePath = path.resolve(newFilePathArr.join(""));

                const stats = await fs.promises.stat(filePath);

                if (stats.isDirectory()) {
                    await recursivelyMoveSubFiles(filePath);
                } else {
                    console.log(`Moving ${filePath} to ${newFilePath}`);
                    fs.renameSync(filePath, newFilePath);
                }
            }
        }

        await recursivelyMoveSubFiles(languageFolderPath);
    }
}

/**
 * Fix the file extensions for the translated files
 *
 * @description The generated crowdin files have this file extension pattern: <filename>.<language>.<ext>
 * The problem here is that the <filename> can be <index.md> instead of 'index'.
 * This will make the generated file to be <index.md>.<language>.<ext>
 * This function will fix the file name to be <plain_file_name>.<language>.<ext> so it'll be <index.<language>.<ext>>
 */
export async function fixFileExtensionsForTranslatedFiles() {
    // Go to the folders for the languages within the output dir
    const folderPath = path.join(CONFIG.outputDirectory);

    // Go through each language folder
    for (const language of CONFIG.languages) {
        const languageFolderPath = path.join(folderPath, language);

        async function recursivelyChangeFileExtensions(folderPath: string) {
            const files = await fs.promises.readdir(folderPath);

            for (const file of files) {
                const filePath = path.join(folderPath, file);
                const stats = await fs.promises.stat(filePath);

                if (stats.isDirectory()) {
                    await recursivelyChangeFileExtensions(filePath);
                } else {
                    const fileExtension = path.extname(filePath);
                    const newFilePath = filePath.replace(
                        `${fileExtension}.${language}`,
                        `.${language}`,
                    );

                    console.log(`Renaming ${filePath} to ${newFilePath}`);
                    await fs.promises.rename(filePath, newFilePath);
                }
            }
        }

        await recursivelyChangeFileExtensions(languageFolderPath);
    }
}

export async function deleteEmptyFoldersInOutDir() {
    // Delete all the empty folders for each language in the output directory
    for (const language of CONFIG.languages) {
        const languageFolderPath = path.join(CONFIG.outputDirectory, language);
        fs.rmdirSync(languageFolderPath, { recursive: true });
    }
}

async function start() {
    await moveTranslatedFilesToOutputDir();
    await fixTranslatedFilesStructureInOutputDir();
    await fixFileExtensionsForTranslatedFiles();
    await mergePathsForTranslatedFiles();
    await deleteEmptyFoldersInOutDir();
}

if (require.main === module) {
    start();
}
