import { ModuleBlockInfo, OtherBlockInfo } from "../interfaces";
import { Position } from 'acorn';
import acorn from 'acorn';
import Parser from "./parser";

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
            link: link
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
    static getCommentsFromFile(fileContent: string): Comment[] {
        const comments: Comment[] = [];
        acorn.parse(fileContent, {
            sourceType: 'module',
            ecmaVersion: 2020,
            locations: true,
            onComment: (isBlock, text, __, _, startLoc, endLoc) => {
                const textIsJSDocComment = isBlock && text.startsWith('*');
                if (textIsJSDocComment && startLoc && endLoc) {
                    comments.push(new Comment(text, startLoc, endLoc))
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
    public readonly blockInfo: {
        type: 'function' | 'variable' | 'class' | 'module' | 'other';
    }

    constructor(text: string, startLocation: Position, endLocation: Position) {
        this.text = this.cleanComments(text);
        this.startLocation = startLocation;
        this.endLocation = endLocation;
        this.blockInfo = {
            type: this.identifyBlockType()
        }
    }

    private cleanComments(comments: string): string {
        const cleanedComments = comments.replace(/\/\*\*/g, '').replace(/\*\//g, '').replace(/\*/g, '').trim();
        return cleanedComments;
    }

    // Identify the type of the block (function, variable, class, module, other)
    private identifyBlockType() {
        const code = this.text

        const remainingCode = code.substring(0 + code.length);

        // Check if the remaining code contains a function declaration
        const functionRegex = /(async\s+)?function\s+\w+|const\s+\w+\s*=\s*async\s*\(.*\)\s*=>|\([\s\S]*?\)\s*=>|\b\w+\s*=\s*function\s*\(|\b\w+\s*=\s*\([\s\S]*?\)\s*=>|\b\w+\s*=\s*async\s*\([\s\S]*?\)\s*=>|\b\w+\s*=\s*function\s*[\s\S]*?\)|\b\w+\s*=\s*\([\s\S]*?\)\s*=>/;
        const functionMatch = functionRegex.test(remainingCode);
        if (functionMatch) {
            return 'function';
        }

        const moduleRegex = /@module\s+(.*)/g;
        const moduleMatch = moduleRegex.exec(this.text);
        if (moduleMatch) {
            return 'module';
        }

        // Check if the remaining code contains a variable declaration
        const variableRegex = /\bconst\b|\blet\b|\bvar\b\s+\w+/;
        const variableMatch = variableRegex.test(remainingCode);

        if (variableMatch) {
            return 'variable';
        }

        // Check if the remaining code contains a class declaration
        const classRegex = /\bclass\s+\w+/;
        const classMatch = classRegex.test(remainingCode);

        if (classMatch) {
            return 'class';
        }

        return 'other'
    }

    public getModuleInfo() {
        return CommentsUtil.getModuleBlockInfo(this.text);
    }

    public getOtherBlockInfo() {
        return CommentsUtil.getOtherBlockInfo(this.text);
    }
} 