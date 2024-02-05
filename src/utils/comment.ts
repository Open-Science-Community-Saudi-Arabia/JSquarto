import { ModuleBlockInfo, OtherBlockInfo, Params, ReturnedValue } from "../interfaces";
import { Position } from 'acorn';
import acorn from 'acorn';

export class Cleaner {
    static cleanComments(comments: string): string {
        const cleanedComments = comments.replace(/\/\*\*/g, '').replace(/\*\//g, '').replace(/\*/g, '').trim();
        return cleanedComments;
    }
}

export class Parser {
    static getDescription(comment: string): string {
        //  Search through the comments block to find @description then return the description
        //  The description should match all the text after @description until the next @ that is a jsdoc tag
        const descriptionRegex = /@description\s+([\s\S]*?)(?=@\w|$)/g;
        const descriptionMatch = descriptionRegex.exec(comment);
        return descriptionMatch ? descriptionMatch[1] : '';
    }

    static getCategory(comment: string): string {
        // Search through the comments block to find @category then return the category
        const categoryRegex = /@category\s+(.*)/g;
        const categoryMatches = categoryRegex.exec(comment);
        return categoryMatches ? categoryMatches[1] : '';
    }

    static getSubCategory(comment: string): string {
        const subCategoryRegex = /@subcategory\s+(.*)/g;
        const subCategoryMatches = subCategoryRegex.exec(comment);
        return subCategoryMatches ? subCategoryMatches[1] : '';
    }

    static getLink(comment: string): string {
        const linkRegex = /@see\s+(.*)/g;
        const linkMatches = linkRegex.exec(comment);
        return linkMatches ? linkMatches[1] : '';
    }

    static getParams(comment: string): Params[] {
        const paramsRegex = /@param\s+{?([\w.]+)?}?\s*([\w.]+)\s*-\s*(.*)/g;
        const paramsMatches = comment.match(paramsRegex);

        if (!paramsMatches) {
            return [];
        }

        const params: Params[] = [];
        for (const match of paramsMatches) {
            const [, type, name, description] = paramsRegex.exec(match) || [];

            if (!type || !name || !description) {
                continue;
            }

            params.push({
                name,
                type,
                description,
            })
        };

        return params;
    }

    static getModuleName(comment: string): string {
        const moduleRegex = /@module\s+(.*)/g;
        const moduleMatch = moduleRegex.exec(comment);
        return moduleMatch ? moduleMatch[1] : '';
    }

    static getReturnsValues(comment: string): ReturnedValue[] {
        // ReturnedValue values may be multiple
        const returnsRegex = /@returns\s+{?([\w.]+)?}?\s*-\s*(.*)/g;

        const returnsMatches = comment.match(returnsRegex);
        if (!returnsMatches) {
            return [];
        }

        const returns: ReturnedValue[] = [];
        for (const match of returnsMatches) {
            const [, type, description] = returnsRegex.exec(match) || [];

            if (!type || !description) {
                continue;
            }

            returns.push({
                type,
                description,
            })
        };

        return returns;
    }

    static getThrownErrors(comment: string): ReturnedValue[] {
        // ThrownError values may be multiple
        const throwsRegex = /@throws\s+{?([\w.]+)?}?\s*-\s*(.*)/g;

        const throwsMatches = comment.match(throwsRegex);
        if (!throwsMatches) {
            return [];
        }

        const thrownErrors: ReturnedValue[] = [];
        for (const match of throwsMatches) {
            const [, type, description] = throwsRegex.exec(match) || [];

            if (!type || !description) {
                continue;
            }

            thrownErrors.push({
                type,
                description,
            })
        };

        return thrownErrors;
    }

}

export default class CommentsUtil {
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

export class Comment {
    text: string;
    public readonly startLocation: Position;
    public readonly endLocation: Position;
    public readonly blockInfo: {
        type: 'function' | 'variable' | 'class' | 'module' | 'other';
    }

    constructor(text: string, startLocation: Position, endLocation: Position) {
        this.text = Cleaner.cleanComments(text);
        this.startLocation = startLocation;
        this.endLocation = endLocation;
        this.blockInfo = {
            type: this.identifyBlockType()
        }
    }

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