import { Doc, ModuleBlockInfo } from "../interfaces";
import fs from 'fs';

export default class Writer {
    private static getQmdFilePathForCurrentFile(originalFilePath: string): string {
        // Get folder path
        const filePath = originalFilePath.split('/')
        const fileName = filePath.pop()?.split('.')[0] + '.qmd'

        filePath.pop()
        const folderPath = filePath.join('/')

        // Create sub folder in ./docs folder
        // Get relative path from this `test_files` folder to original file
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

    public static writeModuleDocs({
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
            fileContent += `## ${doc.constructInfo.type} ${doc.constructInfo.name} \n`
        }

        fs.writeFileSync(qmdfilePath, fileContent, 'utf8')
    }
}