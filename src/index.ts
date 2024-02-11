import fs from 'fs';
import Comment, { CommentsUtil } from './utils/comment';
import SourceFile from './utils/file';
import Writer from './utils/writer';
import { Category, Module, ModuleDoc, SubCategory } from './utils/docStructureGenerator';
import logger from "./utils/logger";

function getJSFilesFromDirectory(directory: string): string[] {
    const files: string[] = [];
    const items = fs.readdirSync(directory);
    for (const item of items) {
        const itemPath = `${directory}/${item}`;
        if (fs.statSync(itemPath).isDirectory()) {
            files.push(...getJSFilesFromDirectory(itemPath));
        } else if (itemPath.endsWith('.js')) {
            files.push(itemPath);
        }
    }
    return files;
}

function createOrUpdateModule(name: string, description: string | undefined, category: string | undefined, modules: Map<string, Module>, categories: Map<string, Category>): Module {
    let newModule = modules.get(name);
    if (!newModule) {
        newModule = new Module({ name, description, category });
        modules.set(name, newModule);
        logger.info(`Module '${name}' created.`);
    } else {
        logger.info(`Module '${name}' already exists.`);
    }
    if (category) {
        let cat = categories.get(category);
        if (!cat) {
            cat = new Category(category);
            categories.set(category, cat);
            logger.info(`Category '${category}' created.`);
        }
    }
    return newModule;
}

function addSubCategory(category: Category, subCategoryName: string) {
    const subCategory = category.subCategories.find(subCat => subCat.name === subCategoryName);
    if (!subCategory) {
        const newSubCategory = new SubCategory({ name: subCategoryName, category });
        category.subCategories.push(newSubCategory);
        logger.info(`Sub-category '${subCategoryName}' added to category '${category.name}'.`);
    }
}

function processComments(comments: Comment[], modules: Map<string, Module>, categories: Map<string, Category>, defaultCategory: Category, defaultSubCategory: SubCategory, defaultFileModule: Module, filePath: string) {
    let fileModule: Module | undefined = undefined;
    const moduleDocs: ModuleDoc[] = [];

    for (const comment of comments) {
        if (comment.blockInfo.type !== 'module') {
            moduleDocs.push(new ModuleDoc({ originalFilePath: filePath, data: comment.getOtherBlockInfo() }));
            continue;
        }

        const _module = comment.getModuleInfo();
        fileModule = createOrUpdateModule(_module.name, _module.description, _module.category?.name, modules, categories);

        if (!_module.category) continue;

        addSubCategory(categories.get(_module.category.name) || defaultCategory, _module.category.subCategory);
    }

    if (fileModule) {
        moduleDocs.forEach(doc => fileModule.addDoc(doc));
        const category = fileModule.info.category?.name || defaultCategory.name;
        const subCategory = fileModule.info.category?.subCategory || defaultSubCategory.name;
        const categoryToAddTo = categories.get(category);
        const subCategoryToAddTo = categoryToAddTo?.subCategories.find(subCat => subCat.name === subCategory);

        if (subCategoryToAddTo) {
            if (!subCategoryToAddTo.getModules().some(module => module.info.name === fileModule.info.name)) {
                subCategoryToAddTo.addModule(fileModule);
            }
        } else if (categoryToAddTo) {
            if (!categoryToAddTo.getModules().some(module => module.info.name === fileModule.info.name)) {
                categoryToAddTo.addModule(fileModule);
            }
        } else {
            if (!defaultCategory.getModules().some(module => module.info.name === fileModule.info.name)) {
                defaultSubCategory.addModule(fileModule);
            }
        }

        modules.set(fileModule.info.name, fileModule);
    } else {
        moduleDocs.forEach(doc => defaultFileModule.addDoc(doc));
    }
}

function start() {
    const filePaths = getJSFilesFromDirectory(__dirname + '/../test_files');
    const modules: Map<string, Module> = new Map();
    const categories: Map<string, Category> = new Map();

    const defaultFileModule = new Module({
        name: 'default',
        description: 'Default module',
        link: 'default'
    });

    const defaultCategory = new Category('default');
    const defaultSubCategory = new SubCategory({ name: 'default', category: defaultCategory });
    defaultCategory.subCategories.push(defaultSubCategory);
    categories.set(defaultCategory.name, defaultCategory);

    for (const filePath of filePaths) {
        const sourceFile = new SourceFile(filePath);
        const comments = CommentsUtil.getCommentsFromFile(sourceFile.fileContent);
        processComments(comments, modules, categories, defaultCategory, defaultSubCategory, defaultFileModule, filePath);
    }

    if (defaultFileModule.getDocs().length > 0) {
        modules.set(defaultFileModule.info.name, defaultFileModule);
        defaultCategory.addModule(defaultFileModule);
    }

    new Writer()
        .prepareDirectoryForDocs(Array.from(categories.values()))
        .writeDocsFromCategoriesToFile(Array.from(categories.values()));
}

start();
