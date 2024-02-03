import fs from 'fs'

function extractJSDocCommentsFromFile(filePath: string) {
    const fileContent = fs.readFileSync(filePath, 'utf-8')
    const comments = fileContent.match(/\/\*\*[\s\S]*?\*\//g)
    return comments
}

const filePath = __dirname + '/test_files/doc.js'
const comments = extractJSDocCommentsFromFile(filePath)
console.log(comments)
