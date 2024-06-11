"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentsUtil = void 0;
const acorn_1 = __importDefault(require("acorn"));
const parser_1 = __importDefault(require("./parser"));
class CommentsUtil {
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
    static getModuleBlockInfo(comments) {
        const moduleName = parser_1.default.getModuleName(comments);
        const description = parser_1.default.getDescription(comments);
        const category = parser_1.default.getCategory(comments);
        const subCategory = parser_1.default.getSubCategory(comments);
        const link = parser_1.default.getLink(comments);
        return {
            name: moduleName,
            description: description,
            category: {
                name: category,
                subCategory: subCategory,
            },
            link: link,
            references: parser_1.default.getReferences(comments),
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
    static getOtherBlockInfo(comments) {
        const description = parser_1.default.getDescription(comments);
        return {
            description: description,
            params: parser_1.default.getParams(comments),
            link: parser_1.default.getLink(comments),
            examples: parser_1.default.getExamples(comments),
            returns: parser_1.default.getReturnsValues(comments),
            thrownErrors: parser_1.default.getThrownErrors(comments),
            references: parser_1.default.getReferences(comments),
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
    static getCommentsFromFile(sourceFile) {
        const fileContent = sourceFile.fileContent;
        const comments = [];
        acorn_1.default.parse(fileContent, {
            sourceType: "module",
            ecmaVersion: 2020,
            locations: true,
            onComment: (isBlock, text, __, _, startLoc, endLoc) => {
                const textIsJSDocComment = isBlock && text.startsWith("*");
                if (textIsJSDocComment && startLoc && endLoc) {
                    const comment = new Comment(text, startLoc, endLoc);
                    comment.setConstructInfo(sourceFile.getLinkedCodeConstructInfo(comment));
                    comments.push(comment);
                }
            },
        });
        return comments;
    }
}
exports.CommentsUtil = CommentsUtil;
class Comment {
    /**
     * Initializes a new instance of the Comment class.
     *
     * @param {string} text - The text content of the comment.
     * @param {Position} startLocation - The start location of the comment.
     * @param {Position} endLocation - The end location of the comment.
     * @description This class represents a comment extracted from a source file.
     */
    constructor(text, startLocation, endLocation) {
        this.blockType = "other";
        this.constructInfo = {
            type: "other",
            name: "unknown",
        };
        this.text = this.cleanComments(text);
        this.startLocation = startLocation;
        this.endLocation = endLocation;
        this.blockType = /@module/.test(text) ? "module" : "other";
    }
    cleanComments(comments) {
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
    setConstructInfo({ type, name, }) {
        this.constructInfo.type = type !== null && type !== void 0 ? type : "other";
        this.constructInfo.name = name !== null && name !== void 0 ? name : "unknown";
    }
    // Identify the type of the block (function, variable, class, module, other)
    /**
     * Retrieves module block information from the comment.
     *
     * @returns {ModuleBlockInfo} The extracted module block information.
     * @description This method retrieves module block information from the comment using the CommentsUtil class.
     */
    getModuleInfo() {
        return CommentsUtil.getModuleBlockInfo(this.text);
    }
    /**
     * Retrieves other block information from the comment.
     *
     * @returns {OtherBlockInfo} The extracted other block information.
     * @description This method retrieves other block information from the comment using the CommentsUtil class.
     */
    getOtherBlockInfo() {
        return CommentsUtil.getOtherBlockInfo(this.text);
    }
}
exports.default = Comment;
