import express, { Router } from "express";
import { commentControllers } from "./comment.controller";
import auth, { UserRole } from "../../middlewares/auth";


const router = express.Router();


router.get("/:commentId", commentControllers.getCommentById)

router.get("/author/:authorId", commentControllers.getCommentByAuthorId)

router.post(
    "/",
    auth(UserRole.ADMIN, UserRole.USER),
    commentControllers.createComment
)



export  const commentRouter:Router = router;