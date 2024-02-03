import fs from 'fs'
import CommentExtractor from './utils/extractor'

const filePath = __dirname + '/test_files/doc.js'
const comments = CommentExtractor.extractCommentsFromFile(fs.readFileSync(filePath, 'utf8'))
console.log(comments)