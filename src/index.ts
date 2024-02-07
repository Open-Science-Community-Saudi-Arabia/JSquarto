import fs from 'fs'
import CommentsUtil, { Comment } from './utils/comment'
import SourceFile from './utils/file'
import { Doc, ModuleBlockInfo } from './interfaces'
import Writer from './utils/writer'


function start() {
    const filePath = __dirname + '/test_files/doc.js'
    const sourceFile = new SourceFile(filePath)
    const comments = CommentsUtil.getCommentsFromFile(sourceFile.fileContent)

    let module = {} as ModuleBlockInfo
    const moduleDocs: Doc[] = []
    for (const _comment of comments) {
        console.log(_comment.blockInfo.type, { comment: _comment.text })
        const blockType = _comment.blockInfo.type
        const commentIsModule = blockType === 'module'

        if (commentIsModule) {
            module = CommentsUtil.getModuleBlockInfo(_comment.text)
        } else {
            const constructInfo = sourceFile.getLinkedCodeConstructInfo(_comment)
            moduleDocs.push({
                blockInfo: CommentsUtil.getOtherBlockInfo(_comment.text),
                constructInfo
            })
        }
    }

    Writer.writeModuleDocs({
        module,
        originalFilePath: filePath,
        docs: moduleDocs
    })
}

start()
// const modulesInfoContainedInComments = comments.map((comment) => new Comment(comment).getModuleInfo())
// console.log(modulesInfoContainedInComments)