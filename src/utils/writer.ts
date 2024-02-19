/**
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
import { Category, ModuleDoc } from "./components";
import logger from "./logger";
import path from "path";
import YAML from "yaml";
import { DEFAULT_QUARTO_YAML_CONTENT, INDEX_QMD_CONTENT } from "../constants";

interface Chapter {
    part: string;
    chapters: string[] | undefined;
}

export default class Writer {
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
                    chapters: ["index.md", ...chapters],
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

    public getDirectoryForDocs(categories: Category[]) {
        const result: {
            [key: string]: {
                path: string;
                modules: { path: string; name: string }[];
            };
        } = {}

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

        return result
    }

    // Create directory structure for documentation
    public prepareDirectoryForDocs(categories: Category[]) {
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
                    `---\ntitle: ${category.name}\n---\n`,
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
    private writeDocsToFile({
        module,
        destinationPath,
        docs,
    }: {
        module: ModuleBlockInfo;
        destinationPath: string;
        docs: ModuleDoc[];
    }) {
        // Get file path
        const qmdfilePath = destinationPath + "/" + module.name + ".qmd";

        try {
            fs.writeFileSync(qmdfilePath, "", "utf8");

            let fileContent = "";

            // Add module title to qmd file
            fileContent += `# ${module.name}\n\n`;

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

                if (doc.blockInfo.examples) {
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

                        if (reference.type === "localModule") {
                            fileContent += `[${reference.text}](../../${reference.moduleName}.qmd)\n\n`;
                        }

                        if (reference.type === "externalModule") {
                            fileContent += `[${reference.text}](${reference.moduleName}.qmd})\n\n`;
                        }

                        if (reference.type === "externalModuleConstruct") {
                            fileContent += `[${reference.text}](${reference.moduleName}.qmd#${reference.constructName})\n\n`;
                        }

                        if (reference.type === "localModuleConstruct") {
                            fileContent += `[${reference.text}](../../${reference.moduleName}.qmd#${reference.constructName})\n\n`;
                        }

                        fileContent += "\n";
                    }
                }
                // Add link to qmd file
                if (doc.blockInfo.link) {
                    fileContent += `**See also:** [Reference](${doc.blockInfo.link})\n\n`;
                }
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
    public writeDocsFromCategoriesToFile(categories: Category[]) {
        for (const category of categories) {
            const categoryFolderPath =
                __dirname + `/../../docs/chapters/${category.name}`;

            const directModules = category.getModules();
            for (const module of directModules) {
                this.writeDocsToFile({
                    module: module.info,
                    destinationPath: categoryFolderPath,
                    docs: module.getDocs(),
                });
            }

            for (const subCategory of category.subCategories) {
                const subCategoryFolderPath =
                    categoryFolderPath + "/" + subCategory.name;

                for (const module of subCategory.getModules()) {
                    this.writeDocsToFile({
                        module: module.info,
                        destinationPath: subCategoryFolderPath,
                        docs: module.getDocs(),
                    });
                }
            }
        }

        return this;
    }
}
