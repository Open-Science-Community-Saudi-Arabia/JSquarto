"use strict";
/**
 * @module File
 * @category Functional Doc

 * @subcategory Utilities
 * @description  This module is used to read and write files
 *
 *
 * This file reads and analyzes source code files.
 * It identifies the type and name of the code construct linked
 * to a given comment by examining the lines following the comment,
 * utilizing the ConstructIdentifier class.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const codeconstruct_1 = require("./codeconstruct");
class SourceFile {
    constructor(filePath) {
        this.fileContent = fs_1.default.readFileSync(filePath, "utf8");
    }
    // Get the type and name of the code construct linked to a comment
    /**
     * @param comment
     * @returns {type: ConstructType | null, name: string | null}
     * @description  This method returns the type and name of the code construct linked to a comment
     *
     * @example
     * const file = new SourceFile('file.ts');
     *
     * const comment = new Comment({
     *    startLocation: { line: 1, column: 1 },
     *    endLocation: { line: 1, column: 1 },
     *    content: 'This is a comment'
     *    });
     *    file.getLinkedCodeConstructInfo(comment);
     *    // => { type: 'class', name: 'StringUtil' }
     *    */
    getLinkedCodeConstructInfo(comment) {
        const { startLocation, endLocation } = comment;
        if (startLocation && endLocation) {
            const { line: startLine, column: startColumn } = startLocation;
            const { line: endLine, column: endColumn } = endLocation;
            if (typeof startLine === "number" && typeof endLine === "number") {
                const lines = this.fileContent.split("\n");
                const lastLineIndex = endLine - 1;
                if (lastLineIndex < lines.length - 1) {
                    const nextLines = lines
                        .slice(lastLineIndex + 1, lastLineIndex + 6)
                        .map((line) => line.trim());
                    const type = codeconstruct_1.ConstructIdentifier.getConstructType(nextLines.join(""));
                    const name = codeconstruct_1.ConstructIdentifier.getConstructName(nextLines.join(""));
                    return { type, name };
                }
                else {
                    return { type: "other", name: "other" };
                }
            }
        }
        return { type: null, name: null };
    }
}
exports.default = SourceFile;
