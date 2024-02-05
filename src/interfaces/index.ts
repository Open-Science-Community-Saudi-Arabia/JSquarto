import acorn from 'acorn'

export interface ModuleInfo {
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
}