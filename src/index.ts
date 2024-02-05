import fs from 'fs'
import CommentsUtil, { Comment } from './utils/comment'
import File from './utils/file'

const filePath = __dirname + '/test_files/doc.js'
const file = new File(filePath)
const comments = CommentsUtil.getCommentsFromFile(file.fileContent)

for (const _comment of comments) {
    const blockType = _comment.blockInfo.type
    const commentIsModule = blockType === 'module'

    const blockInfo = commentIsModule ? CommentsUtil.getModuleBlockInfo(_comment.text) : CommentsUtil.getOtherBlockInfo(_comment.text)
    const constructInfo = !commentIsModule ? file.getLinkedCodeConstructInfo(_comment) : null

    // console.log(_comment.startLocation, _comment.endLocation)
    console.log({
        constructInfo
    })
}

// const modulesInfoContainedInComments = comments.map((comment) => new Comment(comment).getModuleInfo())
// console.log(modulesInfoContainedInComments)