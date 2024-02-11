import fs from "fs";
import { Doc, ModuleBlockInfo } from "./interfaces";
import { CommentsUtil } from "./utils/comment";
import SourceFile from "./utils/file";
import Writer from "./utils/writer";
import {
    Category,
    Module,
    ModuleDoc,
    SubCategory,
} from "./utils/docStructureGenerator";

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

function start() {
    const filePaths = getJSFilesFromDirectory(__dirname + "/../test_files");
    const modules: Map<string, Module> = new Map();
    const categories: Map<string, Category> = new Map();

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

    for (const filePath of filePaths) {
        const sourceFile = new SourceFile(filePath);
        const comments = CommentsUtil.getCommentsFromFile(
            sourceFile.fileContent,
        );
        let fileModule: Module | undefined = undefined;
        const moduleDocs: ModuleDoc[] = [];

        for (const comment of comments) {
            if (comment.blockInfo.type !== "module") {
                moduleDocs.push(
                    new ModuleDoc({
                        originalFilePath: filePath,
                        data: comment.getOtherBlockInfo(),
                    }),
                );
                continue;
            }

            const _module = comment.getModuleInfo();
            let newModule = modules.get(_module.name);

            if (!newModule) {
                newModule = new Module({
                    name: _module.name,
                    description: _module.description,
                    category: _module.category,
                });
                modules.set(_module.name, newModule);
            }

            if (!fileModule) {
                fileModule = newModule;
            }

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

        if (fileModule) {
            moduleDocs.forEach((doc) => fileModule!.addDoc(doc));
            const category =
                fileModule.info.category?.name || defaultCategory.name;
            const subCategory =
                fileModule.info.category?.subCategory ||
                defaultSubCategory.name;
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

    if (defaultFileModule.getDocs().length > 0) {
        modules.set(defaultFileModule.info.name, defaultFileModule);
        defaultCategory.addModule(defaultFileModule);
    }

    new Writer()
        .prepareDirectoryForDocs(Array.from(categories.values()))
        .writeDocsFromCategoriesToFile(Array.from(categories.values()));
}

start();
