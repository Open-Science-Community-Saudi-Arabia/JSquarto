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

import { Doc, ModuleBlockInfo } from "../interfaces";
import fs from "fs";
import { Category, Module, ModuleDoc, SubCategory } from "./components";
import logger from "./logger";
import path from "path";
import YAML from "yaml";
import { DEFAULT_QUARTO_YAML_CONTENT, INDEX_QMD_CONTENT } from "../constants";
import { StringUtil } from "./string";

interface Chapter {
    part: string;
    chapters:
    | string[]
    | {
        title: string;
        path: string;
    }[]
    | undefined;
}

export default class Writer {
    private modules: Map<string, Module> = new Map();
    private categories: Map<string, Category> = new Map();
    private tutorialsSourcePath: string;
    private tutorialsDirPath: string;

    /**
     * Initializes a new instance of the Writer class.
     *
     * @param {Map<string, Module>} modules - A map of modules.
     * @param {Map<string, Category>} categories - A map of categories.
     */
    constructor(
        modules: Map<string, Module>,
        categories: Map<string, Category>,
        pathConfig: Partial<{
            tutorial: string,
            sourceFiles: string,
        }> = {}
    ) {
        this.modules = modules;
        this.categories = categories;
        this.tutorialsDirPath = path.join(
            __dirname,
            "..",
            "..",
            "docs",
            "chapters",
            "tutorials"
        );
        this.tutorialsSourcePath = pathConfig.tutorial ?? path.join(
            __dirname,
            "..",
            "..",
            "tutorials",
        );
    }

    /**
     * Generates the Quarto YAML configuration file.
     *
     * @param {Chapter[]} chapters - An array of chapters to include in the YAML file.
     * @description This method generates the Quarto YAML configuration file based on the provided chapters.
     */
    private generateQuartoYAML(chapters: Chapter[]): void {
        try {
            // Check if there is a index.md file in the root of the docs folder
            // If not, create one
            const rootDocsPath = __dirname + "/../../docs";
            const indexFilePath = rootDocsPath + "/index.md";
            if (!fs.existsSync(indexFilePath)) {
                fs.writeFileSync(indexFilePath, INDEX_QMD_CONTENT, "utf8");
            }

            const quartoYAML = {
                ...DEFAULT_QUARTO_YAML_CONTENT,
                book: {
                    ...DEFAULT_QUARTO_YAML_CONTENT.book,
                    chapters: [
                        "index.md",
                        ...chapters.map((chapter) => ({
                            ...chapter,
                            part: StringUtil.capitalizeFirstLetter(
                                chapter.part,
                            ),
                        })),
                    ],
                },
            };

            if (chapters.length === 0) {
                logger.warn("No chapters found for Quarto YAML");
            }

            const folderPathToWrite = path.join(__dirname, "..", "..", "docs");
            const quartoYAMLPath = path.join(folderPathToWrite, "_quarto.yml");

            fs.writeFileSync(
                quartoYAMLPath,
                YAML.stringify(quartoYAML),
                "utf8",
            );
            logger.info(`Quarto YAML file generated: ${quartoYAMLPath}`);
        } catch (error) {
            logger.error("Error generating Quarto YAML file");
            logger.error(error);
            throw error;
        }
    }

    public addLanguageSpecsToQuartoConfig(languages: string[]) {
        const configToAdd = {
            babelquarto: {
                languagecodes: languages.map(language => ({
                    name: language,
                    text: `Version in ${language}`
                })),
                mainlanguage: 'en',
                languages
            },
            lang: 'en'
        }

        const landDesc = {} as Record<string, string>

        languages.forEach(language => {
            landDesc['title-' + language] = 'title in ' + language
            landDesc['description-' + language] = 'description in ' + language
            landDesc['author-' + language] = 'author in ' + language
        })

        const config = {
            ...configToAdd,
            ...landDesc
        }

        // Wirte this config to the end of the quarto file
        const quartoYAMLPath = path.join(
            __dirname,
            "..",
            "..",
            "docs",
            "_quarto.yml",
        );

        // Check if quarto.yml file exists
        if (!fs.existsSync(quartoYAMLPath)) {
            logger.error("Quarto YAML file does not exist");
            return;
        }

        // Read quarto.yml file
        const quartoYAML = YAML.parse(fs.readFileSync(quartoYAMLPath, "utf8"));

        // add tutorials to quarto.yml file
        quartoYAML.babelquarto = config;

        // Write updated quarto.yml file
        fs.writeFileSync(quartoYAMLPath, YAML.stringify(quartoYAML), "utf8");
    }

