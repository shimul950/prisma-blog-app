import express, { NextFunction, Request, Response } from "express";
import { postController } from "./post.controller";
import auth, { UserRole } from "../../middlewares/auth";



const router = express.Router();

router.get("/", postController.getAllPost)

router.post("/", auth(UserRole.USER),postController.createPost)

export  const postRouter = router;