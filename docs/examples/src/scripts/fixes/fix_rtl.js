"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.fixAndStyleArabicHtmlFiles = void 0;
const Cheerio = __importStar(require("cheerio"));
const fs_1 = __importDefault(require("fs"));
const logger_1 = __importDefault(require("../../utils/logger"));
const path_1 = __importDefault(require("path"));
const config_mgr_1 = __importDefault(require("../../utils/config_mgr"));
const CONFIG = config_mgr_1.default.getConfig();
function processHtmlFilesInDirectory(directory, cssContent) {
    return __awaiter(this, void 0, void 0, function* () {
        const files = yield fs_1.default.promises.readdir(directory, { withFileTypes: true });
        for (const file of files) {
            const filePath = path_1.default.join(directory, file.name);
            if (file.isDirectory()) {
                // Recursively process subdirectories
                yield processHtmlFilesInDirectory(filePath, cssContent);
            }
            else if (file.isFile() && file.name.endsWith(".html")) {
                yield processHtmlFile(filePath, cssContent);
            }
        }
    });
}
function processHtmlFile(filePath, cssContent) {
    return __awaiter(this, void 0, void 0, function* () {
        logger_1.default.info(`Reading file: ${filePath}`);
        const htmlContent = yield fs_1.default.promises.readFile(filePath, "utf-8");
        logger_1.default.info(`Finished reading file: ${filePath}`);
        const $ = Cheerio.load(htmlContent);
        // Add the CSS content into a <style> tag in the head of the HTML file
        $("head").append(`<style>${cssContent}</style>`);
        yield fs_1.default.promises.writeFile(filePath, $.html());
        logger_1.default.info(`Finished processing file: ${filePath}`);
    });
}
function fixAndStyleArabicHtmlFiles() {
    return __awaiter(this, void 0, void 0, function* () {
        if (!CONFIG.languages.includes("ar")) {
            console.log({
                config: CONFIG,
            });
            logger_1.default.info("Arabic language not found in the list of languages");
            return;
        }
        const directoryForHtmlFiles = path_1.default.join(CONFIG.outputDirectory, `_book/ar/`);
        const cssFilePath = path_1.default.join(__dirname, "/rtl.css");
        // Read the CSS file
        const cssContent = yield fs_1.default.promises.readFile(cssFilePath, "utf-8");
        // Start processing from the root directory
        yield processHtmlFilesInDirectory(directoryForHtmlFiles, cssContent);
    });
}
exports.fixAndStyleArabicHtmlFiles = fixAndStyleArabicHtmlFiles;
if (require.main === module) {
    const langs = (_b = (_a = process.argv
        .find((arg) => arg.startsWith("languages"))) === null || _a === void 0 ? void 0 : _a.split("=")[1]) === null || _b === void 0 ? void 0 : _b.split(",");
    if (!langs) {
        console.warn("Languages not specified in cli arguments, setting languages to default");
    }
    CONFIG.languages = langs !== null && langs !== void 0 ? langs : CONFIG.languages;
    fixAndStyleArabicHtmlFiles();
}
