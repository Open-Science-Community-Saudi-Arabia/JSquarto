// Generates the quarto yml file

import { ModuleBlockInfo } from "../interfaces";

class Document {
    module: Module;
    originalFilePath: string;
    comments: Comment[] = [];

    constructor({
        originalFilePath,
        module,
    }: {
        originalFilePath: string;
        module: Module;
    }) {
        this.originalFilePath = originalFilePath;
        this.module = module;
    }
}


class Module {
    private documents: Document[] = [];
    private info: ModuleBlockInfo = {} as ModuleBlockInfo;

    constructor(info: ModuleBlockInfo) {
        this.info = info;
    }

    public addDocument(document: Document) {
        this.documents.push(document);
    }

    public getDocuments() {
        return this.documents;
    }
}

class SubCategory {
    private modules: Module[] = [];
    private name: string;
    private category?: Category;

    constructor({
        name,
        category,
    }: {
        name: string;
        category?: Category;
    }) {
        this.name = name;
        this.category = category;
    }

    public addModule(module: Module) {
        this.modules.push(module);
    }

    public getModules() {
        return this.modules;
    }

    public getCategory() {
        return this.category;
    }
}

class Category {
    subCategories: SubCategory[] = [];
    name: string;

    constructor(name: string) {
        this.name = name;
    }

    public addSubCategory(subCategory: SubCategory) {
        this.subCategories.push(subCategory);
    }

    public getSubCategories() {
        return this.subCategories;
    }

    public getName() {
        return this.name;
    }
}

