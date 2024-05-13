import config from "../config.json";

const CONFIG = {
    outputDirectory: config.outputDirectory,
    sourceDirectory: config.sourceDirectory,
    tutorialDirectory: config.tutorialDirectory,
    translationsDirectory: config.translationsDirectory,
    includeLocalizedVersions: config.includeLocalizedVersions,
    languages: config.languages,
};

export default CONFIG;
