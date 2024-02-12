/**
 * This file provides utility classes for parsing and extracting information
 * from comments within code files. It includes methods to identify and
 * extract metadata from both module and non-module comments,
 * facilitating better documentation and understanding of code constructs
 * such as functions, variables, classes, and modules.
 */

import { ConstructType, ModuleBlockInfo, OtherBlockInfo } from "../interfaces";
import { Position } from "acorn";
import acorn from "acorn";
import Parser from "./parser";
import { ConstructIdentifier } from "./codeconstruct";
import SourceFile from "./file";

export class CommentsUtil {
    // There are two types of comments: module and other
    // The module comments are used to describe the module and the other comments are used to describe the functions, variables, and classes

    // Get the module block info from the comments
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
        };
    }

    // Get the other block info from the comments
    static getOtherBlockInfo(comments: string): OtherBlockInfo {
        const description = Parser.getDescription(comments);

        return {
            description: description,
            params: Parser.getParams(comments),
            link: Parser.getLink(comments),
            returns: Parser.getReturnsValues(comments),
            thrownErrors: Parser.getThrownErrors(comments),
        };
    }

    // Get the comments from a file
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
    public getModuleInfo() {
        return CommentsUtil.getModuleBlockInfo(this.text);
    }

    public getOtherBlockInfo() {
        return CommentsUtil.getOtherBlockInfo(this.text);
    }
}
