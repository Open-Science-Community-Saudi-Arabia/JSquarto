import acorn from "acorn";

export interface ModuleBlockInfo {
    name: string;
    description: string;
    category?: {
        name: string;
        subCategory: string;
    };
    link?: string;
    references: ValueOf<Reference>[];
}

export interface CategoryInfo {
    name: string;
    comments: CommentInfo[];
}

export interface CommentInfo {
    text: string;
    start: acorn.Position;
}

export interface Params {
    name: string;
    description: string;
    type: string;
}

export type ReferenceTextToExternalModuleConstruct =
    `@see module:${string}/${string}~${string}`;
export type ReferenceTextToLocalModule = `@see ${string}`;
export type ReferenceTextToLocalModuleConstruct = `@see ${string}#${string}`;
export type ReferenceTextToExternalModule = `@see module:${string}`;
export type ReferenceText =
    | ReferenceTextToExternalModuleConstruct
    | ReferenceTextToLocalModuleConstruct
    | ReferenceTextToExternalModule;


export interface ReferenceTextType {
    localModule: ReferenceTextToLocalModule;
    externalModule: ReferenceTextToExternalModule;
    externalModuleConstruct: ReferenceTextToExternalModuleConstruct;
    localModuleConstruct: ReferenceTextToLocalModuleConstruct;
    externalModuleWithSubcategoryConstruct: ReferenceTextToExternalModuleConstruct;
    externalModuleWithSubcategory: ReferenceTextToExternalModule;
    link: string
}
export interface Reference {
    localModule: {
        text: ReferenceTextType["localModule"];
        type: "localModule"
        moduleName: string;
        categoryName: string;
        subCategoryName: string;
    };
    externalModule: {
        text: ReferenceTextType["externalModule"];
        type: "externalModule"
        moduleName: string;
        categoryName: string;
        subCategoryName: string;
    };
    externalModuleConstruct: {
        text: ReferenceTextType["externalModuleConstruct"];
        type: "externalModuleConstruct"
        moduleName: string;
        constructName: string;
        categoryName: string;
        subCategoryName: string;
    };
    localModuleConstruct: {
        text: ReferenceTextType["localModuleConstruct"];
        type: "localModuleConstruct"
        moduleName: string;
        constructName: string;
        categoryName: string;
        subCategoryName: string;
    };
    externalModuleWithSubcategoryConstruct: {
        text: ReferenceTextType["externalModuleConstruct"];
        type: "externalModuleWithSubcategoryConstruct"
        moduleName: string;
        constructName: string;
        categoryName: string;
        subCategoryName: string;
    };
    externalModuleWithSubcategory: {
        text: ReferenceTextType["externalModule"];
        type: "externalModuleWithSubcategory"
        moduleName: string;
        categoryName: string;
        subCategoryName: string;
    };
    link: {
        text: string;
        type: "link"
        url: string;
    }
}

export type ReferenceType = keyof Reference;

export type ValueOf<T> = T[keyof T];

export interface OtherBlockInfo {
    description: string;
    params: Params[];
    link: string;
    references: ValueOf<Reference>[];
    examples?: string[];
    returns: ReturnedValue[];
    thrownErrors: ThrownError[];
}

export interface ReturnedValue {
    type: string;
    description: string;
}

export interface ThrownError {
    type: string;
    description: string;
}

export interface Doc {
    blockInfo: OtherBlockInfo;
    constructInfo: {
        type: string | null;
        name: string | null;
    };
}

export type ConstructType =
    | "class"
    | "function"
    | "variable"
    | "other"
    | "module";
