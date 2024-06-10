import fs from "fs";
import { CommentsUtil } from "../utils/comment";
import SourceFile from "../utils/file";
import Writer from "../utils/writer";
import {
    Category,
    Module,
    ModuleDoc,
    SubCategory,
    recursivelyConvertAllStringValuesInObjectToLowerCase,
} from "../utils/components";
import path from "path";
import logger from "../utils/logger";
import ConfigMgr from "../utils/config_mgr";

const CONFIG = ConfigMgr.getConfig();
/**
 * Recursively searches for JavaScript files in a directory and its subdirectories.
 *
 * @description This function recursively traverses the specified directory and its subdirectories to find JavaScript files (.js).
 * It starts by checking each item in the directory. If the item is a directory, it recursively calls itself
 * to search for JavaScript files within that directory. If the item is a JavaScript file, it adds the file path
 * to an array of found JavaScript files.
 *
 * @param directory The directory to search for JavaScript files.
 * @param files An optional array to store the found JavaScript file paths (default is an empty array).
 * @returns An array containing the paths of all found JavaScript files.
 */
function getJSFilesFromDirectory(
    directory: string,
    files: string[] = [],
): string[] {
    const items = fs.readdirSync(directory);
    for (const item of items) {
        const itemPath = `${directory}/${item}`;
        const allowedFileTypes = [".js"];
        const fileExtension = itemPath.substring(itemPath.lastIndexOf("."));
        if (fs.statSync(itemPath).isDirectory()) {
            getJSFilesFromDirectory(itemPath, files);
        } else if (allowedFileTypes.includes(fileExtension)) {
            files.push(itemPath);
        }
    }
    return files;
}

// TODO: Refactor this function
/**
 * @description Starts the documentation generation process.
 *
 * This function initiates the documentation generation process by performing the following steps:
 *
 * 1. It searches for JavaScript files in the specified directory and its subdirectories.
 * 2. It parses the comments from each JavaScript file using `CommentsUtil.getCommentsFromFile()`.
 * 3. It processes the comments to extract module information and updates the module and category data structures accordingly.
 * 4. If a default module is defined, it adds the module and its documentation to the appropriate category or the default category.
 * 5. It generates the documentation directory and files using the `Writer` utility.
 * 6. Finally, it logs a message indicating that the documentation generation process is complete.
 *
 * This function serves as the entry point for generating documentation for JavaScript files.
 *
 * @returns void
 */
export async function generateDoc() {
    // Get JavaScript files from directory
    const filePaths = getJSFilesFromDirectory(CONFIG.sourceDirectory);

    // Initialize maps for modules and categories
    const modules: Map<string, Module> = new Map();
    const categories: Map<string, Category> = new Map();

    // Create default module, category, and subcategory
    const defaultFileModule = new Module({
        name: "Globals",
        description: "Global constructs",
        references: [],
    });
    const defaultCategory = new Category("Globals");
    categories.set(defaultCategory.name, defaultCategory);

    // Process each file
    for (const filePath of filePaths) {
        // Parse source file and extract comments
        const sourceFile = new SourceFile(filePath);
        const comments = CommentsUtil.getCommentsFromFile(sourceFile);
        let fileModule: Module | undefined = undefined;
        const moduleDocs: ModuleDoc[] = [];

        // Process comments in the file
        for (const comment of comments) {
            if (comment.blockType !== "module") {
                // If comment is not module-related, add it to moduleDocs
                moduleDocs.push(
                    new ModuleDoc({
                        originalFilePath: filePath,
                        data: {
                            blockInfo: comment.getOtherBlockInfo(),
                            constructInfo: comment.constructInfo,
                        },
                    }),
                );
                continue;
            }

            // Extract module information from comment
            const _module = comment.getModuleInfo();
            let newModule = modules.get(_module.name);

            // Create new module if t doesn't exist
            if (!newModule) {
                newModule = new Module({
                    name: _module.name,
                    description: _module.description,
                    category: _module.category,
                    references: [],
                });
                modules.set(newModule.info.name, newModule);
            }

            // Track the first module encountered in the file
            if (!fileModule) {
                fileModule = newModule;
            }

            // Create category and subcategory if they exist in the module information
            const moduleCategory = _module.category
                ? (recursivelyConvertAllStringValuesInObjectToLowerCase(
                      _module.category,
                  ) as typeof _module.category)
                : undefined;
            if (moduleCategory) {
                let category = categories.get(moduleCategory.name);

                // Create a new  category if it doesn't exist
                if (!category) {
                    category = new Category(moduleCategory.name);
                    categories.set(category.name, category);
                }

                // Create a new subcategory if it doesn't exist
                let subCategory = category.subCategories.find(
                    (subCat) => subCat.name === moduleCategory.subCategory,
                );
                if (!subCategory) {
                    subCategory = new SubCategory({
                        name: moduleCategory.subCategory!,
                        category,
                    });
                    category.subCategories.push(subCategory);
                }
            }
        }

        // Add module and its documentation to appropriate category or default
        if (fileModule) {
            moduleDocs.forEach((doc) => fileModule!.addDoc(doc));
            const category =
                fileModule.info.category?.name || defaultCategory.name;
            const subCategory = fileModule.info.category?.subCategory;
            const categoryToAddTo = categories.get(category);
            const subCategoryToAddTo = categoryToAddTo?.subCategories.find(
                (subCat) => subCat.name === subCategory,
            );

            // Add module to subcategory if it exists
            for (const category of [
                subCategoryToAddTo,
                categoryToAddTo,
                defaultCategory,
            ]) {
                const categoryAlreadyHasModule = category
                    ?.getModules()
                    .some(
                        (module) => module.info.name === fileModule!.info.name,
                    );
                if (!categoryAlreadyHasModule) {
                    category?.addModule(fileModule);
                    break;
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
    const writer = new Writer(modules, categories, {
        tutorial: CONFIG.tutorialDirectory,
    });
    writer.prepareDirectoryForDocs().writeDocsFromCategoriesToFile();

    const tutorialsFolderExists = fs.existsSync(
        path.resolve(CONFIG.tutorialDirectory),
    );
    if (tutorialsFolderExists) {
        const chapters = await writer.addTutorialsToGeneratedDoc();
        await writer.addTutorialChaptersToQuartoYml(chapters);
    }

    if (CONFIG.languages) {
        console.log("Running with languages");
        writer.addLanguageSpecsToQuartoConfig(CONFIG.languages);

        if (CONFIG.includeLocalizedVersions) {
            writer.createLocalizedFilesForEachLanguage(CONFIG.languages);
        }
    }

    logger.info("Documentation generation complete");
    return;
}

// Access the path argument specified via command line
const { inputData } = ConfigMgr.updateConfigStore();

if (inputData.includeLocalizedVersions && !inputData.languages) {
    throw new Error(
        "Please provide languages to create localized docs for using the languages flag",
    );
    process.exit(1);
}

if (require.main === module) {
    generateDoc();
}
