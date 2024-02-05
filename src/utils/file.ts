import acorn from 'acorn';
import fs from 'fs'

export default class File {
    public fileContent: string;

    constructor(filePath: string) {
        this.fileContent = fs.readFileSync(filePath, 'utf8');
    }
}