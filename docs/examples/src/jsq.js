"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const path_1 = __importDefault(require("path"));
const logger_1 = __importDefault(require("./utils/logger"));
const allowedCommands = [
    "doc:generate",
    "doc:preview",
    "doc:clean",
    "doc:serve",
    "fix:all",
    "fix:crowdin_files",
    "fix:localized_files",
    "fix:duplicate_languages_ref",
    "fix:wrong_languages_ref",
];
const commandsWithNoArgs = [
    "doc:preview",
    "doc:clean",
    "setup-quarto",
    "update-quarto",
];
// Determine the jsq tool directory
const projectDir = path_1.default.resolve(__dirname, "..");
const args = process.argv.slice(2);
const script = args[0];
const additionalArgs = args.slice(1).join(" ");
if (!allowedCommands.includes(script)) {
    logger_1.default.error(`Invalid command: ${script}`);
    process.exit(1);
}
const command = commandsWithNoArgs.includes(script)
    ? script
    : `${script} -- ${additionalArgs}  workingDirectory=${process.cwd()}`;
process.chdir(projectDir);
(0, child_process_1.execSync)(`npm run ${command}`, {
    stdio: "inherit",
});
