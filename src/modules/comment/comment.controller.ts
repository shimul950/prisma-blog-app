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

export const commentControllers ={
    createComment,
    getCommentById,
    getCommentByAuthorId
}