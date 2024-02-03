class CommentParser {
    parseComment(comment: string): string {
        return comment.replace(/\/\*|\*\//g, '');
    }
}