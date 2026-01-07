
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

export const commentServices ={
    createComment,
    getCommentById,
    getCommentByAuthorId
}