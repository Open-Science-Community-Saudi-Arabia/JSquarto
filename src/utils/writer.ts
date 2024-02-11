import { Doc, ModuleBlockInfo } from "../interfaces";
import fs from "fs";
import { Category, ModuleDoc } from "./docStructureGenerator";
import logger from "./logger";
import path from "path";
import YAML from "yaml";

export default class Writer {
    private generateQuartoYAML(chapters: string[]): void {
        try {
            const quartoYAML = {
                project: {
                    type: "book",
                    outputDir: "_book",
                },
                book: {
                    title: "Open Innovation Platform Documentation",
                    // Add other book metadata here
                    chapters,
                },
                bibliography: "references.bib", // Update this as needed
            };

            const folderPathToWrite = path.join(__dirname, "..", "..", "docs");
            const quartoYAMLPath = path.join(folderPathToWrite, "quarto.yml");

            fs.writeFileSync(
                quartoYAMLPath,
                YAML.stringify(quartoYAML),
                "utf8",
            );
            logger.info(`Quarto YAML file generated: ${quartoYAMLPath}`);
        } catch (error) {
            logger.error("Error generating Quarto YAML file");
            logger.error(error);
        }
    }

    public prepareDirectoryForDocs(categories: Category[]) {
        const folderPathToWrite = path.join(
            __dirname,
            "..",
            "..",
            "docs/chapters",
        );

        try {
            fs.mkdirSync(folderPathToWrite, { recursive: true });
            logger.info(`Documentation folder created: ${folderPathToWrite}`);

            const chapters: string[] = [];

            for (const category of categories) {
                const categoryFolderPath = path.join(
                    folderPathToWrite,
                    category.name,
                );
                fs.mkdirSync(categoryFolderPath, { recursive: true });
                logger.info(`Category folder created: ${categoryFolderPath}`);

                fs.writeFileSync(
                    path.join(categoryFolderPath, "index.qmd"),
                    `---\ntitle: ${category.name}\n---\n`,
                    "utf8",
                );
                logger.info(
                    `Index.qmd file created for category: ${category.name}`,
                );

                for (const subCategory of category.subCategories) {
                    const subCategoryFolderPath = path.join(
                        categoryFolderPath,
                        subCategory.name,
                    );
                    fs.mkdirSync(subCategoryFolderPath, { recursive: true });
                    logger.info(
                        `Sub-category folder created: ${subCategoryFolderPath}`,
                    );

                    fs.writeFileSync(
                        path.join(subCategoryFolderPath, "index.qmd"),
                        `---\ntitle: ${subCategory.name}\n---\n`,
                        "utf8",
                    );
                    logger.info(
                        `Index.qmd file created for sub-category: ${subCategory.name}`,
                    );

                    // Collect chapters for Quarto YAML
                    chapters.push(
                        ...subCategory
                            .getModules()
                            .map(
                                (module) =>
                                    `chapters/${category.name}/${subCategory.name}/${module.info.name}.qmd`,
                            ),
                    );
                }
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

            //  Add module title to qmd file
            fileContent += `--- \n title: ${module.name} \n---\n`;

            // Add module description to qmd file
            fileContent += `## Description \n ${module.description} \n`;

            // Add constructs to qmd file
            for (const _doc of docs) {
                const doc = {
                    blockInfo: _doc.data,
                    constructInfo: {
                        type: "Function",
                        name: module.name,
                    },
                };

                // Add 2 lines
                fileContent += "\n\n";

                fileContent += `## ${doc.constructInfo.type} ${doc.constructInfo.name} \n`;

                // Add description to qmd file
                fileContent += `### Description \n ${doc.blockInfo.description} \n`;

                // Add params to qmd file
                if (doc.blockInfo.params.length > 0) {
                    fileContent += `### Params \n`;
                    for (const param of doc.blockInfo.params) {
                        fileContent += `**${param.name}**: ${param.description} \n`;
                    }
                }

                // Add returns to qmd file
                if (doc.blockInfo.returns.length > 0) {
                    fileContent += `### Returns \n`;
                    for (const returnedValue of doc.blockInfo.returns) {
                        fileContent += `**${returnedValue.type}**: ${returnedValue.description} \n`;
                    }
                }

                // Add thrown errors to qmd file
                if (doc.blockInfo.thrownErrors.length > 0) {
                    fileContent += `### Thrown Errors \n`;
                    for (const thrownError of doc.blockInfo.thrownErrors) {
                        fileContent += `**${thrownError.type}**: ${thrownError.description} \n`;
                    }
                }

                // Add link to qmd file
                if (doc.blockInfo.link) {
                    fileContent += `### Link \n ${doc.blockInfo.link} \n`;
                }
            }

            fs.writeFileSync(qmdfilePath, fileContent, "utf8");
            logger.info(`Documentation written to file: ${qmdfilePath}`);
        } catch (error) {
            logger.error(`Error writing documentation to file: ${qmdfilePath}`);
            logger.error(error);
        }
    }

    public writeDocsFromCategoriesToFile(categories: Category[]) {
        for (const category of categories) {
            const categoryFolderPath =
                __dirname + `/../../docs/chapters/${category.name}`;

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

    // public prepareDirectoryForDocs(categories: Category[]) {
    //     const folderPathToWrite = __dirname + `/../../docs`;
    //
    //     // Create folder if it doesn't exist
    //     if (!fs.existsSync(folderPathToWrite)) {
    //         fs.mkdirSync(folderPathToWrite, { recursive: true });
    //         logger.info(`Documentation folder created: ${folderPathToWrite}`);
    //     }
    //
    //     // Create sub folders for each category and add a default index.qmd file for each category
    //     // For the sub categories, add a default index.qmd file for each sub category
    //     // Write the category name to the index.qmd file
    //     // Write the sub category name to the index.qmd file
    //     for (const category of categories) {
    //         const categoryFolderPath = folderPathToWrite + "/" + category.name;
    //         if (!fs.existsSync(categoryFolderPath)) {
    //             fs.mkdirSync(categoryFolderPath, { recursive: true });
    //             logger.info(`Category folder created: ${categoryFolderPath}`);
    //         }
    //
    //         fs.writeFileSync(
    //             categoryFolderPath + "/index.qmd",
    //             `--- \n title: ${category.name} \n---\n`,
    //             "utf8",
    //         );
    //         logger.info(
    //             `Index.qmd file created for category: ${category.name}`,
    //         );
    //
    //         for (const subCategory of category.subCategories) {
    //             const subCategoryFolderPath =
    //                 categoryFolderPath + "/" + subCategory.name;
    //             if (!fs.existsSync(subCategoryFolderPath)) {
    //                 fs.mkdirSync(subCategoryFolderPath, { recursive: true });
    //                 logger.info(
    //                     `Sub-category folder created: ${subCategoryFolderPath}`,
    //                 );
    //             }
    //
    //             fs.writeFileSync(
    //                 subCategoryFolderPath + "/index.qmd",
    //                 `--- \n title: ${subCategory.name} \n---\n`,
    //                 "utf8",
    //             );
    //             logger.info(
    //                 `Index.qmd file created for sub-category: ${subCategory.name}`,
    //             );
    //         }
    //     }
    //
    //     return this;
    // }
}
