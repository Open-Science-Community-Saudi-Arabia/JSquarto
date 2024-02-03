import { ModuleInfo, CategoryInfo } from "../interfaces";
import acorn, { Position } from 'acorn';

export default class CommentExtractor {
    static extractCommentsFromFile(fileContent: string): ModuleInfo[] {
        const modules: ModuleInfo[] = [];
        let currentModule: ModuleInfo | undefined;

        const parsed = acorn.parse(fileContent, {
            sourceType: 'module',
            ecmaVersion: 2020,
            locations: true,
            onComment: (isBlock, text, __, _, startLoc) => {
                const textIsJSDocComment = isBlock && text.startsWith('*');
                if (textIsJSDocComment) {
                    // Extract @module and @category information
                    const moduleMatch = text.match(/@module\s+(.*)/);
                    const categoryMatch = text.match(/@category\s+(.*)/);

                    if (moduleMatch) {
                        const moduleName = moduleMatch[1];
                        currentModule = modules.find((m) => m.name === moduleName);

                        if (!currentModule) {
                            currentModule = {
                                name: moduleName,
                                description: '',
                                categories: [],
                            };
                            modules.push(currentModule);
                        }

                        // Update module description if available
                        currentModule.description = text.trim();
                    } else if (categoryMatch && currentModule) {
                        const categoryName = categoryMatch[1];
                        const currentCategory = currentModule.categories.find((c) => c.name === categoryName);

                        if (currentModule && !currentCategory) {
                            const newCategory: CategoryInfo = {
                                name: categoryName,
                                comments: [],
                            };
                            currentModule.categories.push(newCategory);
                        }

                        // Add the comment to the appropriate module/category
                        const updatedCategory = currentModule.categories[currentModule.categories.length - 1];
                        updatedCategory?.comments.push({ text, start: startLoc as Position });
                    }
                }
            },
        });

        return modules; // Assuming a single module per file for simplicity
    }
}