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
import ConfigMgr from "../../utils/config_mgr";
import logger from "../../utils/logger";
const CONFIG = ConfigMgr.getConfig();

/**
 * Move the updated crowdin translations from translations folder to the output directory
 */
async function moveTranslatedFilesToOutputDir() {
    const translationsFolderPath = CONFIG.translationsDirectory;

    async function copyAllFoldersAndFiles(source: string, destination: string) {
        logger.info({ source, destination });
        const files = await fs.promises.readdir(source);

        for (const file of files) {
            const filePath = path.join(source, file);
            const newFilePath = path.join(destination, file);

            const stats = await fs.promises.stat(filePath);
            if (stats.isDirectory()) {
                logger.info({ newFilePath });
                await fs.promises.mkdir(newFilePath, { recursive: true });
                await copyAllFoldersAndFiles(filePath, newFilePath);
            } else {
                await fs.promises.copyFile(filePath, newFilePath);
            }
        }
    }

    // Find all folders that are named after the language code
    for (const language of CONFIG.languages.slice(1)) {
        logger.info({ language });
        const langFolderPath = path.join(translationsFolderPath, language);

        // Copy the language folder to the output directory
        const newLangFolderPath = path.join(CONFIG.outputDirectory, language);
        await copyAllFoldersAndFiles(langFolderPath, newLangFolderPath);
    }
    logger.info(
        `
        Finished moving the updated crowdin translations from the translations folder to the output directory,
        `,
    );
}

/**
 * Fix the structure of the translated files in the output directory
 */
async function fixTranslatedFilesStructureInOutputDir() {
    // Check the output dir for the localized files
    const folderPath = path.join(CONFIG.outputDirectory);

    for (const language of CONFIG.languages.slice(1)) {
        const langFolderPath = path.join(folderPath, language);

        // Move the folders and files from the language/<ouput folder> to the language folder
        const files = await fs.promises.readdir(langFolderPath);

        for (const file of files) {
            const filePath = path.join(langFolderPath, file);

            const currentFolderName = path.basename(folderPath);

            // Find subfolder with same name as output folder
            const subFolder = findSubFolderWithMatchingName(
                filePath,
                currentFolderName,
            );

            if (subFolder === "") {
                continue;
            }

            moveDirContents(subFolder, langFolderPath);
        }
    }
    logger.info(
        `
        Finished fixing the structure of the translated files in the output directory,
        `,
    );
}

/**
 * Find the subfolder with the same name as the output folder
 *
 * @param folderPath - The path to the folder to search for the subfolder in.
 * @param outputFolderName - The name of the output folder to search for.
 * @returns The path to the subfolder with the same name as the output folder.
 */
function findSubFolderWithMatchingName(
    folderPath: string,
    outputFolderName: string,
): string {
    const files = fs.readdirSync(folderPath);

    for (const file of files) {
        const stats = fs.statSync(path.join(folderPath, file));
        if (stats.isDirectory() && file === outputFolderName) {
            return path.join(folderPath, file);
        }
    }
    return "";
}

/**
 * Moves the contents of one directory to another while maintaining the file structure and hierarchy.
 *
 * @param sourceDir - The directory to move files and folders from.
 * @param destDir - The directory to move files and folders to.
 */
function moveDirContents(sourceDir: string, destDir: string) {
    // Ensure the destination directory exists
    fs.mkdirSync(destDir, { recursive: true });

    // Get all items (files and directories) in the source directory
    const items = fs.readdirSync(sourceDir);

    // Loop through each item in the source directory
    for (const item of items) {
        const sourceItemPath = path.join(sourceDir, item);
        const destItemPath = path.join(destDir, item);

        // Check if the item is a directory
        const itemStat = fs.statSync(sourceItemPath);
        if (itemStat.isDirectory()) {
            // Recursively move the directory
            moveDirContents(sourceItemPath, destItemPath);
            // Remove the original empty directory
            fs.rmdirSync(sourceItemPath);
        } else {
            // Move the file
            fs.renameSync(sourceItemPath, destItemPath);
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
async function mergePathsForTranslatedFiles() {
    // Go to the folders for the languages within the output dir
    const folderPath = CONFIG.outputDirectory;

    // Go through each language folder
    for (const language of CONFIG.languages.slice(1)) {
        const languageFolderPath = path.join(folderPath, language);

        // Move the folders and files from the language/ to ../
        moveDirContents(languageFolderPath, folderPath);
    }
    logger.info(
        `
        Finished merging the paths for the translated files,
        `,
    );
}

/**
 * Fix the file extensions for the translated files
 *
 * @description The generated crowdin files have this file extension pattern: <filename>.<language>.<ext>
 * The problem here is that the <filename> can be <index.md> instead of 'index'.
 * This will make the generated file to be <index.md>.<language>.<ext>
 * This function will fix the file name to be <plain_file_name>.<language>.<ext> so it'll be <index.<language>.<ext>>
 */
async function fixFileExtensionsForTranslatedFiles() {
    // Go to the folders for the languages within the output dir
    const folderPath = CONFIG.outputDirectory;

    // Go through each language folder
    for (const language of CONFIG.languages.slice(1)) {
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

                    logger.info(`Renaming ${filePath} to ${newFilePath}`);
                    await fs.promises.rename(filePath, newFilePath);
                }
            }
        }

        await recursivelyChangeFileExtensions(languageFolderPath);
    }
    logger.info(
        `
        Finished fixing the file extensions for the translated files,
        `,
    );
}

async function deleteEmptyFoldersInOutDir() {
    // Delete all the empty folders for each language in the output directory
    for (const language of CONFIG.languages.slice(1)) {
        const languageFolderPath = path.join(CONFIG.outputDirectory, language);
        fs.rmdirSync(languageFolderPath, { recursive: true });
    }
}

export default async function fixCrowdinTranslations() {
    await moveTranslatedFilesToOutputDir();
    await fixTranslatedFilesStructureInOutputDir();
    await fixFileExtensionsForTranslatedFiles();
    await mergePathsForTranslatedFiles();
    await deleteEmptyFoldersInOutDir();
}

if (require.main === module) {
    fixCrowdinTranslations();
}
