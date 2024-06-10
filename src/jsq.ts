import { execSync } from "child_process";
import path from "path";
import logger from "./utils/logger";

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
    "config:init",
    "config:set",
    "config:get",
];
const commandsWithNoArgs = ["setup-quarto", "update-quarto"];

// Determine the jsq tool directory
const projectDir = path.resolve(__dirname, "..");
const args = process.argv.slice(2);
const script = args[0];
const additionalArgs = args.slice(1).join(" ");

if (!allowedCommands.includes(script)) {
    logger.error(`Invalid command: ${script}`);
    process.exit(1);
}

const command = commandsWithNoArgs.includes(script)
    ? script
    : `${script} -- ${additionalArgs}  workingDirectory=${process.cwd()}`;

process.chdir(projectDir);
execSync(`npm run ${command}`, {
    stdio: "inherit",
});
