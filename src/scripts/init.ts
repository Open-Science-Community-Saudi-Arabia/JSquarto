// Create jsquarto config file in cwd
import path from "path";
import fs from "fs";

const currentWorkingDirectory = process.cwd();

const config = {
    outputDirectory: "output",
    sourceDirectory: "source",
    tutorialDirectory: "tutorial",
    translationsDirectory: "translations",
    includeLocalizedVersions: false,
    languages: ["en"],
};

const configPath = path.join(currentWorkingDirectory, "/.jsquarto/config.json");

fs.writeFileSync(configPath, JSON.stringify(config, null, 4));
