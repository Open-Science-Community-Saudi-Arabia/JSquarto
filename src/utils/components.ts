// Generates the quarto yml file
import { v4 as uuid } from "uuid";
import { ModuleBlockInfo, OtherBlockInfo } from "../interfaces";

export class ModuleDoc {
    data: OtherBlockInfo;
    constructInfo: {
        type: string;
        name: string;
    };
    originalFilePath: string;

    constructor({
        originalFilePath,
        data,
    }: {
        originalFilePath: string;
        data: {
            blockInfo: OtherBlockInfo;
            constructInfo: {
                type: string;
                name: string;
            };
        };
    }) {
        this.originalFilePath = originalFilePath;
        this.data = data.blockInfo;
        this.constructInfo = data.constructInfo;
    }
}

export function recursivelyConvertAllStringValuesInObjectToLowerCase(
    obj: Record<string, any>,
) {
    const newObj = { ...obj };
    for (const key in newObj) {
        if (typeof newObj[key] === "object") {
            newObj[key] = recursivelyConvertAllStringValuesInObjectToLowerCase(
                newObj[key],
            );
        } else if (typeof newObj[key] === "string") {
            newObj[key] = newObj[key].toLowerCase();
        }
    }

    return newObj;
}

export class Module {
    private documents: ModuleDoc[] = [];
    private id: string = uuid();
    readonly info: ModuleBlockInfo = {} as ModuleBlockInfo;
    destinationFilePath: string = "";

    constructor(info: ModuleBlockInfo) {
        // Convert the module name to lowercase
        this.info = recursivelyConvertAllStringValuesInObjectToLowerCase(info) as typeof info
    }

    public addDoc(document: ModuleDoc) {
        this.documents.push(document);
    }

    public getDocs() {
        return this.documents;
    }

    public setDestinationFilePath(destinationFilePath: string) {
        this.destinationFilePath = destinationFilePath;
    }
}

export class SubCategory {
    private modules: Module[] = [];
    name: string;
    private category?: Category;

    constructor({ name, category }: { name: string; category?: Category }) {
        this.name = name.toLowerCase();
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
        this.name = name.toLowerCase();
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

    public getModules() {
        return this.directModules;
    }
}
