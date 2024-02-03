import acorn from 'acorn'

export interface ModuleInfo {
    name: string;
    description: string;
    categories: CategoryInfo[];
}

export interface CategoryInfo {
    name: string;
    comments: CommentInfo[];
}

export interface CommentInfo {
    text: string;
    start: acorn.Position;
}
