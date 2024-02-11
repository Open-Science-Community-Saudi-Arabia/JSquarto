import fs from 'fs'
import { Doc, ModuleBlockInfo } from './interfaces'
import { CommentsUtil } from './utils/comment'
import SourceFile from './utils/file'
import Writer from './utils/writer'
import { Category, Module, ModuleDoc, SubCategory } from './utils/docStructureGenerator'

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

    const categories: Category[] = []

    const defaultCategory = new Category('default')
    const defaultSubCategory = new SubCategory({ name: 'default', category: defaultCategory })

    categories.push(defaultCategory)
    defaultCategory.subCategories.push(defaultSubCategory)

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

            if (!commentIsModule) {
                // Comment is not a module declaration
                // Check which module the comment belongs to
                moduleDocs.push(new ModuleDoc({ originalFilePath: filePath, data: comment.getOtherBlockInfo() }))
                continue
            }

            const _module = comment.getModuleInfo()
            const moduleExists = modules.some((module) => module.info.name === _module.name)

            const newModule = new Module({ name: _module.name, description: _module.description, category: _module.category, })
            if (!moduleExists) modules.push(newModule)

            if (!moduleHasBeenDeclaredForFile) {
                fileModule = newModule
                moduleHasBeenDeclaredForFile = true
            }

            if (_module.category) {
                const existingCategory = categories.find((category) => category.name === _module.category?.name)

                if (existingCategory) {
                    // Check if subcategory has already been added to the main category
                    const existingSubCategory = existingCategory.subCategories.find((subCategory) => subCategory.name === _module.category?.subCategory)

                    const subCategory = existingSubCategory ?? new SubCategory({ name: _module.category?.subCategory, category: new Category(_module.category?.name) })

                    !existingSubCategory && existingCategory.subCategories.push(subCategory)

                } else {
                    const newCategory = new Category(_module.category?.name)
                    const subCategory = new SubCategory({ name: _module.category?.subCategory, category: newCategory })
                    newCategory.subCategories.push(subCategory)
                    categories.push(newCategory)
                }
            }
        }

        // Add all the comments to the module
        if (fileModule) {
            moduleDocs.forEach((doc) => fileModule.addDoc(doc))

            // Get the category and subcategory for the module
            // If the module has a category and subcategory, then add the module to the category and subcategory
            // If the module has a category but no subcategory, then add the module to the category
            // If the module has no category, then add the module to the default category and subcategory
            const category = fileModule.info.category?.name ?? defaultCategory.name
            const subCategory = fileModule.info.category?.subCategory ?? defaultSubCategory.name

            const categoryToAddTo = categories.find((_category) => _category.name === category)
            const subCategoryToAddTo = categoryToAddTo?.subCategories.find((_subCategory) => _subCategory.name === subCategory)

            if (subCategoryToAddTo) {
                const existingModule = subCategoryToAddTo.getModules().find((_module) => _module.info.name === fileModule.info.name)
                if (!existingModule) {
                    subCategoryToAddTo.addModule(fileModule)
                }
            } else if (categoryToAddTo) {
                const existingModuleInCategory = categoryToAddTo.getModules().find((_module) => _module.info.name === fileModule.info.name)
                if (!existingModuleInCategory) {
                    categoryToAddTo.addModule(fileModule)
                }
            } else {
                const existingModuleInDefaultCategory = defaultCategory.getModules().find((_module) => _module.info.name === fileModule.info.name)
                if (!existingModuleInDefaultCategory) {

                    defaultSubCategory.addModule(fileModule)
                }
            }

            modules.push(fileModule)
        } else {
            moduleDocs.forEach((doc) => defaultFileModule.addDoc(doc))
        }
    }

    if (defaultFileModule.getDocs().length > 0) {
        modules.push(defaultFileModule)
        defaultCategory.addModule(defaultFileModule)
    }

    new Writer()
        .prepareDirectoryForDocs(categories)
        .writeDocsFromCategoriesToFile(categories)
}

start()