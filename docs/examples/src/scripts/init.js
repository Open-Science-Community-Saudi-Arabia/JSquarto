"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Create jsquarto config file in cwd
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
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
