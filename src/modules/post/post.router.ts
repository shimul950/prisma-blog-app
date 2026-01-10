import express, { NextFunction, Request, Response } from "express";
import { postController } from "./post.controller";
import auth, { UserRole } from "../../middlewares/auth";



const router = express.Router();

router.get("/stats", postController.getStats)

router.get("/", postController.getAllPost)

router.get("/myPost",auth(UserRole.USER, UserRole.ADMIN), postController.getMyPost)

router.get("/:postId", postController.getPostById)

router.post("/", auth(UserRole.USER, UserRole.ADMIN),postController.createPost)

router.patch("/:postId", auth(UserRole.USER, UserRole.ADMIN), postController.updateOwnPost)

router.delete("/:postId", auth(UserRole.USER, UserRole.ADMIN), postController.deletePost)

export  const postRouter = router;