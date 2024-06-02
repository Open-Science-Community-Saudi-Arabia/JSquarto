// Entry point for CLI tool
import { execSync } from "child_process";
import logger from "./utils/logger";

const args = process.argv.slice(2);
const script = args[0];
console.log({ args: process.argv });

switch (script) {
    case "doc:generate":
        execSync("npm run doc:generate", { stdio: "inherit" });
        break;
    case "doc:preview":
        execSync("npm run doc:preview", { stdio: "inherit" });
        break;
    case "fix:all":
        execSync("npm run fix:all", { stdio: "inherit" });
        break;
    // Add more cases as needed for other scripts
    default:
        logger.error(`Unknown script: ${script}`);
        break;
}
