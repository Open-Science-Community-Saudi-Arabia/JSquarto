"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Category = exports.SubCategory = exports.Module = exports.recursivelyConvertAllStringValuesInObjectToLowerCase = exports.ModuleDoc = void 0;
const uuid_1 = require("uuid");
class ModuleDoc {
    constructor({ originalFilePath, data, }) {
        this.originalFilePath = originalFilePath;
        this.data = data.blockInfo;
        this.constructInfo = data.constructInfo;
    }
}
exports.ModuleDoc = ModuleDoc;
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
function recursivelyConvertAllStringValuesInObjectToLowerCase(obj) {
    const newObj = Object.assign({}, obj);
    for (const key in newObj) {
        if (typeof newObj[key] === "object") {
            newObj[key] = recursivelyConvertAllStringValuesInObjectToLowerCase(newObj[key]);
        }
        else if (typeof newObj[key] === "string") {
            newObj[key] = newObj[key].toLowerCase();
        }
    }
    return newObj;
}
exports.recursivelyConvertAllStringValuesInObjectToLowerCase = recursivelyConvertAllStringValuesInObjectToLowerCase;
class Module {
    constructor(info) {
        this.documents = [];
        this.id = (0, uuid_1.v4)();
        this.info = {};
        this.destinationFilePath = "";
        this.sourceFilePath = ""; // Useful for tutorials
        // Convert the module name to lowercase
        this.info = recursivelyConvertAllStringValuesInObjectToLowerCase(info);
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
    addDoc(document) {
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
    getDocs() {
        return this.documents;
    }
    /**
     *@decription sets the destination for where the qmd corresponding qmd file will be placed
     * @param destinationFilePath
     * @returns void
     * */
    setDestinationFilePath(destinationFilePath) {
        this.destinationFilePath = destinationFilePath;
    }
    /**
     * @description  sets the source file path
     * @param sourceFilePath
     * @returns void
     * */
    setSourceFilePath(sourceFilePath) {
        this.sourceFilePath = sourceFilePath;
    }
}
exports.Module = Module;
class SubCategory {
    constructor({ name, category }) {
        this.modules = [];
        this.name = name.toLowerCase();
        this.category = category;
    }
    /**
     * @description  Add a module to the subcategory
     *
     * @param module
     * @returns void
     * */
    addModule(module) {
        this.modules.push(module);
    }
    /**
     * @description  Get the modules in the subcategory
     *
     * @returns Module[]
     * */
    getModules() {
        return this.modules;
    }
    /**
     * @description  Get the name of the subcategory
     * @returns string
     * */
    getCategory() {
        return this.category;
    }
}
exports.SubCategory = SubCategory;
/**
 * Represents a category.
 */
class Category {
    /**
     * Initializes a new instance of the Category class.
     *
     * @param {string} name - The name of the category.
     * @description This class represents a category.
     */
    constructor(name) {
        this.subCategories = [];
        this.directModules = [];
        this.name = name.toLowerCase();
    }
    /**
     * Adds a subcategory to the category.
     *
     * @param {SubCategory} subCategory - The subcategory to add.
     * @returns {void}
     * @description Adds a subcategory to the category.
     */
    addSubCategory(subCategory) {
        this.subCategories.push(subCategory);
    }
    /**
     * Retrieves the subcategories in the category.
     *
     * @returns {SubCategory[]} An array of subcategories.
     * @description Retrieves the subcategories in the category.
     */
    getSubCategories() {
        return this.subCategories;
    }
    /**
     * Retrieves the name of the category.
     *
     * @returns {string} The name of the category.
     * @description Retrieves the name of the category.
     */
    getName() {
        return this.name;
    }
    /**
     * Adds a module to the category.
     *
     * @param {Module} module - The module to add.
     * @returns {void}
     * @description Adds a module to the category.
     */
    addModule(module) {
        this.directModules.push(module);
    }
    /**
     * Retrieves the modules in the category.
     *
     * @returns {Module[]} An array of modules.
     * @description Retrieves the modules in the category.
     */
    getModules() {
        return this.directModules;
    }
}
exports.Category = Category;
