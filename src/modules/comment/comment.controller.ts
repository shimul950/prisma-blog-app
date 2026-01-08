import { Request, Response } from "express";
import { commentServices } from "./comment.service";


const createComment = async(req:Request, res:Response)=>{
    try{
        const user= req.user;
        req.body.authorId = user?.id
        const result = await commentServices.createComment(req.body);
        res.status(200).json(result)
    }catch (e) {
        res.status(400).json({
            error: "comment creation failed",
            details: e
        })
    }
}
const getCommentById = async(req:Request, res:Response)=>{
    try{
        const {commentId }= req.params
        const result = await commentServices.getCommentById(commentId as string);
        res.status(200).json(result)
    }catch (e) {
        res.status(400).json({
            error: "comment not found",
            details: e
        })
    }
}
const getCommentByAuthorId = async(req:Request, res:Response)=>{
    try{
        const {authorId }= req.params
        const result = await commentServices.getCommentByAuthorId(authorId as string);
        res.status(200).json(result)
    }catch (e) {
        res.status(400).json({
            error: "comment not found",
            details: e
        })
    }
}

const deleteComment = async(req:Request, res:Response)=>{
    try{
        const user = req.body;
        const {commentId} = req.params
        const result = await commentServices.deleteComment(commentId as string, user?.id as string);
        res.status(200).json(result)
    }catch (e) {
        res.status(400).json({
            error: "comment deletion failed",
            details: e
        })
    }
}
const updateComment = async(req:Request, res:Response)=>{
    try{
        const user = req.user
        const {commentId} = req.params
        const result = await commentServices.updateComment(user?.id as string, req.body, commentId as string);
        res.status(200).json(result);
    }catch (e) {
        res.status(400).json({
            error: "comment updating failed",
            details: e
        })
    }
}
const moderateComment = async(req:Request, res:Response)=>{
    try{
        const {commentId }= req.params
        const result = await commentServices.moderateComment(commentId as string, req.body);
        res.status(200).json(result);
    }catch (e) {
        const errorMessage = (e instanceof Error) ? e.message :"moderating failed"
        res.status(400).json({
            error: errorMessage,
            details: e
        })
    }
}

export const commentControllers ={
    createComment,
    getCommentById,
    getCommentByAuthorId,
    deleteComment,
    updateComment,
    moderateComment
}