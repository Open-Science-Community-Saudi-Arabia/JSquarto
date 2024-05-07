/**
 * This should only be run after the translations have been downloaded from Crowdin
 * 
 * This script will move the translated files from the Crowdin structure to the output directory
 * Fix the structure of the translated files in the output directory
 * Merge the paths for the translated files
 * And fix the file extensions for the translated files
 */

import CONFIG from "../config";
import path from 'path'
import fs from 'fs'

export async function moveTranslatedFilesToOutputDir() {
    const translationsFolderPath = path.join(__dirname, '/../../translations')

    // Find all folders that are named after the language code
    for (const language of CONFIG.languages) {
        const langFolderPath = path.join(translationsFolderPath, language)

        // Copy the language folder to the output directory
        const newLangFolderPath = path.join(CONFIG.outputDirectory, language)
        fs.copyFileSync(langFolderPath, newLangFolderPath)
    }
}

export async function fixTranslatedFilesStructureInOutputDir() {
    // Check the output dir for the localized files
    const folderPath = path.join(CONFIG.outputDirectory)

    for (const language of CONFIG.languages) {
        const langFolderPath = path.join(folderPath, language + `/${CONFIG.outputDirectory}`)

        // Move the folders and files from the language/<ouput folder> to the language folder
        const files = await fs.promises.readdir(langFolderPath)

        for (const file of files) {
            const filePath = path.join(langFolderPath, file)
            const newFilePath = path.join(path.join(folderPath, language), file)

            await fs.promises.rename(filePath, newFilePath)
        }
    }
}

export async function mergePathsForTranslatedFiles() {
    // Go to the folders for the languages within the output dir
    const folderPath = path.join(CONFIG.outputDirectory)

    // Go through each language folder
    for (const language of CONFIG.languages) {
        const languageFolderPath = path.join(folderPath, language)

        async function recursivelyMoveSubFiles(folderPath: string) {
            const files = await fs.promises.readdir(folderPath)

            for (const file of files) {
                const filePath = path.join(folderPath, file)
                // Remove the prefix /language/outputDir from the file path
                const newFilePath = filePath.replace(`${language}/${CONFIG.outputDirectory}`, '')
                const stats = await fs.promises.stat(filePath)

                if (stats.isDirectory()) {
                    await recursivelyMoveSubFiles(filePath)
                } else {
                    await fs.promises.rename(filePath, newFilePath)
                }
            }
        }

        await recursivelyMoveSubFiles(languageFolderPath)
    }
}

export async function fixFileExtensionsForTranslatedFiles() {
    // Go to the folders for the languages within the output dir
    const folderPath = path.join(CONFIG.outputDirectory)

    // Go through each language folder
    for (const language of CONFIG.languages) {
        const languageFolderPath = path.join(folderPath, language)

        async function recursivelyChangeFileExtensions(folderPath: string) {
            const files = await fs.promises.readdir(folderPath)

            for (const file of files) {
                const filePath = path.join(folderPath, file)
                const stats = await fs.promises.stat(filePath)

                if (stats.isDirectory()) {
                    await recursivelyChangeFileExtensions(filePath)
                } else {
                    const fileExtension = path.extname(filePath)
                    const newFilePath = filePath.replace(`.${fileExtension}.${language}`, '')
                    await fs.promises.rename(filePath, newFilePath)
                }
            }
        }

        await recursivelyChangeFileExtensions(languageFolderPath)
    }
}

if (require.main === module) {
    const languages = process.argv
        .find((arg) => arg.startsWith("languages"))
        ?.split("=")[1]
        ?.split(",");

    if (!languages) {
        console.log(
            "Please provide languages to create localized docs for using the languages flag",
        );
        process.exit(1);
    }

    CONFIG.languages = languages

    moveTranslatedFilesToOutputDir()
    // fixFileExtensionsForTranslatedFiles()
    // fixTranslatedFilesStructureInOutputDir()
    // mergePathsForTranslatedFiles()
}