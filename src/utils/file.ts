import fs from 'fs'
import { Comment } from './comment';

export default class File {
    public fileContent: string;

    constructor(filePath: string) {
        this.fileContent = fs.readFileSync(filePath, 'utf8');
    }

    public getLinkedCodeConstructInfo(comment: Comment) {
        const startLocation = comment.startLocation;
        const endLocation = comment.endLocation;

        if (startLocation && endLocation) {
            // Assuming start and end locations are instances of a class with 'line' and 'column' properties
            const startLine = startLocation.line;
            const startColumn = startLocation.column;
            const endLine = endLocation.line;
            const endColumn = endLocation.column;

            // Check if line and column values are numbers
            if (typeof startLine === 'number' && typeof endLine === 'number') {
                const lines = this.fileContent.split('\n');
                const lastLineIndex = endLine - 1;

                if (lastLineIndex < lines.length - 1) {
                    const lastLine = lines[lastLineIndex].trim();
                    const nextLines = lines.slice(lastLineIndex + 1, lastLineIndex + 6).map(line => line.trim());

                    const type = this.getConstructType(nextLines.join(''));
                    const name = this.getConstructName(nextLines.join(''));
                    return { type, name: name, nextLines };
                } else {
                    // Last line is the last line of the file, so there are no next lines
                    return { type: 'other', name: 'other' };
                }
            }
        }

        return {
            type: null,
            name: null,
        };
    }

    private getConstructName(text: string) {
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

    private getExportsConstructName(line: string): string | null {
        // Regex to match lines starting with exports and capturing the assigned name
        const exportsRegex = /^exports\.(\w+)\s*=\s*function\s*\(.*\)|exports.(\w+)\s*=\s*\([\s\S]*?\)\s*=>|exports.(\w+)\s*=\s*async\s*\([\s\S]*?\)\s*=>/;

        const match = line.match(exportsRegex);

        if (match) {
            // Find the first non-null captured group, which corresponds to the assigned name
            return match.slice(1).find((group) => group !== undefined && group !== null) || null;
        }

        return null;
    }

    private getFunctionConstructName(line: string): string | null {
        // Regex to match function declarations and capturing the function name
        const functionRegex = /(async\s+)?function\s+(\w+)|const\s+(\w+)\s*=\s*async\s*\(.*\)\s*=>|\(([\s\S]*?)\)\s*=>|(\w+)\s*=\s*function\s*\(([\s\S]*?)\)|(\w+)\s*=\s*\(([\s\S]*?)\)\s*=>|\w+\s*=\s*async\s*\(([\s\S]*?)\)\s*=>|\w+\s*=\s*function\s*[\s\S]*?\(([\s\S]*?)\)|\w+\s*=\s*\(([\s\S]*?)\)\s*=>/;

        const match = line.match(functionRegex);

        if (match) {
            // Find the first non-null captured group, which corresponds to the function name
            const functionName = match.slice(2).find((group) => group !== undefined && group !== null) || null;

            const exportRegex = /exports\.(\w+)\s*=\s*function\s*\(.*\)|exports.(\w+)\s*=\s*\([\s\S]*?\)\s*=>|exports.(\w+)\s*=\s*async\s*\([\s\S]*?\)\s*=>/;
            const exportMatch = line.match(exportRegex);
            if (exportMatch) {
                return exportMatch.slice(1).find((group) => group !== undefined && group !== null) || null;
            }

            // Check if the function is an arrow function
            const arrowFunctionRegex = /\(([\s\S]*?)\)\s*=>/;
            const arrowFunctionMatch = line.match(arrowFunctionRegex);
            if (arrowFunctionMatch) {
                return arrowFunctionMatch[1] || null;
            }

            return functionName || null;
        }

        return null;
    }

    private getVariableConstructName(line: string): string | null {
        // Regex to match variable declarations and capturing the variable name
        const variableRegex = /\b(const|let|var)\s+(\w+)/;

        const match = line.match(variableRegex);

        if (match) {
            // Return the captured variable name
            return match[2] || null;
        }

        return null;
    }

    private getClassConstructName(line: string): string | null {
        // Regex to match class declarations and capturing the class name
        const classRegex = /\bclass\s+(\w+)/;

        const match = line.match(classRegex);

        if (match) {
            // Return the captured class name
            return match[1] || null;
        }

        return null;
    }


    private getConstructType(text: string) {
        // Check if the remaining code contains a function declaration
        const functionRegex = /(\basync\s+)?\bfunction\b|^exports\.\w+\s*=\s*async\s*\(.*\)\s*=>|\bconst\b\s*\w+\s*=\s*async\s*\(.*\)\s*=>|\b\w+\s*=\s*function\s*\(|\b\w+\s*=\s*\([\s\S]*?\)\s*=>|\b\w+\s*=\s*async\s*\([\s\S]*?\)\s*=>|\b\w+\s*=\s*function\s*[\s\S]*?\)|\b\w+\s*=\s*\([\s\S]*?\)\s*=>/;
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
        const variableRegex = /\bconst\b|\blet\b|\bvar\b\s+\w+/;
        const variableMatch = variableRegex.test(text);

        if (variableMatch) {
            return 'variable';
        }

        // Check if the remaining code contains a class declaration
        const classRegex = /\bclass\s+\w+/;
        const classMatch = classRegex.test(text);

        if (classMatch) {
            return 'class';
        }

        return 'other';
    }
}