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
exports.deleteEmptyFoldersInOutDir = exports.fixFileExtensionsForTranslatedFiles = exports.mergePathsForTranslatedFiles = exports.fixTranslatedFilesStructureInOutputDir = exports.moveTranslatedFilesToOutputDir = void 0;
/**
 * This should only be run after the translations have been downloaded from Crowdin
 *
 * This script will move the translated files from the Crowdin structure to the output directory
 * Fix the structure of the translated files in the output directory
 * Merge the paths for the translated files
 * And fix the file extensions for the translated files
 */
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const config_mgr_1 = __importDefault(require("../../utils/config_mgr"));
const CONFIG = config_mgr_1.default.getConfig();
/**
 * Move the updated crowdin translations from translations folder to the output directory
 */
function moveTranslatedFilesToOutputDir() {
    return __awaiter(this, void 0, void 0, function* () {
        const translationsFolderPath = path_1.default.join(__dirname, "/../../" + CONFIG.translationsDirectory);
        function copyAllFoldersAndFiles(source, destination) {
            return __awaiter(this, void 0, void 0, function* () {
                const files = yield fs_1.default.promises.readdir(source);
                console.log({ source, destination });
                for (const file of files) {
                    const filePath = path_1.default.join(source, file);
                    const newFilePath = path_1.default.join(destination, file);
                    const stats = yield fs_1.default.promises.stat(filePath);
                    if (stats.isDirectory()) {
                        console.log({ newFilePath });
                        yield fs_1.default.promises.mkdir(newFilePath, { recursive: true });
                        yield copyAllFoldersAndFiles(filePath, newFilePath);
                    }
                    else {
                        yield fs_1.default.promises.copyFile(filePath, newFilePath);
                    }
                }
            });
        }
        // Find all folders that are named after the language code
        for (const language of CONFIG.languages) {
            const langFolderPath = path_1.default.join(translationsFolderPath, language);
            // Copy the language folder to the output directory
            const newLangFolderPath = path_1.default.join(__dirname, `../../${CONFIG.outputDirectory}`, language);
            yield copyAllFoldersAndFiles(langFolderPath, newLangFolderPath);
        }
    });
}
exports.moveTranslatedFilesToOutputDir = moveTranslatedFilesToOutputDir;
/**
 * Fix the structure of the translated files in the output directory
 */
function fixTranslatedFilesStructureInOutputDir() {
    return __awaiter(this, void 0, void 0, function* () {
        // Check the output dir for the localized files
        const folderPath = path_1.default.join(CONFIG.outputDirectory);
        for (const language of CONFIG.languages) {
            const langFolderPath = path_1.default.join(folderPath, language + `/${CONFIG.outputDirectory}`);
            // Move the folders and files from the language/<ouput folder> to the language folder
            const files = yield fs_1.default.promises.readdir(langFolderPath);
            for (const file of files) {
                const filePath = path_1.default.join(langFolderPath, file);
                const newFilePath = path_1.default.join(path_1.default.join(folderPath, language), file);
                yield fs_1.default.promises.rename(filePath, newFilePath);
            }
        }
    });
}
exports.fixTranslatedFilesStructureInOutputDir = fixTranslatedFilesStructureInOutputDir;
/**
 * Merge the paths for the translated files
 *
 * @description This is necessary because the Crowdin CLI creates a folder for each language
 * and places the translated files within that folder. This function will move the files from the language folder
 * to the same level as the original files.
 */
function mergePathsForTranslatedFiles() {
    return __awaiter(this, void 0, void 0, function* () {
        // Go to the folders for the languages within the output dir
        const folderPath = path_1.default.join(CONFIG.outputDirectory);
        // Go through each language folder
        for (const language of CONFIG.languages) {
            const languageFolderPath = path_1.default.join(folderPath, language);
            function recursivelyMoveSubFiles(folderPath) {
                return __awaiter(this, void 0, void 0, function* () {
                    const files = yield fs_1.default.promises.readdir(folderPath);
                    for (const file of files) {
                        const filePath = path_1.default.join(folderPath, file);
                        // Remove the prefix /language/outputDir from the file path
                        // Example move docs/ar/chapter/index.ar.qmd to docs/chapter/index.ar.qmd
                        const index = filePath.indexOf(`/${language}`);
                        let newFilePathArr = filePath.split("");
                        for (let i = 0; i < +language.length + 2; i++) {
                            newFilePathArr[i + index] = "/";
                        }
                        const newFilePath = path_1.default.resolve(newFilePathArr.join(""));
                        const stats = yield fs_1.default.promises.stat(filePath);
                        if (stats.isDirectory()) {
                            yield recursivelyMoveSubFiles(filePath);
                        }
                        else {
                            console.log(`Moving ${filePath} to ${newFilePath}`);
                            fs_1.default.renameSync(filePath, newFilePath);
                        }
                    }
                });
            }
            yield recursivelyMoveSubFiles(languageFolderPath);
        }
    });
}
exports.mergePathsForTranslatedFiles = mergePathsForTranslatedFiles;
/**
 * Fix the file extensions for the translated files
 *
 * @description The generated crowdin files have this file extension pattern: <filename>.<language>.<ext>
 * The problem here is that the <filename> can be <index.md> instead of 'index'.
 * This will make the generated file to be <index.md>.<language>.<ext>
 * This function will fix the file name to be <plain_file_name>.<language>.<ext> so it'll be <index.<language>.<ext>>
 */
function fixFileExtensionsForTranslatedFiles() {
    return __awaiter(this, void 0, void 0, function* () {
        // Go to the folders for the languages within the output dir
        const folderPath = path_1.default.join(CONFIG.outputDirectory);
        // Go through each language folder
        for (const language of CONFIG.languages) {
            const languageFolderPath = path_1.default.join(folderPath, language);
            function recursivelyChangeFileExtensions(folderPath) {
                return __awaiter(this, void 0, void 0, function* () {
                    const files = yield fs_1.default.promises.readdir(folderPath);
                    for (const file of files) {
                        const filePath = path_1.default.join(folderPath, file);
                        const stats = yield fs_1.default.promises.stat(filePath);
                        if (stats.isDirectory()) {
                            yield recursivelyChangeFileExtensions(filePath);
                        }
                        else {
                            const fileExtension = path_1.default.extname(filePath);
                            const newFilePath = filePath.replace(`${fileExtension}.${language}`, `.${language}`);
                            console.log(`Renaming ${filePath} to ${newFilePath}`);
                            yield fs_1.default.promises.rename(filePath, newFilePath);
                        }
                    }
                });
            }
            yield recursivelyChangeFileExtensions(languageFolderPath);
        }
    });
}
exports.fixFileExtensionsForTranslatedFiles = fixFileExtensionsForTranslatedFiles;
function deleteEmptyFoldersInOutDir() {
    return __awaiter(this, void 0, void 0, function* () {
        // Delete all the empty folders for each language in the output directory
        for (const language of CONFIG.languages) {
            const languageFolderPath = path_1.default.join(CONFIG.outputDirectory, language);
            fs_1.default.rmdirSync(languageFolderPath, { recursive: true });
        }
    });
}
exports.deleteEmptyFoldersInOutDir = deleteEmptyFoldersInOutDir;
function start() {
    return __awaiter(this, void 0, void 0, function* () {
        yield moveTranslatedFilesToOutputDir();
        yield fixTranslatedFilesStructureInOutputDir();
        yield fixFileExtensionsForTranslatedFiles();
        yield mergePathsForTranslatedFiles();
        yield deleteEmptyFoldersInOutDir();
    });
}
if (require.main === module) {
    start();
}
