"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const comment_1 = require("./utils/comment");
const file_1 = __importDefault(require("./utils/file"));
const writer_1 = __importDefault(require("./utils/writer"));
const components_1 = require("./utils/components");
const path_1 = __importDefault(require("path"));
const logger_1 = __importDefault(require("./utils/logger"));
const config_mgr_1 = __importDefault(require("./utils/config_mgr"));
const CONFIG = config_mgr_1.default.getConfig();
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
function getJSFilesFromDirectory(directory, files = []) {
    const items = fs_1.default.readdirSync(directory);
    for (const item of items) {
        const itemPath = `${directory}/${item}`;
        const allowedFileTypes = [".js"];
        const fileExtension = itemPath.substring(itemPath.lastIndexOf("."));
        if (fs_1.default.statSync(itemPath).isDirectory()) {
            getJSFilesFromDirectory(itemPath, files);
        }
        else if (allowedFileTypes.includes(fileExtension)) {
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
function start() {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
        // Get JavaScript files from directory
        const filePaths = getJSFilesFromDirectory(CONFIG.sourceDirectory);
        // Initialize maps for modules and categories
        const modules = new Map();
        const categories = new Map();
        // Create default module, category, and subcategory
        const defaultFileModule = new components_1.Module({
            name: "Globals",
            description: "Global constructs",
            references: [],
        });
        const defaultCategory = new components_1.Category("Globals");
        categories.set(defaultCategory.name, defaultCategory);
        // Process each file
        for (const filePath of filePaths) {
            // Parse source file and extract comments
            const sourceFile = new file_1.default(filePath);
            const comments = comment_1.CommentsUtil.getCommentsFromFile(sourceFile);
            let fileModule = undefined;
            const moduleDocs = [];
            // Process comments in the file
            for (const comment of comments) {
                if (comment.blockType !== "module") {
                    // If comment is not module-related, add it to moduleDocs
                    moduleDocs.push(new components_1.ModuleDoc({
                        originalFilePath: filePath,
                        data: {
                            blockInfo: comment.getOtherBlockInfo(),
                            constructInfo: comment.constructInfo,
                        },
                    }));
                    continue;
                }
                // Extract module information from comment
                const _module = comment.getModuleInfo();
                let newModule = modules.get(_module.name);
                // Create new module if t doesn't exist
                if (!newModule) {
                    newModule = new components_1.Module({
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
                    ? (0, components_1.recursivelyConvertAllStringValuesInObjectToLowerCase)(_module.category)
                    : undefined;
                if (moduleCategory) {
                    let category = categories.get(moduleCategory.name);
                    // Create a new  category if it doesn't exist
                    if (!category) {
                        category = new components_1.Category(moduleCategory.name);
                        categories.set(category.name, category);
                    }
                    // Create a new subcategory if it doesn't exist
                    let subCategory = category.subCategories.find((subCat) => subCat.name === moduleCategory.subCategory);
                    if (!subCategory) {
                        subCategory = new components_1.SubCategory({
                            name: moduleCategory.subCategory,
                            category,
                        });
                        category.subCategories.push(subCategory);
                    }
                }
            }
            // Add module and its documentation to appropriate category or default
            if (fileModule) {
                moduleDocs.forEach((doc) => fileModule.addDoc(doc));
                const category = ((_a = fileModule.info.category) === null || _a === void 0 ? void 0 : _a.name) || defaultCategory.name;
                const subCategory = (_b = fileModule.info.category) === null || _b === void 0 ? void 0 : _b.subCategory;
                const categoryToAddTo = categories.get(category);
                const subCategoryToAddTo = categoryToAddTo === null || categoryToAddTo === void 0 ? void 0 : categoryToAddTo.subCategories.find((subCat) => subCat.name === subCategory);
                // Add module to subcategory if it exists
                for (const category of [
                    subCategoryToAddTo,
                    categoryToAddTo,
                    defaultCategory,
                ]) {
                    const categoryAlreadyHasModule = category === null || category === void 0 ? void 0 : category.getModules().some((module) => module.info.name === fileModule.info.name);
                    if (!categoryAlreadyHasModule) {
                        category === null || category === void 0 ? void 0 : category.addModule(fileModule);
                        break;
                    }
                }
                modules.set(fileModule.info.name, fileModule);
            }
            else {
                moduleDocs.forEach((doc) => defaultFileModule.addDoc(doc));
            }
        }
        // Add default module to default category if it has documentation
        if (defaultFileModule.getDocs().length > 0) {
            modules.set(defaultFileModule.info.name, defaultFileModule);
            defaultCategory.addModule(defaultFileModule);
        }
        // Generate documentation directory and files
        const writer = new writer_1.default(modules, categories, {
            tutorial: CONFIG.tutorialDirectory,
        });
        writer.prepareDirectoryForDocs().writeDocsFromCategoriesToFile();
        const tutorialsFolderExists = fs_1.default.existsSync(path_1.default.resolve(CONFIG.tutorialDirectory));
        if (tutorialsFolderExists) {
            const chapters = yield writer.addTutorialsToGeneratedDoc();
            yield writer.addTutorialChaptersToQuartoYml(chapters);
        }
        if (CONFIG.languages) {
            console.log("Running with languages");
            writer.addLanguageSpecsToQuartoConfig(CONFIG.languages);
            if (CONFIG.includeLocalizedVersions) {
                writer.createLocalizedFilesForEachLanguage(CONFIG.languages);
            }
        }
        logger_1.default.info("Documentation generation complete");
    });
}
// Access the path argument specified via command line
const { inputData } = config_mgr_1.default.updateConfigStore();
if (inputData.includeLocalizedVersions && !inputData.languages) {
    console.log("Please provide languages to create localized docs for using the languages flag");
    process.exit(1);
}
start();
