/**
 * @module Parser
 * @subcategory Utilities
 *
 * @description
 * This file is responsible for parsing comments in code files.
 * It extracts various pieces of information such as
 * description, category, subcategory, link, parameters, return values,
 * and thrown errors from comments using regular expressions.
 */

import {
    Params,
    Reference,
    ReferenceText,
    ReferenceTextType,
    ReferenceType,
    ReturnedValue,
} from "../interfaces";

export default class Parser {
    // Get the description from the comments block - Basically the text after @description
    /**
     * @param comment
     * @returns string
     *
     * @description  This method will extract the description from the comments block
     * @example
     * Parser.getDescription(comment) => 'This method will extract the description from the comments block'
     * */
    static getDescription(comment: string): string {
        //  Search through the comments block to find @description then return the description
        //  The description should match all the text after @description until the next @ that is a jsdoc tag
        const descriptionRegex = /@description\s+([\s\S]*?)(?=@\w|$)/g;
        const descriptionMatch = descriptionRegex.exec(comment);
        return descriptionMatch ? descriptionMatch[1] : "";
    }

    // Get the category from the comments block - Basically the text after @category
    /**
     * @param comment
     *
     * @returns string
     *
     * @description  This method will extract the category from the comments block
     * @example
     * Parser.getCategory(comment) => 'StringUtil'
     * */
    static getCategory(comment: string): string {
        // Search through the comments block to find @category then return the category
        const categoryRegex = /@category\s+(.*)/g;
        const categoryMatches = categoryRegex.exec(comment);
        return categoryMatches ? categoryMatches[1] : "";
    }

    // Get the subcategory from the comments block - Basically the text after @subcategory
    /**
     * @param comment
     *
     * @returns string
     * @description  This method will extract the subcategory from the comments block
     * @example
     * Parser.getSubCategory(comment) => 'StringUtil'
     * */
    static getSubCategory(comment: string): string {
        const subCategoryRegex = /@subcategory\s+(.*)/g;
        const subCategoryMatches = subCategoryRegex.exec(comment);
        return subCategoryMatches ? subCategoryMatches[1] : "";
    }

    // Get the link from the comments block - Basically the text after @see
    /**
     * @param comment
     *
     * @returns string
     * @description  This method will extract the link from the comments block
     * @example
     * Parser.getLink(comment) => 'StringUtil'
     * */
    static getLink(comment: string): string {
        const linkRegex = /@see\s+(.*)/g;
        const linkMatches = linkRegex.exec(comment);
        return linkMatches ? linkMatches[1] : "";
    }

