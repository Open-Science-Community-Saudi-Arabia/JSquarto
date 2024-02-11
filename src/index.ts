import fs from "fs";
import { Doc, ModuleBlockInfo } from "./interfaces";
import { CommentsUtil } from "./utils/comment";
import SourceFile from "./utils/file";
import Writer from "./utils/writer";
import { Category, Module, ModuleDoc, SubCategory } from "./utils/components";

function getJSFilesFromDirectory(
    directory: string,
    files: string[] = [],
): string[] {
    const items = fs.readdirSync(directory);
    for (const item of items) {
        const itemPath = `${directory}/${item}`;
        if (fs.statSync(itemPath).isDirectory()) {
            getJSFilesFromDirectory(itemPath, files);
        } else if (itemPath.endsWith(".js")) {
            files.push(itemPath);
        }
    }
    return files;
}

// TODO: Refactor this function
function start() {
    // Get JavaScript files from directory
    const filePaths = getJSFilesFromDirectory(__dirname + "/../test_files");

    // Initialize maps for modules and categories
    const modules: Map<string, Module> = new Map();
    const categories: Map<string, Category> = new Map();

    // Create default module, category, and subcategory
    const defaultFileModule = new Module({
        name: "default",
        description: "Default module",
        link: "default",
    });
    const defaultCategory = new Category("default");
    const defaultSubCategory = new SubCategory({
        name: "default",
        category: defaultCategory,
    });
    defaultCategory.subCategories.push(defaultSubCategory);
    categories.set(defaultCategory.name, defaultCategory);

    // Process each file
    for (const filePath of filePaths) {
        // Parse source file and extract comments
        const sourceFile = new SourceFile(filePath);
        const comments = CommentsUtil.getCommentsFromFile(
            sourceFile.fileContent,
        );
        let fileModule: Module | undefined = undefined;
        const moduleDocs: ModuleDoc[] = [];

        // Process comments in the file
        for (const comment of comments) {
            if (comment.blockInfo.type !== "module") {
                // If comment is not module-related, add it to moduleDocs
                moduleDocs.push(
                    new ModuleDoc({
                        originalFilePath: filePath,
                        data: comment.getOtherBlockInfo(),
                    }),
                );
                continue;
            }

            // Extract module information from comment
            const _module = comment.getModuleInfo();
            let newModule = modules.get(_module.name);

            // Create new module if it doesn't exist
            if (!newModule) {
                newModule = new Module({
                    name: _module.name,
                    description: _module.description,
                    category: _module.category,
                });
                modules.set(_module.name, newModule);
            }

            // Track the first module encountered in the file
            if (!fileModule) {
                fileModule = newModule;
            }

            // Create category and subcategory if they exist in the module information
            const moduleCategory = _module.category;
            if (moduleCategory) {
                let category = categories.get(moduleCategory.name);

                if (!category) {
                    category = new Category(moduleCategory.name);
                    categories.set(moduleCategory.name, category);
                }

                let subCategory = category.subCategories.find(
                    (subCat) => subCat.name === moduleCategory.subCategory,
                );

                if (!subCategory) {
                    subCategory = new SubCategory({
                        name: moduleCategory.subCategory,
                        category,
                    });
                    category.subCategories.push(subCategory);
                }
            }
        }

        // Add module and its documentation to appropriate category or default
        if (fileModule) {
            moduleDocs.forEach((doc) => fileModule!.addDoc(doc));
            const category = fileModule.info.category?.name || defaultCategory.name;
            const subCategory = fileModule.info.category?.subCategory || defaultSubCategory.name;
            const categoryToAddTo = categories.get(category);
            const subCategoryToAddTo = categoryToAddTo?.subCategories.find(
                (subCat) => subCat.name === subCategory,
            );

            if (subCategoryToAddTo) {
                if (
                    !subCategoryToAddTo
                        .getModules()
                        .some(
                            (module) =>
                                module.info.name === fileModule!.info.name,
                        )
                ) {
                    subCategoryToAddTo.addModule(fileModule!);
                }
            } else if (categoryToAddTo) {
                if (
                    !categoryToAddTo
                        .getModules()
                        .some(
                            (module) =>
                                module.info.name === fileModule!.info.name,
                        )
                ) {
                    categoryToAddTo.addModule(fileModule!);
                }
            } else {
                if (
                    !defaultCategory
                        .getModules()
                        .some(
                            (module) =>
                                module.info.name === fileModule!.info.name,
                        )
                ) {
                    defaultSubCategory.addModule(fileModule!);
                }
            }

            modules.set(fileModule.info.name, fileModule);
        } else {
            moduleDocs.forEach((doc) => defaultFileModule.addDoc(doc));
        }
    }

    // Add default module to default category if it has documentation
    if (defaultFileModule.getDocs().length > 0) {
        modules.set(defaultFileModule.info.name, defaultFileModule);
        defaultCategory.addModule(defaultFileModule);
    }

    // Generate documentation directory and files
    new Writer()
        .prepareDirectoryForDocs(Array.from(categories.values()))
        .writeDocsFromCategoriesToFile(Array.from(categories.values()));
}


start();
