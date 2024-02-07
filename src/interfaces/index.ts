import acorn from 'acorn'

export interface ModuleBlockInfo {
    name: string;
    description: string;
    category: {
        name: string;
        subCategory: string;
    };
    link: string;
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

export interface OtherBlockInfo {
    description: string;
    params: Params[];
    link: string;
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
    blockInfo: ModuleBlockInfo,
    constructInfo: {
        type: string | null,
        name: string | null
    }
}