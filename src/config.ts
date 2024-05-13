import config from "../config.json";

const CONFIG = {
    outputDirectory: config.outputDirectory,
    sourceDirectory: config.sourceDirectory,
    tutorialDirectory: config.tutorialDirectory,
    languages: config.languages,
    includeLocalizedVersions: config.includeLocalizedVersions,
};

export default CONFIG;

