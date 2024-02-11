// Generates the quarto yml file
import { uuid } from "uuidv4";
import { ModuleBlockInfo, OtherBlockInfo } from "../interfaces";

export class ModuleDoc {
    data: OtherBlockInfo;
    originalFilePath: string;

    constructor({
        originalFilePath,
        data,
    }: {
        originalFilePath: string;
        data: OtherBlockInfo;
    }) {
        this.originalFilePath = originalFilePath;
        this.data = data;
    }
}


export class Module {
    private documents: ModuleDoc[] = [];
    private id: string = uuid()
    readonly info: ModuleBlockInfo = {} as ModuleBlockInfo;

    constructor(info: ModuleBlockInfo) {
        this.info = info;
    }

    public addDoc(document: ModuleDoc) {
        this.documents.push(document);
    }

    public getDocs() {
        return this.documents;
    }
}

export class SubCategory {
    private modules: Module[] = [];
    name: string;
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

export class Category {
    subCategories: SubCategory[] = [];
    name: string;
    private directModules: Module[] = [];

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

    public addModule(module: Module) {
        this.directModules.push(module);
    }
}

