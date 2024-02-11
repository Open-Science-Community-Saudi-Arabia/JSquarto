/**
 * This file contains a Writer class that writes documentation to Markdown files (*.qmd). 
 * The Markdown content based on this information and writes it to the specified location.
 */

import { Doc, ModuleBlockInfo } from "../interfaces";
import fs from 'fs';
import { Category, ModuleDoc } from "./docStructureGenerator";

export default class Writer {
    private writeDocsToFile({
        module,
        destinationPath,
        docs
    }: { module: ModuleBlockInfo, destinationPath: string, docs: ModuleDoc[] }) {
        // Get file path
        const qmdfilePath = destinationPath + '/' + module.name + '.qmd'
        fs.writeFileSync(qmdfilePath, '', 'utf8')

        let fileContent = ''

        //  Add module title to qmd file
        fileContent += `--- \n title: ${module.name} \n---\n`

        // Add module description to qmd file
        fileContent += `## Description \n ${module.description} \n`

        // Add constructs to qmd file
        for (const _doc of docs) {
            const doc = {
                blockInfo: _doc.data,
                constructInfo: {
                    type: 'Function',
                    name: module.name
                }
            }
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

    public writeDocsFromCategoriesToFile(categories: Category[]) {
        for (const category of categories) {
            const categoryFolderPath = __dirname + `/../../docs/${category.name}`

            for (const subCategory of category.subCategories) {
                const subCategoryFolderPath = categoryFolderPath + '/' + subCategory.name

                for (const module of subCategory.getModules()) {
                    this.writeDocsToFile({
                        module: module.info,
                        destinationPath: subCategoryFolderPath,
                        docs: module.getDocs()
                    })
                }
            }
        }

        return this
    }

    public prepareDirectoryForDocs(categories: Category[]) {
        const folderPathToWrite = __dirname + `/../../docs`

        // Create folder if it doesn't exist
        if (!fs.existsSync(folderPathToWrite)) {
            fs.mkdirSync(folderPathToWrite, { recursive: true })
        }

        // Create sub folders for each category and add a default index.qmd file for each category
        // For the sub categories, add a default index.qmd file for each sub category
        // Write the category name to the index.qmd file 
        // Write the sub category name to the index.qmd file
        for (const category of categories) {
            const categoryFolderPath = folderPathToWrite + '/' + category.name
            if (!fs.existsSync(categoryFolderPath)) {
                fs.mkdirSync(categoryFolderPath, { recursive: true })
            }

            fs.writeFileSync(categoryFolderPath + '/index.qmd', `--- \n title: ${category.name} \n---\n`, 'utf8')

            for (const subCategory of category.subCategories) {
                const subCategoryFolderPath = categoryFolderPath + '/' + subCategory.name
                if (!fs.existsSync(subCategoryFolderPath)) {
                    fs.mkdirSync(subCategoryFolderPath, { recursive: true })
                }

                fs.writeFileSync(subCategoryFolderPath + '/index.qmd', `--- \n title: ${subCategory.name} \n---\n`, 'utf8')
            }
        }

        return this
    }
}