    public createCorrespondingFilesForDifferenceLanguages(languages: string[]) {
        // Check through all the qmd files in the docs folder and create a copy for each language
        // it should
    }
    /**
     * Retrieves the directory structure for documentation.
     *
     * @returns {Object} An object representing the directory structure.
     * @description This method retrieves the directory structure for documentation and returns an object representing it.
     */
    public getDirectoryForDocs(): object {
        const categories = Array.from(this.categories.values());
        const result: {
            [key: string]: {
                path: string;
                modules: { path: string; name: string }[];
            };
        } = {};

        const folderPathToWrite = path.join(
            __dirname,
            "..",
            "..",
            "docs",
            "chapters",
        );

        for (const category of categories) {
            const categoryFolderPath = path.join(
                folderPathToWrite,
                category.name,
            );

            for (const subCategory of category.subCategories) {
                const subCategoryFolderPath = path.join(
                    categoryFolderPath,
                    subCategory.name,
                );

                result[subCategory.name] = {
                    path: subCategoryFolderPath,
                    modules: subCategory.getModules().map((module) => {
                        return {
                            path: subCategoryFolderPath,
                            name: module.info.name,
                        };
                    }),
                };
            }
        }

        return result;
    }

    /**
     * Creates modules and categories based on configuration from `/tutorials/config.json`
     * 
     * @description Creates modules and Categories from tutorials config, these will be required to write them as chapters in the quarto.yml file
     * 
     * @returns 
     */
    private createModulesAndCategoriesFromTutorialsConfig(): { modules: Map<string, Module>; tutorialCategory: Category; } {
        // Get the path to the tutorials configuration file
        const tutorialsConfigPath = path.join(
            this.tutorialsSourcePath,
            "config.json",
        );

        // Read tutorials configuration from the JSON file
        const tutorialsConfig: Tutorial = JSON.parse(
            fs.readFileSync(tutorialsConfigPath, "utf8"),
        );

        // Initialize modules map, tutorial category, and subcategories map
        const modules = new Map<string, Module>();
        const tutorialCategory = new Category("tutorials");
        const subCategories = new Map<string, SubCategory>();

        // Iterate over each tutorial in the configuration
        for (const tutorial of Object.keys(tutorialsConfig)) {
            const tutorialData = tutorialsConfig[tutorial];
            const tutorialIsASubCategory = tutorialData.children;

            // Check if the tutorial is a subcategory
            if (tutorialIsASubCategory) {
                // Create a new subcategory
                const subCategory = new SubCategory({
                    name: tutorial,
                    category: tutorialCategory,
                });
                const subCategoryModules = new Map<string, Module>();

                // Iterate over each sub-tutorial in the subcategory
                const childrenTutorial =
                    tutorialData.children ??
                    ({} as unknown as NonNullable<
                        typeof tutorialData.children
                    >);
                for (const subTutorial of Object.keys(childrenTutorial)) {
                    const subTutorialData =
                        childrenTutorial[
                        subTutorial as keyof Tutorial["children"]
                        ];

                    // Create a module for the sub-tutorial
                    const module = new Module({
                        name: subTutorial,
                        description: subTutorialData.title,
                        category: {
                            name: tutorial,
                            subCategory: subTutorial,
                        },
                        references: [],
                    });
                    // Get sourceFilePath from where the tutorial is located
                    const sourceFilePath = path.join(
                        this.tutorialsSourcePath,
                        tutorial + "/" + subTutorial + ".qmd",
                    );
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
            } else {
                // Create a module for the tutorial
                const module = new Module({
                    name: tutorial,
                    description: tutorialData.title,
                    category: {
                        name: tutorialCategory.name,
                        subCategory: undefined,
                    },
                    references: [],
                });
                const sourceFilePath = path.join(
                    this.tutorialsSourcePath,
                    module.info.name + ".qmd",
                );
                module.setSourceFilePath(sourceFilePath);

                // Add the module to the modules map
                modules.set(module.info.name, module);
                tutorialCategory.addModule(module)
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
    private async writeTutorialToFile({ module, subCategory, tutorialCategory }: { tutorialCategory: Category, module: Module, subCategory?: SubCategory }) {
        const sourceFilePath = module.sourceFilePath;

        const subCategoryFolderPath = subCategory ? path.join(
            this.tutorialsDirPath,
            subCategory.name,
        ) : undefined

        if (subCategoryFolderPath) fs.mkdirSync(subCategoryFolderPath, { recursive: true });

        const folderPathForTutorialsWithoutParentCategory = path.resolve(__dirname + "../../../docs/chapters/" + tutorialCategory.name)
        const destinationFilePath = path.relative(
            __dirname + "/../../docs/",
            path.join(
                subCategoryFolderPath ?? folderPathForTutorialsWithoutParentCategory,
                `${module.info.name}.qmd`
            )
        );

        const filePathToWrite = path.join(__dirname + "../../../docs/", destinationFilePath);
        const directoryPath = path.dirname(filePathToWrite);
        if (!fs.existsSync(directoryPath)) fs.mkdirSync(directoryPath, { recursive: true });

        fs.writeFileSync(filePathToWrite, "", "utf8");

        const subCategoryTitle = subCategory ? StringUtil.capitalizeFirstLetter(subCategory.name) : undefined
        const moduleTitle = StringUtil.capitalizeFirstLetter(this.formatFileName(module.info.name));
        const fileTitleBlock = subCategoryTitle ? `###${moduleTitle}\n\n` : `### ${StringUtil.capitalizeFirstLetter(module.info.name)}\n\n`;;

        // Copy the file contents
        const fileContent = fs.readFileSync(sourceFilePath, "utf8");

        logger.info('Writing tutorial to ' + filePathToWrite)
        fs.writeFileSync(
            filePathToWrite,
            fileTitleBlock + fileContent,
            "utf8"
        );

        module.setDestinationFilePath(destinationFilePath)

        return module.destinationFilePath
    }

    // Create directory structure for documentation
    /**
     * Prepares the directory structure for documentation.
     *
     * @returns {Writer} The current Writer instance.
     * @description This method prepares the directory structure for documentation by creating necessary folders and files.
     */
    public prepareDirectoryForDocs(): Writer {
        const categories = Array.from(this.categories.values());

        const folderPathToWrite = path.join(
            __dirname,
            "..",
            "..",
            "docs",
            "chapters",
        );

        try {
            fs.mkdirSync(folderPathToWrite, { recursive: true });
            logger.info(`Documentation folder created: ${folderPathToWrite}`);

            const chapters: Chapter[] = [];

            for (const category of categories) {
                const categoryFolderPath = path.join(
                    folderPathToWrite,
                    category.name,
                );
                fs.mkdirSync(categoryFolderPath, { recursive: true });
                // Add index.qmd file to category folder
                fs.writeFileSync(
                    path.join(categoryFolderPath, "index.qmd"),
                    `---\ntitle: ${StringUtil.capitalizeFirstLetter(
                        category.name,
                    )}\n---\n`,
                    "utf8",
                );

                logger.info(`Category folder created: ${categoryFolderPath}`);

                for (const subCategory of category.subCategories) {
                    const subCategoryFolderPath = path.join(
                        categoryFolderPath,
                        subCategory.name,
                    );
                    fs.mkdirSync(subCategoryFolderPath, {
                        recursive: true,
                    });

                    // Add index.qmd file to subcategory folder
                    fs.writeFileSync(
                        path.join(subCategoryFolderPath, "index.qmd"),
                        `---\ntitle: ${subCategory.name}\n---\n`,
                        "utf8",
                    );
                    logger.info(
                        `Sub-category folder created: ${subCategoryFolderPath}`,
                    );

                    // Collect subchapters for Quarto YAML
                    const subchapters = subCategory
                        .getModules()
                        .map(
                            (module) =>
                                `chapters/${category.name}/${subCategory.name}/${module.info.name}.qmd`,
                        );

                    // Group subchapters under subcategory
                    chapters.push({
                        part: subCategory.name,
                        chapters:
                            subchapters.length > 0 ? subchapters : undefined,
                    });
                }

                // Collect chapters for Quarto YAML
                const categoryChapters: string[] = category
                    .getModules()
                    .map(
                        (module) =>
                            `chapters/${category.name}/${module.info.name}.qmd`,
                    );

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
        } catch (error) {
            logger.error("Error preparing directory for docs");
            logger.error(error);
            throw error;
        }
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
    private writeDocsToFile({
        module: _module,
        destinationPath,
    }: {
        module: Module;
        destinationPath: string;
    }): void {
        const module = _module.info;
        const docs = _module.getDocs();

        // Get file path
        const qmdfilePath = destinationPath + "/" + module.name + ".qmd";

        _module.setDestinationFilePath(qmdfilePath);

        try {
            fs.writeFileSync(qmdfilePath, "", "utf8");

            let fileContent = "";

            // Add module title to qmd file
            fileContent += `# ${StringUtil.capitalizeFirstLetter(
                module.name,
            )}\n\n`;

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

                const descriptionWasAdded =
                    doc.blockInfo.description.length > 0;
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

                if (
                    doc.blockInfo.examples &&
                    doc.blockInfo.examples.length > 0
                ) {
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

                    // console.log({ references: doc.blockInfo.references })
                    for (const reference of doc.blockInfo.references) {
                        if (reference.type === "link") {
                            fileContent += `[${reference.text}](${reference.url})\n\n`;
                        }

                        // If module name, get the original file path from modules
                        if (reference.type === "externalModule") {
                            const module = this.modules.get(
                                reference.moduleName.toLowerCase(),
                            );
                            if (module) {
                                const relativePath = path.relative(
                                    destinationPath,
                                    module.destinationFilePath,
                                );
                                fileContent += `[${reference.text
                                    }](${relativePath.replace(
                                        ".qmd",
                                        ".html",
                                    )})\n\n`;
                            }
                        }

                        // If module name and construct name, get the original file path from modules
                        if (reference.type === "externalModuleAndConstruct") {
                            const module = this.modules.get(
                                reference.moduleName.toLowerCase(),
                            );
                            if (module) {
                                const relativePath = path.relative(
                                    destinationPath,
                                    module.destinationFilePath,
                                );
                                fileContent += `[${reference.text
                                    }](${relativePath.replace(
                                        ".qmd",
                                        ".html",
                                    )}#${reference.constructName.toLowerCase()})\n\n`;
                            }
                        }

                        if (
                            reference.type === "externalModuleWithSubcategory"
                        ) {
                            const module = this.modules.get(
                                reference.moduleName.toLowerCase(),
                            );
                            if (module) {
                                const relativePath = path.relative(
                                    destinationPath,
                                    module.destinationFilePath,
                                );
                                fileContent += `[${reference.text
                                    }](${relativePath.replace(
                                        ".qmd",
                                        ".html",
                                    )})\n\n`;
                            }
                        }

                        if (
                            reference.type ===
                            "externalModuleWithSubcategoryAndConstruct"
                        ) {
                            const module = this.modules.get(
                                reference.moduleName.toLowerCase(),
                            );
                            if (module) {
                                const relativePath = path.relative(
                                    destinationPath,
                                    module.destinationFilePath,
                                );
                                fileContent += `[${reference.text
                                    }](${relativePath.replace(
                                        ".qmd",
                                        ".html",
                                    )}#${reference.constructName.toLowerCase()})\n\n`;
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

            fs.writeFileSync(qmdfilePath, fileContent, "utf8");
            logger.info(`Documentation written to file: ${qmdfilePath}`);
        } catch (error) {
            logger.error(`Error writing documentation to file: ${qmdfilePath}`);
            logger.error(error);
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
    public writeDocsFromCategoriesToFile(): Writer {
        const categories = Array.from(this.categories.values());

        for (const category of categories) {
            const categoryFolderPath =
                __dirname + `/../../docs/chapters/${category.name}`;

            const directModules = category.getModules();
            for (const module of directModules) {
                this.writeDocsToFile({
                    module,
                    destinationPath: categoryFolderPath,
                });
            }

            for (const subCategory of category.subCategories) {
                const subCategoryFolderPath =
                    categoryFolderPath + "/" + subCategory.name;

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
     * @description Formats file names by removing all underscores `(_)`
     * @param name 
     * @returns 
     */
    private formatFileName(name: string) {
        // Replace all _ with -
        // Capitalize first capitalizeFirstLetter

        return name.replace(/_/g, "-");
    }

    /**
     * Add tutorials to generated Doc
     * 
     * @description This method reads through the tutorials folder and copies them to the destination `/docs` folder, it also
     * follows the structure of the tutorials set by the `config.json` in the tutorials folder if any
     * 
     * @returns { { addTutorialChaptesToQuartoYml: () => {}}}
     */
    public async addTutorialsToGeneratedDoc() {
        const { tutorialCategory } = this.createModulesAndCategoriesFromTutorialsConfig();

        logger.info("Writing tutorials to Quarto YAML");

        fs.mkdirSync(this.tutorialsDirPath, { recursive: true });

        const chapters: Chapter[] = [];
        const subCategories = tutorialCategory.getSubCategories();

        for (const subCategory of subCategories) {
            // Copy tutorials to their respective folders in the docs
            logger.info(`Copying tutorials for ${subCategory.name}`);

            const subCategoryModules = subCategory.getModules();
            const modulesDestinationPaths: string[] = []
            for (const module of subCategoryModules) {
                const destinationFilePath = await this.writeTutorialToFile({ module, subCategory, tutorialCategory });
                modulesDestinationPaths.push(destinationFilePath)
            }

            // Add chapters to the quarto.yml file
            chapters.push({
                part: subCategory.name,
                chapters: modulesDestinationPaths
            });
        }

        for (const module of tutorialCategory.getModules()) {
            const destinationFilePath = await this.writeTutorialToFile({
                module, tutorialCategory
            })

            chapters.push({
                part: module.info.name,
                chapters: [destinationFilePath]
            });
        }

        // return { addTutorialChaptersToQuartoYml: () => this.addTutorialChaptersToQuartoYml(chapters) }
        return chapters
    }

    /**
     * Add tutorials to _quarto.yml
     * 
     * @description This method adds the tutorials as chapters into the _quarto.yml file
     * 
     * @param chapters 
     * @returns 
     */
    public async addTutorialChaptersToQuartoYml(chapters: Chapter[]) {
        const quartoYAMLPath = path.join(
            __dirname,
            "..",
            "..",
            "docs",
            "_quarto.yml",
        );

        // Check if quarto.yml file exists
        if (!fs.existsSync(quartoYAMLPath)) {
            logger.error("Quarto YAML file does not exist");
            return;
        }

        // Read quarto.yml file
        const quartoYAML = YAML.parse(fs.readFileSync(quartoYAMLPath, "utf8"));

        // add tutorials to quarto.yml file
        quartoYAML.book.chapters.push({
            part: "Tutorials",
            chapters: chapters.map((chapter) => chapter.chapters).flat(),
        });

        // Write updated quarto.yml file
        fs.writeFileSync(quartoYAMLPath, YAML.stringify(quartoYAML), "utf8");
    }
}

interface Tutorial {
    [key: string]: {
        title: string;
        children?: {
            [key: string]: {
                title: string;
            };
        };
    };
}
