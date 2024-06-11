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
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
class ConfigSetter {
    static parseCliArguments() {
        return;
    }
    static initializeConfigFile() {
        return __awaiter(this, void 0, void 0, function* () {
            const currentWorkingDirectory = process.cwd();
            const config = {
                outputDirectory: "output",
                sourceDirectory: "source",
                tutorialDirectory: "tutorial",
                translationsDirectory: "translations",
                includeLocalizedVersions: false,
                languages: ["en"],
            };
            const configPath = path_1.default.join(currentWorkingDirectory, "/jsquarto/config.json");
            fs_1.default.writeFileSync(configPath, JSON.stringify(config, null, 4));
        });
    }
    static setConfigValue() {
        return __awaiter(this, void 0, void 0, function* () {
            return;
        });
    }
}
exports.default = ConfigSetter;
