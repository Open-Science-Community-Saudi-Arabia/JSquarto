export class StringUtil {
    static convertToPascalCase(str: string): string {
        return str
            .split(/[^a-zA-Z0-9]/)
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join("");
    }

    static capitalizeFirstLetter(str: string): string {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
}