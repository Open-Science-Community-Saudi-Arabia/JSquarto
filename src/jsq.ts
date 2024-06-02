import { execSync } from "child_process";
import path from "path";

// Determine the jsq tool directory
const projectDir = path.resolve(__dirname, "..");
const args = process.argv.slice(2);
const additionalArgs = args.slice(1).join(" ") + " workingDir=" + process.cwd();
const script = args[0];

process.chdir(projectDir);
execSync(`npm run ${script} -- ${additionalArgs}`, { stdio: "inherit" });
