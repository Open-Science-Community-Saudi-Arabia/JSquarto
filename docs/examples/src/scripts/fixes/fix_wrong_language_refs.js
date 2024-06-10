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
Object.defineProperty(exports, "__esModule", { value: true });
exports.fixWrongLanguageReferences = void 0;
const Cheerio = __importStar(require("cheerio"));
const fs_1 = __importDefault(require("fs"));
const logger_1 = __importDefault(require("../../utils/logger"));
const path_1 = __importDefault(require("path"));
const config_mgr_1 = __importDefault(require("../../utils/config_mgr"));
const CONFIG = config_mgr_1.default.getConfig();
function fixWrongLanguageReferences() {
    return __awaiter(this, void 0, void 0, function* () {
        const languages = CONFIG.languages;
        // Get the index files for each language
        for (const lang of languages.slice(1)) {
            const directoryForHtmlFiles = path_1.default.join(CONFIG.outputDirectory, `/_book/${lang}/`);
            logger_1.default.info("Reading index file for language: " + lang);
            const indexFile = yield fs_1.default.promises.readFile(directoryForHtmlFiles + `index.${lang}.html`, "utf-8");
            logger_1.default.info("Finished reading index file for language: " + lang);
            // Get the html elements (anchor elements) with classname 'dropdown-item' from each index file
            const $ = Cheerio.load(indexFile);
            // Get the html element referencing the main language
            const mainLang = $(`#language-link-${languages[0]}`);
            // Correct the href attribute of the main language element
            mainLang.attr("href", `../index.html`);
            // Get the html elements referencing the other languages
            const otherLangs = languages.slice(1).map((code) => ({
                code: code,
                htmlRef: $(`#language-link-${code}`),
            }));
            // Correct the href attribute of the other language elements
            logger_1.default.info("Correcting href attribute of other language elements");
            otherLangs.forEach((language) => language.htmlRef.attr("href", `../${language.code}/index.${language.code}.html`));
            logger_1.default.info("Finished correcting href attribute of other language elements");
            yield fs_1.default.promises.writeFile(directoryForHtmlFiles + `index.${lang}.html`, $.html());
            logger_1.default.info("Updated index file for language: " + lang);
        }
    });
}
exports.fixWrongLanguageReferences = fixWrongLanguageReferences;
if (require.main === module) {
    fixWrongLanguageReferences();
}
