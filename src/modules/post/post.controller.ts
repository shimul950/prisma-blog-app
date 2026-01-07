import { Request, Response } from "express";
import { postServices } from "./post.services";
import { PostStatus } from "../../../generated/prisma/enums";
import paginationSortingHelper from "../../helper/pagination&sorting";

const createPost = async (req: Request, res: Response) => {
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
        res.status(400).json({
            error: "post creation failed",
            details: e
        })
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

export const postController = {
    createPost,
    getAllPost,
    getPostById
}