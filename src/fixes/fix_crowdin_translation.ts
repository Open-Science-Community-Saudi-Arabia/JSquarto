import CONFIG from "../config";
import path from 'path'
import fs from 'fs'

async function start () {
    // Check the output dir for the localized files
    const folderPath = path.join(CONFIG.outputDirectory)

    for (const language of CONFIG.languages) {
        const langFolderPath = path.join(folderPath, language + '/docs')

        // Move the folders and files from the language/docs folder to the language folder
        const files = await fs.promises.readdir(langFolderPath)

        for (const file of files) {
            const filePath = path.join(langFolderPath, file)
            const newFilePath = path.join(path.join(folderPath, language), file)
            
            await fs.promises.rename(filePath, newFilePath)
        }
    }
}

start()