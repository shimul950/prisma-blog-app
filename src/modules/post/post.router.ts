import express, { NextFunction, Request, Response } from "express";
import { postController } from "./post.controller";
import { auth as betterAuth } from "../../lib/auth";

const router = express.Router();

const auth =(...role:any)=>{
    return async(req:Request, res:Response, next:NextFunction)=>{
            //get user session
        const session = await betterAuth.api.getSession({
            headers: req.headers as any
        })
        console.log(session);
    }
}

router.post("/", auth("user","admin"),postController.createPost)

export  const postRouter = router;