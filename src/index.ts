import fs from 'fs'
import CommentsUtil, { Comment } from './utils/comment'
import SourceFile from './utils/file'
import { Doc, ModuleBlockInfo } from './interfaces'
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
    const filePaths = getJSFilesFromDirectory(__dirname + '/test_files')

    // Get all comments from all files
    for (const filePath of filePaths) {
        const sourceFile = new SourceFile(filePath)
        const comments = CommentsUtil.getCommentsFromFile(sourceFile.fileContent)

        let module = {} as ModuleBlockInfo
        const moduleDocs: Doc[] = []
        for (const _comment of comments) {
            const blockType = _comment.blockInfo.type
            const commentIsModule = blockType === 'module'

            if (commentIsModule) {
                module = CommentsUtil.getModuleBlockInfo(_comment.text)
            } else {
                const constructInfo = sourceFile.getLinkedCodeConstructInfo(_comment)
                moduleDocs.push({
                    blockInfo: CommentsUtil.getOtherBlockInfo(_comment.text),
                    constructInfo
                })
            }
        }

        Writer.writeModuleDocs({
            module,
            originalFilePath: filePath,
            docs: moduleDocs
        })
    }
}

start()