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
            if (typeof startLine === 'number' && typeof startColumn === 'number' &&
                typeof endLine === 'number' && typeof endColumn === 'number') {

                // Extract the code block from file content using start and end locations
                const codeBlock = this.fileContent.substring(
                    // Assuming 1-based indexing for lines and columns
                    // Adjust as needed if your indexing is different
                    this.fileContent.indexOf(this.fileContent.split('\n')[startLine - 1].charAt(startColumn - 1)),
                    this.fileContent.lastIndexOf(this.fileContent.split('\n')[endLine - 1].charAt(endColumn - 1)) + 1
                );

                // Extract information based on the identified block type
                const blockType = comment.blockInfo.type;
                const constructName = this.extractConstructName(comment, codeBlock);

                return { type: blockType, name: constructName };
            }
        }

        return {
            type: null,
            name: null
        };
    }

    private extractConstructName(comment: Comment, codeBlock: string): string {
        // Implement logic to extract the name based on the block type
        switch (comment.blockInfo.type) {
            case 'function':
                return this.getFunctionName(codeBlock);
            case 'variable':
                return this.getVariableName(codeBlock);
            case 'class':
                return this.getClassName(codeBlock);
            case 'module':
                return comment.getModuleInfo().name;
            default:
                return '';
        }
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