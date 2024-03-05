import acorn from "acorn";

export interface ModuleBlockInfo {
    name: string;
    description: string;
    category?: {
        name: string;
        subCategory?: string;
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
    externalModuleAndConstruct: ReferenceTextToExternalModuleConstruct;
    localModuleAndConstruct: ReferenceTextToLocalModuleConstruct;
    externalModuleWithSubcategoryAndConstruct: ReferenceTextToExternalModuleConstruct;
    externalModuleWithSubcategory: ReferenceTextToExternalModule;
    link: string;
}
export interface Reference {
    localModule: {
        text: ReferenceTextType["localModule"];
        type: "localModule";
        moduleName: string;
        categoryName: string;
        subCategoryName: string;
    };
    externalModule: {
        text: ReferenceTextType["externalModule"];
        type: "externalModule";
        moduleName: string;
        categoryName: string;
        subCategoryName: string;
    };
    externalModuleAndConstruct: {
        text: ReferenceTextType["externalModuleAndConstruct"];
        type: "externalModuleAndConstruct";
        moduleName: string;
        constructName: string;
        categoryName: string;
        subCategoryName: string;
    };
    localModuleAndConstruct: {
        text: ReferenceTextType["localModuleAndConstruct"];
        type: "localModuleAndConstruct";
        moduleName: string;
        constructName: string;
        categoryName: string;
        subCategoryName: string;
    };
    externalModuleWithSubcategoryAndConstruct: {
        text: ReferenceTextType["externalModuleAndConstruct"];
        type: "externalModuleWithSubcategoryAndConstruct";
        moduleName: string;
        constructName: string;
        categoryName: string;
        subCategoryName: string;
    };
    externalModuleWithSubcategory: {
        text: ReferenceTextType["externalModule"];
        type: "externalModuleWithSubcategory";
        moduleName: string;
        categoryName: string;
        subCategoryName: string;
    };
    link: {
        text: string;
        type: "link";
        url: string;
    };
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
