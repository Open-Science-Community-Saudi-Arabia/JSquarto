export default class CliArgParser {
    static getArgs() {
        const args = process.argv.slice(2);
        const argMap = new Map<string, string>();

        for (let i = 0; i < args.length; i++) {
            const arg = args[i];
            const [key, value] = arg.split("=");

            argMap.set(key.startsWith("--") ? key.slice(2) : key, value);
        }
        return argMap;
    }
}
