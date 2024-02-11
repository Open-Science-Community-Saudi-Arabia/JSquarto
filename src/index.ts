import fs from 'fs'
import { Doc, ModuleBlockInfo } from './interfaces'
import { CommentsUtil } from './utils/comment'
import SourceFile from './utils/file'
import Writer from './utils/writer'
import { Document, Module, ModuleDoc } from './utils/docStructureGenerator'

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

    const modules: Module[] = []

    const defaultFileModule = new Module({
        name: 'default',
        description: 'Default module',
        link: 'default'
    })

    // Get all comments from all files
    for (const filePath of filePaths) {
        const sourceFile = new SourceFile(filePath)
        const comments = CommentsUtil.getCommentsFromFile(sourceFile.fileContent)

        let moduleHasBeenDeclaredForFile = false

        // There should be one module for each file
        // Get all the comments for each file,
        // While getting the comments check if the current comment is a module comment
        // If it is the first module, check the module array if the module has been initialized before
        // If it has not been initialized, then add it to the array of all modules
        // Link all the comments in this file to the module
        // If no module has been declared, then the module is the default module

        let fileModule: Module | undefined = undefined

        const moduleDocs: ModuleDoc[] = []

        for (const comment of comments) {
            const blockType = comment.blockInfo.type
            const commentIsModule = blockType === 'module'

            if (commentIsModule) {
                const _module = comment.getModuleInfo()
                const moduleExists = modules.some((module) => module.info.name === _module.name)

                const newModule = new Module({ name: _module.name, description: _module.description, category: _module.category })
                if (!moduleExists) modules.push(newModule)

                if (!moduleHasBeenDeclaredForFile) {
                    fileModule = newModule
                    moduleHasBeenDeclaredForFile = true
                }
                continue
            }

            // Comment is not a module declaration
            // Check which module the comment belongs to
            moduleDocs.push(new ModuleDoc({ originalFilePath: filePath, data: comment.getOtherBlockInfo() }))
        }

        // Add all the comments to the module
        if (fileModule) {
            moduleDocs.forEach((doc) => fileModule.addDoc(doc))
            modules.push(fileModule)
        }
    }

    modules.forEach((module) => Writer.writeDocsToFile(module))
    // Write docs to qmd files
    docs.forEach(doc => Writer.writeDocsToFile(doc))
}

start()