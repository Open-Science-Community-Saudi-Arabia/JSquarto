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
const config_mgr_1 = __importDefault(require("../../utils/config_mgr"));
const fix_duplicate_language_refs_1 = require("./fix_duplicate_language_refs");
const fix_localized_index_file_1 = require("./fix_localized_index_file");
const fix_rtl_1 = require("./fix_rtl");
const fix_wrong_language_refs_1 = require("./fix_wrong_language_refs");
function start() {
    return __awaiter(this, void 0, void 0, function* () {
        config_mgr_1.default.updateConfigStore();
        yield (0, fix_localized_index_file_1.fixLocalizedIndexFiles)();
        yield (0, fix_duplicate_language_refs_1.fixDuplicateLanguageReferences)();
        yield (0, fix_wrong_language_refs_1.fixWrongLanguageReferences)();
        yield (0, fix_rtl_1.fixAndStyleArabicHtmlFiles)();
    });
}
start();
