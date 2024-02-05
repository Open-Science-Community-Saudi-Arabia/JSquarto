import { ModuleInfo, OtherBlockInfo, Params } from "../interfaces";
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
}

export default class CommentsUtil {
    static getModuleBlockInfo(comments: string): ModuleInfo {
        const modules: ModuleInfo[] = [];
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
        };
    }

    static getCommentsFromFile(fileContent: string): Comment[] {
        const comments: Comment[] = [];
        acorn.parse(fileContent, {
            sourceType: 'module',
            ecmaVersion: 2020,
            locations: true,
            onComment: (isBlock, text, __, _, startLoc) => {
                const textIsJSDocComment = isBlock && text.startsWith('*');
                if (textIsJSDocComment) {
                    comments.push(new Comment(text))
                }
            },
        });

        return comments;
    }
}

export class Comment {
    text: string;

    constructor(text: string) {
        this.text = Cleaner.cleanComments(text);
    }

    public getModuleInfo() {
        return CommentsUtil.getModuleBlockInfo(this.text);
    }

    public getOtherBlockInfo() {
        return CommentsUtil.getOtherBlockInfo(this.text);
    }

    public getBlockType() {
        // Check if the comment is for a module or other(function, class, etc)
        const moduleRegex = /@module\s+(.*)/g;
        const moduleMatch = moduleRegex.exec(this.text);
        return moduleMatch ? 'module' : 'other';
    }
} 