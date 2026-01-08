
import { CommentStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";

const createComment = async(payload:{
    content: string;
    authorId: string;
    postId:string;
    parentId?:string;
})=>{
    const postData = await prisma.post.findUniqueOrThrow({
        where:{
            id: payload.postId
        }
    })
    if(payload.parentId){
        const parentData = await prisma.comment.findUniqueOrThrow({
            where:{
                id:payload.parentId
            }
        })
    }
    return await prisma.comment.create({
        data:payload
    })
}


const getCommentById = async(commentId:string)=>{
    const result = await prisma.comment.findUnique({
        where:{
            id:commentId
        },
        include:{
            post:{
                select:{
                    id:true,
                    title:true
                }
            }
        }
    })
    return result
}

const getCommentByAuthorId = async(authorId:string)=>{
    return await prisma.comment.findMany({
        where:{
            authorId
        },
        orderBy:{createdAt: "desc"}
    })
}

const deleteComment = async( commentId:string, authorId:string)=>{
    const commentData = await prisma.comment.findFirst({
        where:{
            id:commentId,
            authorId
        },
        select:{
            id:true
        }
    })
    if(!commentData){
        throw new Error("Your comment is not found")
    }

    return await prisma.comment.delete({
        where:{
            id:commentData.id
        }
    })
    
}

// authorId, commentId, updatedData
const updateComment = async(authorId:string, data:{content:string, status:CommentStatus}, commentId:string)=>{
    const commentData = await prisma.comment.findFirst({
        where:{
            id:commentId,
            authorId
        },
        select:{
            id:true
        }
    })
    if(!commentData){
        throw new Error("Your comment is not found")
    }

    return await prisma.comment.update({
        where:{
            id:commentId
        },
        data
    })
}

const moderateComment = async(commentId:string, data:{status:CommentStatus} )=>{
    const commentData = await prisma.comment.findUniqueOrThrow({
        where:{
            id:commentId
        }
    })
    if(commentData.status === data.status){
        throw new Error(`your provided status ${data.status} is already exist`)
    }

    return await prisma.comment.update({
        where:{
            id: commentId
        },
        data
    })

}

export const commentServices ={
    createComment,
    getCommentById,
    getCommentByAuthorId,
    deleteComment,
    updateComment,
    moderateComment
}