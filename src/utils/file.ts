import fs from 'fs';
import { Comment } from './comment';

/**
 * Class to identify the type of construct in a line of code
 * 
 * This is used to identify the type of code construct (function, variable, class, module) linked to a block of jSDOC comment
 */
class ConstructIdentifier {
    // Get the name of the module construct
    public getExportsConstructName(line: string): string | null {
        const exportsRegex = /^exports\.(\w+)\s*=\s*function\s*\(.*\)|exports.(\w+)\s*=\s*\([\s\S]*?\)\s*=>|exports.(\w+)\s*=\s*async\s*\([\s\S]*?\)\s*=>/;

        const match = line.match(exportsRegex);

        return match ? match.slice(1).find(group => group !== undefined && group !== null) || null : null;
    }

    // Get the name of the function construct
    public getFunctionConstructName(line: string): string | null {
        const functionRegex = /(async\s+)?function\s+(\w+)|const\s+(\w+)\s*=\s*async\s*\(.*\)\s*=>|\(([\s\S]*?)\)\s*=>|(\w+)\s*=\s*function\s*\(([\s\S]*?)\)|(\w+)\s*=\s*\(([\s\S]*?)\)\s*=>|\w+\s*=\s*async\s*\(([\s\S]*?)\)\s*=>|\w+\s*=\s*function\s*[\s\S]*?\((([\s\S]*?))\)|\w+\s*=\s*\(([\s\S]*?)\)\s*=>/;

        const match = line.match(functionRegex);

        if (match) {
            const functionName = match.slice(2).find(group => group !== undefined && group !== null) || null;

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
    public getVariableConstructName(line: string): string | null {
        const variableRegex = /\b(const|let|var)\s+(\w+)/;

        const match = line.match(variableRegex);

        return match ? match[2] || null : null;
    }

    // Get the name of the class construct
    public getClassConstructName(line: string): string | null {
        const classRegex = /\bclass\s+(\w+)/;

        const match = line.match(classRegex);

        return match ? match[1] || null : null;
    }
}

export default class SourceFile {
    public fileContent: string;
    private constructIdentifier: ConstructIdentifier;

    constructor(filePath: string) {
        this.fileContent = fs.readFileSync(filePath, 'utf8');
        this.constructIdentifier = new ConstructIdentifier();
    }

    // Get the type and name of the code construct linked to a comment
    public getLinkedCodeConstructInfo(comment: Comment) {
        const { startLocation, endLocation } = comment;

        if (startLocation && endLocation) {
            const { line: startLine, column: startColumn } = startLocation;
            const { line: endLine, column: endColumn } = endLocation;

            if (typeof startLine === 'number' && typeof endLine === 'number') {
                const lines = this.fileContent.split('\n');
                const lastLineIndex = endLine - 1;

                if (lastLineIndex < lines.length - 1) {
                    const nextLines = lines.slice(lastLineIndex + 1, lastLineIndex + 6).map(line => line.trim());
                    const type = this.getConstructType(nextLines.join(''));
                    const name = this.getConstructName(nextLines.join(''));

                    return { type, name };
                } else {
                    return { type: 'other', name: 'other' };
                }
            }
        }

        return { type: null, name: null };
    }

    // Get the name of the code construct linked to a comment
    private getConstructName(text: string) {
        const type = this.getConstructType(text);

        switch (type) {
            case 'function':
                return this.constructIdentifier.getFunctionConstructName(text);
            case 'variable':
                return this.constructIdentifier.getVariableConstructName(text);
            case 'class':
                return this.constructIdentifier.getClassConstructName(text);
            case 'module':
                return this.constructIdentifier.getExportsConstructName(text);
            default:
                return null;
        }
    }

    // Get the type of the code construct linked to a comment (function, variable, class, module, other)
    private getConstructType(text: string) {
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
}

export class TargetWriteFile {
    private filePath: string;

    constructor (filePath: string) {
        this.filePath = filePath;
    }   
}