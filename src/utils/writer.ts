import { ModuleInfo } from "../interfaces";
import fs from 'fs';

export default class Writer {
    static writeCommentsToFile({ comments, filePath, moduleInfo }: {
        comments: string;
        filePath: string;
        moduleInfo: ModuleInfo
    }) {
        // File is a qmd file
        // Add title set it to the module name
        let fileContent = `
        --- 
        title: ${moduleInfo.name}
        --- \n\n
        `;

        // Add categories
        moduleInfo.categories.forEach((category) => {
            fileContent += `## ${category.name}\n\n`;
            category.comments.forEach((comment) => {
                fileContent += `### ${comment.text}\n\n`;
            });
        });

        // Add comments
        fileContent += comments;

        fs.writeFileSync(filePath, fileContent);
    }

    // static 
}