import fs from 'fs'
import CommentsUtil, { Comment } from './utils/comment'
import File from './utils/file'

const filePath = __dirname + '/test_files/doc.js'
const file = new File(filePath)
const comments = CommentsUtil.getCommentsFromFile(file.fileContent)

for (const _comment of comments) {
    const blockType = _comment.getBlockType()
    const commentIsModule = blockType === 'module'
    if (commentIsModule) {
        const moduleInfo = _comment.getModuleInfo()
        // console.log(moduleInfo)
    } else {
        const otherBlockInfo = _comment.getOtherBlockInfo()
        console.log(otherBlockInfo)
    }

    

}

// const modulesInfoContainedInComments = comments.map((comment) => new Comment(comment).getModuleInfo())
// console.log(modulesInfoContainedInComments)