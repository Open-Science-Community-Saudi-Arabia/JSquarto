/**
 * @module CommentsUtil
 *
 * @category Functional Doc

 * @subcategory Utilities
 *
 * @description  This file provides utility classes for parsing and extracting information
 * from comments within code files. It includes methods to identify and
 * extract metadata from both module and non-module comments,
 * facilitating better documentation and understanding of code constructs
 * such as functions, variables, classes, and modules.
 * */

import { ConstructType, ModuleBlockInfo, OtherBlockInfo } from "../interfaces";
import { Position } from "acorn";
import acorn from "acorn";
import Parser from "./parser";
import SourceFile from "./file";
import * as ts from "typescript";
import logger from "./logger";

export class CommentsUtil {
    // There are two types of comments: module and other
    // The module comments are used to describe the module and the other comments are used to describe the functions, variables, and classes

    // Get the module block info from the comments
    /**
     * Extracts module block information from comments.
     *
     * @param {string} comments - The comments to extract module block information from.
     * @returns {ModuleBlockInfo} The extracted module block information.
     * @description This method extracts module block information from comments, including module name, description, category, subcategory, link, and references.
     */
    static getModuleBlockInfo(comments: string): ModuleBlockInfo {
        const moduleName = Parser.getModuleName(comments);
        const description = Parser.getDescription(comments);
        const category = Parser.getCategory(comments);
        const subCategory = Parser.getSubCategory(comments);
        const link = Parser.getLink(comments);

        return {
            name: moduleName,
            description: description,
            category: {
                name: category,
                subCategory: subCategory,
            },
            link: link,
            references: Parser.getReferences(comments),
        };
    }

    // Get the other block info from the comments
    /**
     * Extracts other block information from comments.
     *
     * @param {string} comments - The comments to extract other block information from.
     * @returns {OtherBlockInfo} The extracted other block information.
     * @description This method extracts other block information from comments, including description, params, link, examples, returns, thrown errors, and references.
     */
    static getOtherBlockInfo(comments: string): OtherBlockInfo {
        const description = Parser.getDescription(comments);

        return {
            description: description,
            params: Parser.getParams(comments),
            link: Parser.getLink(comments),
            examples: Parser.getExamples(comments),
            returns: Parser.getReturnsValues(comments),
            thrownErrors: Parser.getThrownErrors(comments),
            references: Parser.getReferences(comments),
        };
    }

    // Get the comments from a file
    /**
     * Retrieves comments from a source file.
     *
     * @param {SourceFile} sourceFile - The source file to retrieve comments from.
     * @returns {Comment[]} An array of comments extracted from the source file.
     * @description This method retrieves comments from a source file using Acorn parser.
     */
    static getCommentsFromFile(sourceFile: SourceFile): Comment[] {
        const fileContent = sourceFile.fileContent;
        const comments: Comment[] = [];
        acorn.parse(fileContent, {
            sourceType: "module",
            ecmaVersion: 2020,
            locations: true,
            onComment: (isBlock, text, __, _, startLoc, endLoc) => {
                const textIsJSDocComment = isBlock && text.startsWith("*");
                if (textIsJSDocComment && startLoc && endLoc) {
                    const comment = new Comment(text, startLoc, endLoc);
                    comment.setConstructInfo(
                        sourceFile.getLinkedCodeConstructInfo(comment),
                    );
                    comments.push(comment);
                }
            },
        });

        return comments;
    }
}

export default class Comment {
    text: string;
    public readonly startLocation: Position;
    public readonly endLocation: Position;
    public readonly blockType: "module" | "other" = "other";
    public readonly constructInfo: {
        type: ConstructType;
        name: string;
    } = {
        type: "other",
        name: "unknown",
    };
    /**
     * Initializes a new instance of the Comment class.
     *
     * @param {string} text - The text content of the comment.
     * @param {Position} startLocation - The start location of the comment.
     * @param {Position} endLocation - The end location of the comment.
     * @description This class represents a comment extracted from a source file.
     */

    constructor(text: string, startLocation: Position, endLocation: Position) {
        this.text = this.cleanComments(text);
        this.startLocation = startLocation;
        this.endLocation = endLocation;
        this.blockType = /@module/.test(text) ? "module" : "other";
    }

    private cleanComments(comments: string): string {
        const cleanedComments = comments
            .replace(/\/\*\*/g, "")
            .replace(/\*\//g, "")
            .replace(/\*/g, "")
            .trim();
        return cleanedComments;
    }
    /**
     * Sets the construct information of the comment.
     *
     * @param {Object} info - The construct information to set.
     * @param {ConstructType | null} info.type - The type of construct (function, variable, class, etc.).
     * @param {string | null} info.name - The name of the construct.
     * @returns {void}
     * @description This method sets the construct information of the comment, including the type and name of the construct.
     */

    public setConstructInfo({
        type,
        name,
    }: {
        type: ConstructType | null;
        name: string | null;
    }) {
        this.constructInfo.type = type ?? "other";
        this.constructInfo.name = name ?? "unknown";
    }

    // Identify the type of the block (function, variable, class, module, other)
    /**
     * Retrieves module block information from the comment.
     *
     * @returns {ModuleBlockInfo} The extracted module block information.
     * @description This method retrieves module block information from the comment using the CommentsUtil class.
     */
    public getModuleInfo() {
        return CommentsUtil.getModuleBlockInfo(this.text);
    }
    /**
     * Retrieves other block information from the comment.
     *
     * @returns {OtherBlockInfo} The extracted other block information.
     * @description This method retrieves other block information from the comment using the CommentsUtil class.
     */
    public getOtherBlockInfo() {
        return CommentsUtil.getOtherBlockInfo(this.text);
    }
}
