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

                    const blockType = comment.blockInfo.type;
                    const constructName = this.getConstructType(nextLines.join(''));

                    return { type: blockType, name: constructName, nextLines: nextLines };
                } else {
                    // Last line is the last line of the file, so there are no next lines
                    const lastLine = lines[lastLineIndex].trim();
                    const blockType = comment.blockInfo.type;

                    return { type: blockType, name: 'other', nextLines: [] };
                }
            }
        }

        return {
            type: null,
            name: null,
        };
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

    private getFunctionName(codeBlock: string): string {
        // Implement logic to extract function name from the code block
        const functionRegex = /(async\s+)?function\s+(\w+)/;
        const match = codeBlock.match(functionRegex);
        return match ? match[2] : '';
    }

    private getVariableName(codeBlock: string): string {
        // Implement logic to extract variable name from the code block
        const variableRegex = /\b(?:const|let|var)\s+(\w+)/;
        const match = codeBlock.match(variableRegex);
        return match ? match[1] : '';
    }

    private getClassName(codeBlock: string): string {
        // Implement logic to extract class name from the code block
        const classRegex = /\bclass\s+(\w+)/;
        const match = codeBlock.match(classRegex);
        return match ? match[1] : '';
    }
}