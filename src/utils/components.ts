/**
 * This file contains the classes that are used to generate the quarto yml file
 * @module components
 * @subcategory Utilities
 *@category Functional Doc

 * @description  This module is used to generate the quarto yml file
 * @example
 *
 * import { Module, ModuleDoc, SubCategory, Category } from './components';
 * const category = new Category('Utilities');
 * const subCategory = new SubCategory({ name: 'String', category });
 * const module = new Module({ name: 'StringUtil' });
 * const moduleDoc = new ModuleDoc({
 *    originalFilePath: 'string.ts',
 *    data: {
 *    blockInfo: {
 *    name: 'StringUtil',
 *    description: 'This class contains methods for manipulating strings',
 *    },
 *    constructInfo: {
 *    type: 'class',
 *    name: 'StringUtil',
 *    },
 *    },
 *    });
 *    module.addDoc(moduleDoc);
 *    subCategory.addModule(module);
 *    category.addSubCategory(subCategory);
 *    const modules = category.getModules();
 * */
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

/**
 * @description  Recursively convert all string values in an object to lowercase
 * @param obj
 * @returns Record<string, any>
 * @example
 * const obj = {
 *   name: 'Hello World',
 *   description: 'This is a description',
 *   blockInfo: {
 *   name: 'Hello World',
 *   description: 'This is a description',
 *   },
 *   };
 *   recursivelyConvertAllStringValuesInObjectToLowerCase(obj);
 *   // => {
 *   //   name: 'hello world',
 *   //   description: 'this is a description',
 *   //   blockInfo: {
 *   //   name: 'hello world',
 *   //   description: 'this is a description',
 *   //   },
 *   //   }
 *   */
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
        this.info = recursivelyConvertAllStringValuesInObjectToLowerCase(
            info,
        ) as typeof info;
    }

    /**
     * @description  Add a document to the module
     * @param document
     * @returns void
     * @example
     * const module = new Module({ name: 'StringUtil' });
     * const moduleDoc = new ModuleDoc({
     *   originalFilePath: 'string.ts',
     *   data: {
     *
     *      blockInfo: {
     *      name: 'StringUtil',
     *      description: 'This class contains methods for manipulating strings',
     *      },
     *      constructInfo: {
     *      type: 'class',
     *      name: 'StringUtil',
     *      },
     *      },
     *      });
     *      module.addDoc(moduleDoc);
     *      */
    public addDoc(document: ModuleDoc) {
        this.documents.push(document);
    }

    /**
     * @description  Get the documents in the module
     * @returns ModuleDoc[]
     * @example
     * const module = new Module({ name: 'StringUtil' });
     * const moduleDoc = new ModuleDoc({
     *  originalFilePath: 'string.ts',
     *  data: {
     *  blockInfo: {
     *  name: 'StringUtil',
     *  description: 'This class contains methods for manipulating strings',
     *  },
     *  constructInfo: {
     *  type: 'class',
     *  name: 'StringUtil',
     *  },
     *  },
     *  });
     *  module.addDoc(moduleDoc);
     *  module.getDocs();
     *  // => [ModuleDoc]
     *  */
    public getDocs() {
        return this.documents;
    }

    /**
     *@decription sets the destination for where the qmd corresponding qmd file will be placed
     * @param destinationFilePath
     * @returns void
     * */
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

    /**
     * @description  Add a module to the subcategory
     *
     * @param module
     * @returns void
     * */
    public addModule(module: Module) {
        this.modules.push(module);
    }

    /**
     * @description  Get the modules in the subcategory
     *
     * @returns Module[]
     * */
    public getModules() {
        return this.modules;
    }

    /**
     * @description  Get the name of the subcategory
     * @returns string
     * */
    public getCategory() {
        return this.category;
    }
}

/**
 * Represents a category.
 */
export class Category {
    subCategories: SubCategory[] = [];
    name: string;
    private directModules: Module[] = [];

    /**
     * Initializes a new instance of the Category class.
     *
     * @param {string} name - The name of the category.
     * @description This class represents a category.
     */
    constructor(name: string) {
        this.name = name.toLowerCase();
    }

    /**
     * Adds a subcategory to the category.
     *
     * @param {SubCategory} subCategory - The subcategory to add.
     * @returns {void}
     * @description Adds a subcategory to the category.
     */
    public addSubCategory(subCategory: SubCategory) {
        this.subCategories.push(subCategory);
    }

    /**
     * Retrieves the subcategories in the category.
     *
     * @returns {SubCategory[]} An array of subcategories.
     * @description Retrieves the subcategories in the category.
     */
    public getSubCategories() {
        return this.subCategories;
    }

    /**
     * Retrieves the name of the category.
     *
     * @returns {string} The name of the category.
     * @description Retrieves the name of the category.
     */
    public getName() {
        return this.name;
    }

    /**
     * Adds a module to the category.
     *
     * @param {Module} module - The module to add.
     * @returns {void}
     * @description Adds a module to the category.
     */
    public addModule(module: Module) {
        this.directModules.push(module);
    }

    /**
     * Retrieves the modules in the category.
     *
     * @returns {Module[]} An array of modules.
     * @description Retrieves the modules in the category.
     */
    public getModules() {
        return this.directModules;
    }
}