    // Get all params from the comments block
    /**
     * @param comment
     *
     * @returns Params[]
     * @description  This method will extract all the params from the comments block
     * @example
     * Parser.getParams(comment) => [{name: 'str', type: 'string', description: 'The string to convert to camel case'}]
     * */
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
            });
        }

        return params;
    }

    // Get the module name from the comments block - Basically the text after @module
    /**
     * @param comment
     *
     * @returns string
     * @description  This method will extract the module name from the comments block
     * @example
     * Parser.getModuleName(comment) => 'StringUtil'
     * */
    static getModuleName(comment: string): string {
        const moduleRegex = /@module\s+(.*)/g;
        const moduleMatch = moduleRegex.exec(comment);
        return moduleMatch ? moduleMatch[1] : "";
    }

    // Get the returns from the comments block - Basically the text after @returns
    /**
     * @param comment
     *
     * @returns ReturnedValue[]
     * @description  This method will extract the returns from the comments block
     * @example
     * Parser.getReturnsValues(comment) => [{type: 'string', description: 'The string to convert to camel case'}]
     * */
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
            });
        }

        return returns;
    }

    // Get the examples from the comments block - Basically the text after @example
    /**
     * @param comment
     *
     * @returns string[]
     * @description  This method will extract the examples from the comments block
     * @example
     * Parser.getExamples(comment) => ['StringUtil.convertToCamelCase(\'hello world\') => \'helloWorld\'']
     * */
    static getExamples(comment: string): string[] {
        const exampleRegex = /@example\s+([\s\S]*?)(?=@\w|$)/g;

        const exampleMatches = [];
        let match;
        while ((match = exampleRegex.exec(comment)) !== null) {
            if (match[1]) {
                exampleMatches.push(match[1].trim());
            }
        }
        return exampleMatches;
    }

    // Get the thrown errors from the comments block - Basically the text after @throws
    /**
     * @param comment
     *
     * @returns ReturnedValue[]
     * @description  This method will extract the thrown errors from the comments block
     * @example
     * Parser.getThrownErrors(comment) => [{type: 'Error', description: 'The string to convert to camel case'}]
     * */
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
            });
        }

        return thrownErrors;
    }

    // Get the references from the comments block - Basically the text after @see
    /**
     * @param comment
     *
     * @returns Reference[]
     * @description  This method will extract the references from the comments block
     * @example
     * Parser.getReferences(comment) => [{text: 'StringUtil', type: 'localModule'}]
     * */
    static getReferences(comment: string): Reference[ReferenceType][] {
        const referencesRegex =
            /@see\s+((?:{@link\s+)?((?:[^{}]|{(?!\/?@link))+(?:})?))/g;
        const referencesMatches: Reference[ReferenceType][] = [];
        let match;

        const localModuleRegex = /{?([\w.]+)}?/; // @see {@link module:subcategory}
        const externalModuleRegex = /{?module:([\w.]+)}?/; // @see {@link module:subcategory/module_name}
        const externalModuleConstructRegex = /module:([\w.]+)~([\w.]+)/; // @see {@link module:module_name~construct_name}
        const externaModuleWithSubcategoryRegex =
            /{?module:([\w.]+)\/([\w.]+)}?/; // @see {@link module:sub_category/module_name   }
        const externalModuleWithSubcategoryConstructRegex =
            /{?module:([\w.]+)\/([\w.]+)~([\w.]+)}?/; // @see {@link module:sub_category/module_name~construct_name}
        const httpLinkRegex = /https?:\/\/\S+/; // @see https://example.com
        const localModuleConstructRegex = /{?([\w.]+)\/([\w.]+)#([\w.]+)}?/; // @see {@link subcategory/module_name#construct_name}

        while ((match = referencesRegex.exec(comment)) !== null) {
            if (match[2]) {
                let referenceText = match[2].trim();

                // Remove everything after the last space in the reference text. This may be cases where JSDoc tags are refering to the variable to apply the custom type
                const lastSpaceIndex = referenceText.lastIndexOf(" ");
                if (lastSpaceIndex !== -1) {
                    referenceText = referenceText.substring(0, lastSpaceIndex);
                }

                const httpLinkMatch = httpLinkRegex.exec(referenceText);
                if (httpLinkMatch) {
                    referencesMatches.push({
                        text: httpLinkMatch[0] as ReferenceTextType["link"],
                        url: httpLinkMatch[0],
                        type: "link",
                    });
                    continue;
                }

                const externalModuleWithSubcategoryConstructMatch =
                    externalModuleWithSubcategoryConstructRegex.exec(
                        referenceText,
                    );
                if (externalModuleWithSubcategoryConstructMatch) {
                    referencesMatches.push({
                        text: externalModuleWithSubcategoryConstructMatch[0] as ReferenceTextType["externalModuleAndConstruct"],
                        subCategoryName:
                            externalModuleWithSubcategoryConstructMatch[1],
                        moduleName:
                            externalModuleWithSubcategoryConstructMatch[2],
                        constructName:
                            externalModuleWithSubcategoryConstructMatch[3],
                        type: "externalModuleWithSubcategoryAndConstruct",
                        categoryName:
                            externalModuleWithSubcategoryConstructMatch[2],
                    });
                    continue;
                }

                const externaModuleWithSubcategoryMatch =
                    externaModuleWithSubcategoryRegex.exec(referenceText);
                if (externaModuleWithSubcategoryMatch) {
                    referencesMatches.push({
                        text: externaModuleWithSubcategoryMatch[0] as ReferenceTextType["externalModule"],
                        subCategoryName: externaModuleWithSubcategoryMatch[1],
                        moduleName: externaModuleWithSubcategoryMatch[2],
                        type: "externalModuleWithSubcategory",
                        categoryName: externaModuleWithSubcategoryMatch[2],
                    });
                    continue;
                }

                const externamModuleContructMatch =
                    externalModuleConstructRegex.exec(referenceText);
                if (externamModuleContructMatch) {
                    referencesMatches.push({
                        text: externamModuleContructMatch[0] as ReferenceTextType["externalModuleAndConstruct"],
                        moduleName: externamModuleContructMatch[1],
                        constructName: externamModuleContructMatch[2],
                        type: "externalModuleAndConstruct",
                        categoryName: externamModuleContructMatch[1],
                        subCategoryName: externamModuleContructMatch[2],
                    });
                    continue;
                }

                const localModuleConstructMatch =
                    localModuleConstructRegex.exec(referenceText);
                if (localModuleConstructMatch) {
                    referencesMatches.push({
                        text: localModuleConstructMatch[0] as ReferenceTextType["localModuleAndConstruct"],
                        moduleName: localModuleConstructMatch[1],
                        constructName: localModuleConstructMatch[2],
                        type: "localModuleAndConstruct",
                        categoryName: localModuleConstructMatch[2],
                        subCategoryName: localModuleConstructMatch[3],
                    });
                }

                const externalModuleMatch =
                    externalModuleRegex.exec(referenceText);
                if (externalModuleMatch) {
                    referencesMatches.push({
                        text: externalModuleMatch[0] as ReferenceTextType["externalModule"],
                        moduleName: externalModuleMatch[1],
                        type: "externalModule",
                        categoryName: externalModuleMatch[1],
                        subCategoryName: externalModuleMatch[2],
                    });
                    continue;
                }

                const localModuleMatch = localModuleRegex.exec(referenceText);
                if (localModuleMatch) {
                    referencesMatches.push({
                        text: localModuleMatch[0] as ReferenceTextType["localModule"],
                        moduleName: localModuleMatch[1],
                        type: "localModule",
                        categoryName: localModuleMatch[1],
                        subCategoryName: localModuleMatch[2],
                    });
                    continue;
                }
            }
        }

        return referencesMatches;
    }
}
