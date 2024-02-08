import fs from 'fs'
import { Doc, ModuleBlockInfo } from './interfaces'
import { CommentsUtil } from './utils/comment'
import SourceFile from './utils/file'
import Writer from './utils/writer'

function getJSFilesFromDirectory(directory: string): string[] {
    // Get all nested files and folders
    const files = fs.readdirSync(directory)
    const allFiles: string[] = []
    for (const file of files) {
        const filePath = directory + '/' + file
        const isDirectory = fs.statSync(filePath).isDirectory()

        if (isDirectory) {
            const filesInDirectory = getJSFilesFromDirectory(filePath)
            allFiles.push(...filesInDirectory)
        } else {
            allFiles.push(filePath)
        }
    }

    return allFiles.filter((file) => file.includes('.js'))
}

function start() {
    // Get all folders and files in test_files directory that are js files
    const filePaths = getJSFilesFromDirectory(__dirname + '/../test_files')

    const docs: {
        module: ModuleBlockInfo,
        originalFilePath: string,
        docs: Doc[]
    }[] = []

    // Get all comments from all files
    for (const filePath of filePaths) {
        const sourceFile = new SourceFile(filePath)
        const comments = CommentsUtil.getCommentsFromFile(sourceFile.fileContent)

        // Each file should have one module comment and multiple other comments
        let module = {} as ModuleBlockInfo
        const moduleDocs: Doc[] = []

        for (const comment of comments) {
            const blockType = comment.blockInfo.type
            const commentIsModule = blockType === 'module'

            commentIsModule
                ? module = comment.getModuleInfo()
                : moduleDocs.push({
                    blockInfo: comment.getOtherBlockInfo(),
                    constructInfo: sourceFile.getLinkedCodeConstructInfo(comment)
                })
        }

        docs.push({
            module,
            originalFilePath: filePath,
            docs: moduleDocs
        })
    }

    // Write docs to qmd files
    docs.forEach(doc => Writer.writeDocsToFile(doc))
}

start()