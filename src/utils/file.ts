/**
 * @module File
 * @subcategory Utilities
 * @description  This module is used to read and write files
 *
 * This file reads and analyzes source code files.
 * It identifies the type and name of the code construct linked
 * to a given comment by examining the lines following the comment,
 * utilizing the ConstructIdentifier class.
 */

import fs from "fs";
import Comment from "./comment";
import { ConstructIdentifier } from "./codeconstruct";
import { ConstructType } from "../interfaces";

export default class SourceFile {
    public fileContent: string;

    constructor(filePath: string) {
        this.fileContent = fs.readFileSync(filePath, "utf8");
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
    public getLinkedCodeConstructInfo(comment: Comment): {
        type: ConstructType | null;
        name: string | null;
    } {
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
                    const type = ConstructIdentifier.getConstructType(
                        nextLines.join(""),
                    );
                    const name = ConstructIdentifier.getConstructName(
                        nextLines.join(""),
                    );

                    return { type, name };
                } else {
                    return { type: "other", name: "other" };
                }
            }
        }

        return { type: null, name: null };
    }
}
