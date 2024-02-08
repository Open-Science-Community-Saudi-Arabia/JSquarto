/**
 * This file contains a Writer class that writes documentation to Markdown files (*.qmd). 
 * The Markdown content based on this information and writes it to the specified location.
 */

import { Doc, ModuleBlockInfo } from "../interfaces";
import fs from 'fs';

export default class Writer {
    private static getQmdFilePathForCurrentFile(originalFilePath: string): string {
        // Get folder path
        const filePath = originalFilePath.split('/')
        const fileName = filePath.pop()?.split('.')[0] + '.qmd'

        filePath.pop()

        // Create sub folder in docs folder
        // Get relative path from the `test_files` folder to original file
        const relativePath = originalFilePath.split('test_files')[1]
        const relativePathArray = relativePath.split('/')
        relativePathArray.pop()

        const relativeFolderPath = relativePathArray.join('/')
        const folderPathToWrite = __dirname + `/../../docs${relativeFolderPath}`

        // Create folder if it doesn't exist
        if (!fs.existsSync(folderPathToWrite)) {
            fs.mkdirSync(folderPathToWrite, { recursive: true })
        }

        return folderPathToWrite + '/' + fileName
    }

    public static writeDocsToFile({
        module,
        originalFilePath,
        docs
    }: { module: ModuleBlockInfo, originalFilePath: string, docs: Doc[] }) {
        // Get file path
        const qmdfilePath = this.getQmdFilePathForCurrentFile(originalFilePath)
        fs.writeFileSync(qmdfilePath, '', 'utf8')

        let fileContent = ''

        //  Add module title to qmd file
        fileContent += `--- \n title: ${module.name} \n---\n`

        // Add module description to qmd file
        fileContent += `## Description \n ${module.description} \n`

        // Add constructs to qmd file
        for (const doc of docs) {
            // Add 2 lines
            fileContent += '\n\n'

            fileContent += `## ${doc.constructInfo.type} ${doc.constructInfo.name} \n`

            // Add description to qmd file
            fileContent += `### Description \n ${doc.blockInfo.description} \n`

            // Add params to qmd file
            if (doc.blockInfo.params.length > 0) {
                fileContent += `### Params \n`
                for (const param of doc.blockInfo.params) {
                    fileContent += `**${param.name}**: ${param.description} \n`
                }
            }

            // Add returns to qmd file
            if (doc.blockInfo.returns.length > 0) {
                fileContent += `### Returns \n`
                for (const returnedValue of doc.blockInfo.returns) {
                    fileContent += `**${returnedValue.type}**: ${returnedValue.description} \n`
                }
            }

            // Add thrown errors to qmd file
            if (doc.blockInfo.thrownErrors.length > 0) {
                fileContent += `### Thrown Errors \n`
                for (const thrownError of doc.blockInfo.thrownErrors) {
                    fileContent += `**${thrownError.type}**: ${thrownError.description} \n`
                }
            }

            // Add link to qmd file
            if (doc.blockInfo.link) {
                fileContent += `### Link \n ${doc.blockInfo.link} \n`
            }
        }

        fs.writeFileSync(qmdfilePath, fileContent, 'utf8')
    }
}