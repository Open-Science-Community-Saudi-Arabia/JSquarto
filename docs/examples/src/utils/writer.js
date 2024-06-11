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
/**
 *@category Functional Doc

 * @module Writer
 * @subcategory Utilities
 *
 * @description
 *  This TypeScript module (Writer) contains classes and functions
 *  for generating documentation structure and content.
 *  It interacts with various files and directories to organize
 *  documentation chapters, write content to Markdown files,
 *  and generate Quarto YAML configuration for the documentation book.
 *
 *  **Note**: This module is not yet complete and is still under development.
 *  */
const fs_1 = __importDefault(require("fs"));
const components_1 = require("./components");
const logger_1 = __importDefault(require("./logger"));
const path_1 = __importDefault(require("path"));
const yaml_1 = __importDefault(require("yaml"));
const constants_1 = require("../constants");
const string_1 = require("./string");
const config_mgr_1 = __importDefault(require("./config_mgr"));
const CONFIG = config_mgr_1.default.getConfig();
class Writer {
    /**
     * Initializes a new instance of the Writer class.
     *
     * @param {Map<string, Module>} modules - A map of modules.
     * @param {Map<string, Category>} categories - A map of categories.
     */
    constructor(modules, categories, pathConfig = {}) {
        var _a;
        this.modules = new Map();
        this.categories = new Map();
        this.modules = modules;
        this.categories = categories;
        this.tutorialsOutputPath = path_1.default.join(CONFIG.outputDirectory, "/chapters/tutorials");
        this.tutorialsSourcePath =
            (_a = pathConfig.tutorial) !== null && _a !== void 0 ? _a : CONFIG.tutorialDirectory;
    }
    /**
     * @description Formats file names by removing all underscores `(_)`
     * @param name
     * @returns
     */
    formatFileName(name) {
        // Replace all _ with -
        // Capitalize first capitalizeFirstLetter
        return name.replace(/_/g, " ");
    }
    /**
     * Generates the Quarto YAML configuration file.
     *
     * @param {Chapter[]} chapters - An array of chapters to include in the YAML file.
     * @description This method generates the Quarto YAML configuration file based on the provided chapters.
     */
    generateQuartoYAML(chapters) {
        try {
            // Check if there is a index.md file in the root of the docs folder
            // If not, create one
            const indexFilePath = CONFIG.outputDirectory + "/index.md";
            if (!fs_1.default.existsSync(indexFilePath)) {
                fs_1.default.writeFileSync(indexFilePath, constants_1.INDEX_QMD_CONTENT, "utf8");
            }
            const quartoYAML = Object.assign(Object.assign({}, constants_1.DEFAULT_QUARTO_YAML_CONTENT), { book: Object.assign(Object.assign({}, constants_1.DEFAULT_QUARTO_YAML_CONTENT.book), { chapters: [
                        "index.md",
                        ...chapters.map((chapter) => (Object.assign(Object.assign({}, chapter), { part: string_1.StringUtil.capitalizeFirstLetter(chapter.part) }))),
                    ] }) });
            if (chapters.length === 0) {
                logger_1.default.warn("No chapters found for Quarto YAML");
            }
            const quartoYAMLPath = path_1.default.join(CONFIG.outputDirectory, "_quarto.yml");
            fs_1.default.writeFileSync(quartoYAMLPath, yaml_1.default.stringify(quartoYAML), "utf8");
            logger_1.default.info(`Quarto YAML file generated: ${quartoYAMLPath}`);
        }
        catch (error) {
            logger_1.default.error("Error generating Quarto YAML file");
            logger_1.default.error(error);
            throw error;
        }
    }
    /**
     * Creates modules and categories based on configuration from `/tutorials/config.json`
     *
     * @description Creates modules and Categories from tutorials config, these will be required to write them as chapters in the quarto.yml file
     *
     * @returns
     */
    createModulesAndCategoriesFromTutorialsConfig() {
        var _a;
        // Check if tutorials folder exist
        const tutorialsFolderExists = fs_1.default.existsSync(this.tutorialsSourcePath);
        if (!tutorialsFolderExists) {
            logger_1.default.warn("Tutorials folder does not exist");
        }
        // Get the path to the tutorials configuration file
        const tutorialsConfigPath = path_1.default.join(this.tutorialsSourcePath, "config.json");
        // Read tutorials configuration from the JSON file
        const tutorialsConfig = JSON.parse(fs_1.default.readFileSync(tutorialsConfigPath, "utf8"));
        // Initialize modules map, tutorial category, and subcategories map
        const modules = new Map();
        const tutorialCategory = new components_1.Category("tutorials");
        const subCategories = new Map();
        // Iterate over each tutorial in the configuration
        for (const tutorial of Object.keys(tutorialsConfig)) {
            const tutorialData = tutorialsConfig[tutorial];
            const tutorialIsASubCategory = tutorialData.children;
            // Check if the tutorial is a subcategory
            if (tutorialIsASubCategory) {
                // Create a new subcategory
                const subCategory = new components_1.SubCategory({
                    name: tutorial,
                    category: tutorialCategory,
                });
                const subCategoryModules = new Map();
                // Iterate over each sub-tutorial in the subcategory
                const childrenTutorial = (_a = tutorialData.children) !== null && _a !== void 0 ? _a : {};
                for (const subTutorial of Object.keys(childrenTutorial)) {
                    const subTutorialData = childrenTutorial[subTutorial];
                    // Create a module for the sub-tutorial
                    const module = new components_1.Module({
                        name: subTutorial,
                        description: subTutorialData.title,
                        category: {
                            name: tutorial,
                            subCategory: subTutorial,
                        },
                        references: [],
                    });
                    // Get sourceFilePath from where the tutorial is located
                    const sourceFilePath = path_1.default.join(this.tutorialsSourcePath, tutorial + "/" + subTutorial + ".qmd");
                    module.setSourceFilePath(sourceFilePath);
                    // Add the module to the subcategory and modules map
                    subCategoryModules.set(module.info.name, module);
                    modules.set(module.info.name, module);
                }
                // Add modules to the subcategory
                const moduleNames = Array.from(subCategoryModules.keys());
                for (const moduleName of moduleNames) {
                    const module = subCategoryModules.get(moduleName);
                    if (module) {
                        subCategory.addModule(module);
                    }
                }
                // Add the subcategory to the subcategories map
                subCategories.set(subCategory.name, subCategory);
                tutorialCategory.addSubCategory(subCategory);
            }
            else {
                // Create a module for the tutorial
                const module = new components_1.Module({
                    name: tutorial,
                    description: tutorialData.title,
                    category: {
                        name: tutorialCategory.name,
                        subCategory: undefined,
                    },
                    references: [],
                });
                const sourceFilePath = path_1.default.join(this.tutorialsSourcePath, module.info.name + ".qmd");
                module.setSourceFilePath(sourceFilePath);
                // Add the module to the modules map
                modules.set(module.info.name, module);
                tutorialCategory.addModule(module);
            }
        }
        // Return the modules and tutorial category
        return {
            modules,
            tutorialCategory,
        };
    }
    /**
     * Write tutorials content to `/docs` folder
     *
     * @description Copies the content of the tutorials in `/tutorials` to `/docs/chapters/tutorials`
     *
     * @param {Module} options.module
     * @param {Category} options.tutorialCategory
     * @param {SubCategory} options.subCategory
     *
     * @returns
     */
    writeTutorialToFile({ module, subCategory, tutorialCategory, }) {
        return __awaiter(this, void 0, void 0, function* () {
            const sourceFilePath = module.sourceFilePath;
            const subCategoryFolderPath = subCategory
                ? path_1.default.relative(CONFIG.outputDirectory, path_1.default.join(this.tutorialsOutputPath, subCategory.name))
                : undefined;
            if (subCategoryFolderPath)
                fs_1.default.mkdirSync(subCategoryFolderPath, { recursive: true });
            const folderPathForTutorialsWithoutParentCategory = path_1.default.join("chapters/" + tutorialCategory.name);
            const destinationFilePath = path_1.default.join(subCategoryFolderPath !== null && subCategoryFolderPath !== void 0 ? subCategoryFolderPath : folderPathForTutorialsWithoutParentCategory, `${module.info.name}.qmd`);
            const filePathToWrite = CONFIG.outputDirectory + "/" + destinationFilePath;
            const directoryPath = path_1.default.dirname(filePathToWrite);
            if (!fs_1.default.existsSync(directoryPath))
                fs_1.default.mkdirSync(directoryPath, { recursive: true });
            fs_1.default.writeFileSync(filePathToWrite, "", "utf8");
            const subCategoryTitle = subCategory
                ? string_1.StringUtil.capitalizeFirstLetter(subCategory.name)
                : undefined;
            const moduleTitle = string_1.StringUtil.capitalizeFirstLetter(this.formatFileName(module.info.name));
            console.log({ moduleTitle });
            const fileTitleBlock = subCategoryTitle
                ? `--- \ntitle: ${moduleTitle} \n---\n`
                : `--- \ntitle: ${string_1.StringUtil.capitalizeFirstLetter(module.info.name)} \n---\n`;
            // Copy the file contents
            const fileContent = fs_1.default.readFileSync(sourceFilePath, "utf8");
            logger_1.default.info("Writing tutorial to " + filePathToWrite);
            fs_1.default.writeFileSync(filePathToWrite, fileTitleBlock + fileContent, "utf8");
            module.setDestinationFilePath(destinationFilePath);
            return module.destinationFilePath;
        });
    }
    // Write documentation to file
    /**
     * Writes documentation content to a file.
     *
     * @param {Object} options - An object containing the module and destination path.
     * @param {Module} options.module - The module for which documentation is being written.
     * @param {string} options.destinationPath - The destination path where the documentation will be written.
     * @description This method writes the documentation content for a module to a specified file path.
     */
    writeDocsToFile({ module: _module, destinationPath, }) {
        const module = _module.info;
        const docs = _module.getDocs();
        // Get file path
        const qmdfilePath = destinationPath + "/" + module.name + ".qmd";
        _module.setDestinationFilePath(qmdfilePath);
        try {
            console.log({ qmdfilePath });
            fs_1.default.writeFileSync(qmdfilePath, "", "utf8");
            let fileContent = "";
            // Add module title to qmd file
            fileContent += `# ${string_1.StringUtil.capitalizeFirstLetter(module.name)}\n\n`;
            // Add module description to qmd file
            fileContent += `${module.description}\n\n`;
            // Add constructs to qmd file
            for (const _doc of docs) {
                const doc = {
                    blockInfo: _doc.data,
                    constructInfo: {
                        type: _doc.constructInfo.type,
                        name: _doc.constructInfo.name,
                    },
                };
                // Add 2 lines
                fileContent += "\n\n";
                // Add construct heading
                fileContent += `## ${doc.constructInfo.name} \n`;
                fileContent += `\`[${doc.constructInfo.type}]\`\n \n`;
                const descriptionWasAdded = doc.blockInfo.description.length > 0;
                if (descriptionWasAdded) {
                    // Add description to qmd file
                    fileContent += `**Description:**\n${doc.blockInfo.description}\n\n`;
                }
                // Add params to qmd file
                if (doc.blockInfo.params.length > 0) {
                    fileContent += `**Params:**\n\n`;
                    // Display in a table, with columns for name and description
                    fileContent += `| Name | Description |\n`;
                    fileContent += `| --- | --- |\n`;
                    for (const param of doc.blockInfo.params) {
                        fileContent += `|  ${param.name} | ${param.description} |\n`;
                    }
                    fileContent += "\n";
                }
                if (doc.blockInfo.examples &&
                    doc.blockInfo.examples.length > 0) {
                    // Add examples to qmd file
                    fileContent += `**Examples:**\n\n`;
                    for (const example of doc.blockInfo.examples) {
                        fileContent += `\`\`\`javascript\n${example}\n\`\`\`\n\n`;
                    }
                }
                // Add returns to qmd file
                if (doc.blockInfo.returns.length > 0) {
                    fileContent += `**Returns:**\n\n`;
                    fileContent += `| Type | Description |\n`;
                    fileContent += `| --- | --- |\n`;
                    for (const returnedValue of doc.blockInfo.returns) {
                        fileContent += `| ${returnedValue.type} | ${returnedValue.description} |\n`;
                    }
                    fileContent += "\n";
                }
                // Add thrown errors to qmd file
                if (doc.blockInfo.thrownErrors.length > 0) {
                    fileContent += `**Thrown Errors:**\n\n`;
                    fileContent += `| Error type | Description |\n`;
                    fileContent += `| --- | --- |\n`;
                    for (const thrownError of doc.blockInfo.thrownErrors) {
                        fileContent += `| ${thrownError.type} | ${thrownError.description} |\n`;
                    }
                    fileContent += "\n";
                }
                if (doc.blockInfo.references.length > 0) {
                    // Add hyperlinks to qmd file
                    fileContent += `**References:**\n\n`;
                    for (const reference of doc.blockInfo.references) {
                        if (reference.type === "link") {
                            fileContent += `[${reference.text}](${reference.url})\n\n`;
                        }
                        // If module name, get the original file path from modules
                        if (reference.type === "externalModule") {
                            const module = this.modules.get(reference.moduleName.toLowerCase());
                            if (module) {
                                const relativePath = path_1.default.relative(destinationPath, module.destinationFilePath);
                                fileContent += `[${reference.text}](${relativePath.replace(".qmd", ".html")})\n\n`;
                            }
                        }
                        // If module name and construct name, get the original file path from modules
                        if (reference.type === "externalModuleAndConstruct") {
                            const module = this.modules.get(reference.moduleName.toLowerCase());
                            if (module) {
                                const relativePath = path_1.default.relative(destinationPath, module.destinationFilePath);
                                fileContent += `[${reference.text}](${relativePath.replace(".qmd", ".html")}#${reference.constructName.toLowerCase()})\n\n`;
                            }
                        }
                        if (reference.type === "externalModuleWithSubcategory") {
                            const module = this.modules.get(reference.moduleName.toLowerCase());
                            if (module) {
                                const relativePath = path_1.default.relative(destinationPath, module.destinationFilePath);
                                fileContent += `[${reference.text}](${relativePath.replace(".qmd", ".html")})\n\n`;
                            }
                        }
                        if (reference.type ===
                            "externalModuleWithSubcategoryAndConstruct") {
                            const module = this.modules.get(reference.moduleName.toLowerCase());
                            if (module) {
                                const relativePath = path_1.default.relative(destinationPath, module.destinationFilePath);
                                fileContent += `[${reference.text}](${relativePath.replace(".qmd", ".html")}#${reference.constructName.toLowerCase()})\n\n`;
                            }
                        }
                        fileContent += "\n";
                    }
                }
                // TODO: Add link to qmd file
                // // Add link to qmd file
                // if (doc.blockInfo.link) {
                //     fileContent += `**See also:** [Reference](${doc.blockInfo.link})\n\n`;
                // }
            }
            fs_1.default.writeFileSync(qmdfilePath, fileContent, "utf8");
            logger_1.default.info(`Documentation written to file: ${qmdfilePath}`);
        }
        catch (error) {
            logger_1.default.error(`Error writing documentation to file: ${qmdfilePath}`);
            logger_1.default.error(error);
            throw error;
        }
    }
    // Create directory structure for documentation
    /**
     * Prepares the directory structure for documentation.
     *
     * @returns {Writer} The current Writer instance.
     * @description This method prepares the directory structure for documentation by creating necessary folders and files.
     */
    prepareDirectoryForDocs() {
        const categories = Array.from(this.categories.values());
        const folderPathToWrite = path_1.default.join(CONFIG.outputDirectory, "chapters");
        try {
            fs_1.default.mkdirSync(folderPathToWrite, { recursive: true });
            logger_1.default.info(`Documentation folder created: ${folderPathToWrite}`);
            const chapters = [];
            for (const category of categories) {
                const categoryFolderPath = path_1.default.join(folderPathToWrite, category.name);
                fs_1.default.mkdirSync(categoryFolderPath, { recursive: true });
                // Add index.qmd file to category folder
                fs_1.default.writeFileSync(path_1.default.join(categoryFolderPath, "index.qmd"), `---\ntitle: ${string_1.StringUtil.capitalizeFirstLetter(category.name)}\n---\n`, "utf8");
                logger_1.default.info(`Category folder created: ${categoryFolderPath}`);
                for (const subCategory of category.subCategories) {
                    const subCategoryFolderPath = path_1.default.join(categoryFolderPath, subCategory.name);
                    fs_1.default.mkdirSync(subCategoryFolderPath, {
                        recursive: true,
                    });
                    // Add index.qmd file to subcategory folder
                    fs_1.default.writeFileSync(path_1.default.join(subCategoryFolderPath, "index.qmd"), `---\ntitle: ${subCategory.name}\n---\n`, "utf8");
                    logger_1.default.info(`Sub-category folder created: ${subCategoryFolderPath}`);
                    // Collect subchapters for Quarto YAML
                    const subchapters = subCategory
                        .getModules()
                        .map((module) => `chapters/${category.name}/${subCategory.name}/${module.info.name}.qmd`);
                    // Group subchapters under subcategory
                    chapters.push({
                        part: subCategory.name,
                        chapters: subchapters.length > 0 ? subchapters : undefined,
                    });
                }
                // Collect chapters for Quarto YAML
                const categoryChapters = category
                    .getModules()
                    .map((module) => `chapters/${category.name}/${module.info.name}.qmd`);
                // Only add category if it has modules, this is to avoid empty categories
                categoryChapters.length > 0 &&
                    chapters.push({
                        part: category.name,
                        chapters: categoryChapters,
                    });
            }
            // Generate Quarto YAML
            this.generateQuartoYAML(chapters);
            return this;
        }
        catch (error) {
            logger_1.default.error("Error preparing directory for docs");
            logger_1.default.error(error);
            throw error;
        }
    }
    // Write documentation for each category to file
    /**
     * Writes documentation for each category to file.
     *
     * @returns {Writer} The current Writer instance.
     * @description This method writes documentation for each category to a corresponding file within the documentation directory.
     */
    writeDocsFromCategoriesToFile() {
        const categories = Array.from(this.categories.values());
        for (const category of categories) {
            const categoryFolderPath = CONFIG.outputDirectory + `/chapters/${category.name}`;
            const directModules = category.getModules();
            for (const module of directModules) {
                this.writeDocsToFile({
                    module,
                    destinationPath: categoryFolderPath,
                });
            }
            for (const subCategory of category.subCategories) {
                const subCategoryFolderPath = categoryFolderPath + "/" + subCategory.name;
                for (const module of subCategory.getModules()) {
                    this.writeDocsToFile({
                        module,
                        destinationPath: subCategoryFolderPath,
                    });
                }
            }
        }
        return this;
    }
    /**
     * Add tutorials to generated Doc
     *
     * @description This method reads through the tutorials folder and copies them to the destination `/docs` folder, it also
     * follows the structure of the tutorials set by the `config.json` in the tutorials folder if any
     *
     * @returns { { addTutorialChaptesToQuartoYml: () => {}}}
     */
    addTutorialsToGeneratedDoc() {
        return __awaiter(this, void 0, void 0, function* () {
            const { tutorialCategory } = this.createModulesAndCategoriesFromTutorialsConfig();
            logger_1.default.info("Writing tutorials to Quarto YAML");
            fs_1.default.mkdirSync(this.tutorialsOutputPath, { recursive: true });
            // Check if there is an image folder in the tutorials folder
            // If there is, copy it to the images folder in the docs folder
            const imagesFolderPath = path_1.default.join(this.tutorialsSourcePath, "images");
            if (fs_1.default.existsSync(imagesFolderPath)) {
                const imagesDestinationPath = path_1.default.join(CONFIG.outputDirectory, "/chapters/tutorials/images");
                fs_1.default.mkdirSync(imagesDestinationPath, { recursive: true });
                function recursivelyCopyContentOfFolderToNewPath(currentPath, newPath) {
                    const files = fs_1.default.readdirSync(currentPath);
                    for (const file of files) {
                        const filePath = path_1.default.join(currentPath, file);
                        const newFilePath = path_1.default.join(newPath, file);
                        const stats = fs_1.default.statSync(filePath);
                        if (stats.isDirectory()) {
                            fs_1.default.mkdirSync(newFilePath, { recursive: true });
                            recursivelyCopyContentOfFolderToNewPath(filePath, newFilePath);
                        }
                        else {
                            fs_1.default.copyFileSync(filePath, newFilePath);
                        }
                    }
                }
                // Copy all content of the folder to new destination
                recursivelyCopyContentOfFolderToNewPath(imagesFolderPath, imagesDestinationPath);
            }
            const chapters = [];
            const subCategories = tutorialCategory.getSubCategories();
            for (const subCategory of subCategories) {
                // Copy tutorials to their respective folders in the docs
                logger_1.default.info(`Copying tutorials for ${subCategory.name}`);
                const subCategoryModules = subCategory.getModules();
                const modulesDestinationPaths = [];
                for (const module of subCategoryModules) {
                    const destinationFilePath = yield this.writeTutorialToFile({
                        module,
                        subCategory,
                        tutorialCategory,
                    });
                    modulesDestinationPaths.push(destinationFilePath);
                }
                // Add chapters to the quarto.yml file
                chapters.push({
                    part: subCategory.name,
                    chapters: modulesDestinationPaths,
                });
            }
            for (const module of tutorialCategory.getModules()) {
                const destinationFilePath = yield this.writeTutorialToFile({
                    module,
                    tutorialCategory,
                });
                chapters.push({
                    part: module.info.name,
                    chapters: [destinationFilePath],
                });
            }
            // return { addTutorialChaptersToQuartoYml: () => this.addTutorialChaptersToQuartoYml(chapters) }
            return chapters;
        });
    }
    /**
     * Add tutorials to _quarto.yml
     *
     * @description This method adds the tutorials as chapters into the _quarto.yml file
     *
     * @param chapters
     * @returns
     */
    addTutorialChaptersToQuartoYml(chapters) {
        return __awaiter(this, void 0, void 0, function* () {
            const quartoYAMLPath = path_1.default.join(CONFIG.outputDirectory, "_quarto.yml");
            // Check if quarto.yml file exists
            if (!fs_1.default.existsSync(quartoYAMLPath)) {
                logger_1.default.error("Quarto YAML file does not exist");
                return;
            }
            // Read quarto.yml file
            const quartoYAML = yaml_1.default.parse(fs_1.default.readFileSync(quartoYAMLPath, "utf8"));
            // add tutorials to quarto.yml file
            quartoYAML.book.chapters.push({
                part: "Tutorials",
                chapters: chapters.map((chapter) => chapter.chapters).flat(),
            });
            // Write updated quarto.yml file
            fs_1.default.writeFileSync(quartoYAMLPath, yaml_1.default.stringify(quartoYAML), "utf8");
            return this;
        });
    }
    /**
     * Add language specs to _quarto.yml
     *
     * @description This method adds the language specs to the _quarto.yml file
     *
     * @param languages
     * @returns void
     */
    addLanguageSpecsToQuartoConfig(languages) {
        const configToAdd = {
            babelquarto: {
                languagecodes: languages.map((language) => ({
                    name: language,
                    text: `Version in ${language}`,
                })),
                mainlanguage: "en",
                // Remove the first language which is the default language
                languages: languages.slice(1),
            },
            lang: "en",
        };
        const landDesc = {};
        languages.forEach((language) => {
            landDesc["title-" + language] = "Title in " + language;
            landDesc["description-" + language] = "Description in " + language;
            landDesc["author-" + language] = "Author in " + language;
        });
        const config = Object.assign(Object.assign({}, configToAdd), landDesc);
        // Wirte this config to the end of the quarto file
        const quartoYAMLPath = path_1.default.join(CONFIG.outputDirectory, "_quarto.yml");
        // Check if quarto.yml file exists
        if (!fs_1.default.existsSync(quartoYAMLPath)) {
            logger_1.default.error("Quarto YAML file does not exist");
            return;
        }
        // Read quarto.yml file
        let quartoYAML = yaml_1.default.parse(fs_1.default.readFileSync(quartoYAMLPath, "utf8"));
        // add tutorials to quarto.yml file
        quartoYAML = Object.assign(Object.assign({}, quartoYAML), config);
        console.log({ config });
        // Write updated quarto.yml file
        fs_1.default.writeFileSync(quartoYAMLPath, yaml_1.default.stringify(quartoYAML), "utf8");
        return this;
    }
    /**
     * Create localized files for each language
     *
     * @param languages
     * @returns
     * @description This method creates a copy of each qmd file in the docs folder for each language
     *
     */
    createLocalizedFilesForEachLanguage(languages) {
        // Check through all the qmd files in the docs folder and create a copy for each language
        // it should follow this format `filename-lang.language.qmd`
        // Remove the first language which is the default language
        languages = languages.slice(1);
        const localizeFilesInFolder = (folderPath) => {
            const files = fs_1.default.readdirSync(folderPath);
            for (const file of files) {
                const filePath = path_1.default.join(folderPath, file);
                if (fs_1.default.statSync(filePath).isDirectory()) {
                    localizeFilesInFolder(filePath);
                    continue;
                }
                const fileExtension = path_1.default.extname(file);
                const fileName = path_1.default.basename(file, fileExtension);
                if (fileName === "_quarto")
                    continue;
                for (const language of languages) {
                    const localizedFileName = `${fileName}.${language}${fileExtension}`;
                    const localizedFilePath = path_1.default.join(folderPath, localizedFileName);
                    fs_1.default.copyFileSync(filePath, localizedFilePath);
                }
            }
        };
        // Act on files in the docs folder
        localizeFilesInFolder(CONFIG.outputDirectory);
    }
    static fixMissingLocalizedIndexFiles(langs) {
        return __awaiter(this, void 0, void 0, function* () {
            // In some cases babel quarto will not create localized index files for the languages in this format /ar/index.ar.html instead
            // it will create /ar/index.html, this method will fix that by creating the localized index files for each language
            const docsFolderPath = path_1.default.join(CONFIG.outputDirectory, "/_book");
            // Check all the folders in the _book folder
            for (const folder of langs.slice(1)) {
                const folderPath = path_1.default.join(docsFolderPath, folder);
                if (fs_1.default.statSync(folderPath).isDirectory()) {
                    const files = fs_1.default.readdirSync(folderPath);
                    for (const file of files) {
                        const filePath = path_1.default.join(folderPath, file);
                        const fileExtension = path_1.default.extname(file);
                        const fileName = path_1.default.basename(file, fileExtension);
                        if (fileName === "index") {
                            // Get current folder name
                            const folderName = path_1.default.basename(folderPath);
                            const localizedFileName = `index.${folderName}.html`;
                            const localizedFilePath = path_1.default.join(folderPath, localizedFileName);
                            fs_1.default.copyFileSync(filePath, localizedFilePath);
                        }
                    }
                }
            }
        });
    }
}
exports.default = Writer;
