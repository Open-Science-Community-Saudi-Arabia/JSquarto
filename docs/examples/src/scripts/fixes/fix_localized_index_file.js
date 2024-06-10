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
exports.fixLocalizedIndexFiles = void 0;
const writer_1 = __importDefault(require("../../utils/writer"));
const config_mgr_1 = __importDefault(require("../../utils/config_mgr"));
const CONFIG = config_mgr_1.default.getConfig();
function fixLocalizedIndexFiles() {
    return __awaiter(this, void 0, void 0, function* () {
        const langs = CONFIG.languages;
        yield writer_1.default.fixMissingLocalizedIndexFiles(langs);
    });
}
exports.fixLocalizedIndexFiles = fixLocalizedIndexFiles;
if (require.main === module) {
    fixLocalizedIndexFiles();
}
