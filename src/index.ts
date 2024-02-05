import fs from 'fs'
import CommentsUtil, { Comment } from './utils/comment'
import SourceFile from './utils/file'
import { ModuleBlockInfo, OtherBlockInfo } from './interfaces'


function start() {
    const filePath = __dirname + '/test_files/doc.js'
    const sourceFile = new SourceFile(filePath)
    const comments = CommentsUtil.getCommentsFromFile(sourceFile.fileContent)

    let module = {} as ModuleBlockInfo
    const moduleDocs = [] as {
        blockInfo: ModuleBlockInfo,
        constructInfo: {
            type: string | null,
            name: string | null
        }
    }[]
    for (const _comment of comments) {
        console.log(_comment.blockInfo.type, { comment: _comment.text })
        const blockType = _comment.blockInfo.type
        const commentIsModule = blockType === 'module'

        if (commentIsModule) {
            module = CommentsUtil.getModuleBlockInfo(_comment.text)
        } else {
            const constructInfo = sourceFile.getLinkedCodeConstructInfo(_comment)
            moduleDocs.push({
                blockInfo: module,
                constructInfo
            })
        }
    }

    // Write module docs
    // Get file first
    // Write title and description of module
    // Write constructs
    // Write construct title and description
    // Write construct params
    // Write construct returns
    // Write construct throws
    // Write construct link
    // Write construct type
    // Write construct name
    // Write construct category
    // Write construct sub category
    // Write construct link

    console.log(module)
    const qmdfilePath = __dirname + '/test_files/test.qmd'
    const fileToWrite = fs.readFileSync(qmdfilePath, 'utf8')
    const lines = fileToWrite.split('\n')
    const lastLine = lines[lines.length - 1]

    console.log(lastLine)

    let fileContent = ''
    //  Add module title to qmd file
    fileContent += `--- \n title: ${module.name} \n---\n`

    // Add module description to qmd file
    fileContent += `## Description \n ${module.description} \n`

    // Add constructs to qmd file
    for (const doc of moduleDocs) {
        fileContent += `## ${doc.constructInfo.type} ${doc.constructInfo.name} \n`
    }

    fs.writeFileSync(qmdfilePath, fileContent, 'utf8')


    // Module description}
}

start()
// const modulesInfoContainedInComments = comments.map((comment) => new Comment(comment).getModuleInfo())
// console.log(modulesInfoContainedInComments)