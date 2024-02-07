/**
 * The class called ConstructIdentifier, contains methods to identify different types of code constructs 
 * (such as functions, variables, classes, and modules) within a line of code. 
 * These methods help in extracting and determining the names associated with each construct type.
 */

export class ConstructIdentifier {
    // Get the name of the module construct
    private static getExportsConstructName(line: string): string | null {
        const exportsRegex = /^exports\.(\w+)\s*=\s*function\s*\(.*\)|exports.(\w+)\s*=\s*\([\s\S]*?\)\s*=>|exports.(\w+)\s*=\s*async\s*\([\s\S]*?\)\s*=>/;

        const match = line.match(exportsRegex);

        return match ? match.slice(1).find(group => group !== undefined && group !== null) || null : null;
    }

    // Get the name of the function construct
    private static getFunctionConstructName(line: string): string | null {
        const functionRegex = /(async\s+)?function\s+(\w+)|const\s+(\w+)\s*=\s*async\s*\(.*\)\s*=>|\(([\s\S]*?)\)\s*=>|(\w+)\s*=\s*function\s*\(([\s\S]*?)\)|(\w+)\s*=\s*\(([\s\S]*?)\)\s*=>|\w+\s*=\s*async\s*\(([\s\S]*?)\)\s*=>|\w+\s*=\s*function\s*[\s\S]*?\((([\s\S]*?))\)|\w+\s*=\s*\(([\s\S]*?)\)\s*=>/;

        const match = line.match(functionRegex);

        if (match) {
            const functionName = match.slice(2).find(group => group !== undefined && group !== null) || null;

            // Functions may be defined as exports, so we need to check for that
            const exportRegex = /exports\.(\w+)\s*=\s*function\s*\(.*\)|exports.(\w+)\s*=\s*\([\s\S]*?\)\s*=>|exports.(\w+)\s*=\s*async\s*\([\s\S]*?\)\s*=>/;
            const exportMatch = line.match(exportRegex);
            if (exportMatch) {
                return exportMatch.slice(1).find(group => group !== undefined && group !== null) || null;
            }

            const arrowFunctionRegex = /\(([\s\S]*?)\)\s*=>/;
            const arrowFunctionMatch = line.match(arrowFunctionRegex);
            return arrowFunctionMatch ? arrowFunctionMatch[1] || null : functionName || null;
        }

        return null;
    }

    // Get the name of the variable construct
    private static getVariableConstructName(line: string): string | null {
        const variableRegex = /\b(const|let|var)\s+(\w+)/;

        const match = line.match(variableRegex);

        return match ? match[2] || null : null;
    }

    // Get the name of the class construct
    private static getClassConstructName(line: string): string | null {
        const classRegex = /\bclass\s+(\w+)/;

        const match = line.match(classRegex);

        return match ? match[1] || null : null;
    }

    static getConstructType(text: string) {
        // Check if the remaining code contains a function declaration
        const functionRegex = /(\basync\s+)?\bfunction\b|^exports\.\w+\s*=\s*async\s*\(.*\)\s*=>|\bconst\b\s*\w+\s*=\s*async\s*\(.*\)\s*=>|\b\w+\s*=\s*function\s*\(|\b\w+\s*=\s*\([\s\S]*?\)\s*=>|\b\w+\s*=\s*async\s*\([\s\S]*?\)\s*=>|\b\w+\s*=\s*function\s*[\s\S]*?\(|\b\w+\s*=\s*\([\s\S]*?\)\s*=>/;
        const functionMatch = functionRegex.test(text);
        if (functionMatch) {
            return 'function';
        }

        const moduleRegex = /@module\s+(.*)/g;
        const moduleMatch = moduleRegex.exec(text);
        if (moduleMatch) {
            return 'module';
        }

        // Check if the remaining code contains a variable declaration
        const variableRegex = /\b(const\b|\blet\b|\bvar\b)\s+(\w+)/;
        const variableMatch = variableRegex.test(text);

        if (variableMatch) {
            return 'variable';
        }

        // Check if the remaining code contains a class declaration
        const classRegex = /\bclass\s+(\w+)/;
        const classMatch = classRegex.test(text);

        if (classMatch) {
            return 'class';
        }

        return 'other';
    }

    static getConstructName(text: string) {
        const type = this.getConstructType(text);

        switch (type) {
            case 'function':
                return this.getFunctionConstructName(text);
            case 'variable':
                return this.getVariableConstructName(text);
            case 'class':
                return this.getClassConstructName(text);
            case 'module':
                return this.getExportsConstructName(text);
            default:
                return null;
        }
    }

}