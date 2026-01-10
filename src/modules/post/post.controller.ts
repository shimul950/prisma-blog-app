import { NextFunction, Request, Response } from "express";
import { postServices } from "./post.services";
import { PostStatus } from "../../../generated/prisma/enums";
import paginationSortingHelper from "../../helper/pagination&sorting";
import { UserRole } from "../../middlewares/auth";

const createPost = async (req: Request, res: Response, next:NextFunction) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(400).json({
                error: "unUthorized"
            })
        }

        const result = await postServices.createPost(req.body, user.id)
        res.status(201).json(result)
    }
    catch (e) {
        next(e)
    }
}

const getAllPost = async(req:Request, res:Response) =>{
    try{
        const {search} = req.query
        const searchString = typeof search === 'string' ? search : undefined

        const tags = req.query.tags ? (req.query.tags as string).split(",") : [];

        const isFeatured = req.query.isFeatured 
            ? req.query.isFeatured === 'true'
                ?true
                :req.query.isFeatured === 'false'
                    ?false
                    :undefined 
            : undefined

        const status = req.query.status as PostStatus
        const authorId = req.query.authorId as string | undefined

                
        //---------------receive value from client req through postman for pagination
        // const page = Number(req.query.page ?? 1);
        // const limit = Number(req.query.limit ?? 10);
        // const skip = (page - 1)* limit;

        //-------------------for sorting order by asc/desc
        // const sortBy = req.query.sortBy as string | undefined
        // const sortOrder = req.query.sortOrder as string | undefined

        const {page, limit,skip,sortBy,sortOrder} = paginationSortingHelper(req.query);
        

        const result = await postServices.getAllPost({search:searchString, tags, isFeatured, status, authorId, page, limit, skip, sortBy, sortOrder})
        res.status(200).json(result)
    }
    catch (e) {
        res.status(400).json({
            error: "post creation failed",
            details: e
        })
    }
}

const getPostById = async(req:Request, res:Response)=>{
    try{
        const {postId }= req.params;
        if(!postId){
            throw new Error("Post Id is required")
        }
        const result = await postServices.getPostById(postId);
        res.status(200).json(result)
    }catch (e) {
        res.status(400).json({
            error: "post creation failed",
            details: e
        })
    }
}
const getMyPost = async(req:Request, res:Response)=>{
    try{
        const user = req.user;
        if(!user){
            throw new Error("user is required")
        }
        
        const result = await postServices.getMyPost(user.id);
        res.status(200).json(result)
    }catch (e) {
        res.status(400).json({
            error: "find own post failed",
            details: e
        })
    }
}
const updateOwnPost = async(req:Request, res:Response)=>{
    try{
        const user = req.user;
        if(!user){
            throw new Error("user is required")
        }
        const {postId}= req.params
        const isAdmin = user.role === UserRole.ADMIN //if the user is Admin, it returns true
        const result = await postServices.updateOwnPost(postId as string, req.body, user.id, isAdmin);
        res.status(200).json(result)
    }catch (e) {
        const errorMessage = (e instanceof Error) ? e.message :"update failed"
        res.status(400).json({
            error: errorMessage,
            details: e
        })
    }
}
const deletePost = async(req:Request, res:Response)=>{
    try{
        const user = req.user;
        if(!user){
            throw new Error("user is required")
        }
        const {postId}= req.params
        const isAdmin = user.role === UserRole.ADMIN //if the user is Admin, it returns true
        const result = await postServices.deletePost(postId as string, user.id, isAdmin);
        res.status(200).json(result)
    }catch (e) {
        const errorMessage = (e instanceof Error) ? e.message :"update failed"
        res.status(400).json({
            error: errorMessage,
            details: e
        })
    }
}
const getStats = async(req:Request, res:Response)=>{
    try{
        
        const result = await postServices.getStats();
        res.status(200).json(result)
    }catch (e) {
        const errorMessage = (e instanceof Error) ? e.message :"Statistics fetched failed"
        res.status(400).json({
            error: errorMessage,
            details: e
        })
    }
}

export const postController = {
    createPost,
    getAllPost,
    getPostById,
    getMyPost,
    updateOwnPost,
    deletePost,
    getStats
}