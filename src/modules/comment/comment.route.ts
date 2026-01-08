import express, { Router } from "express";
import { commentControllers } from "./comment.controller";
import auth, { UserRole } from "../../middlewares/auth";


const router = express.Router();


router.get("/:commentId", commentControllers.getCommentById)

router.get("/author/:authorId", commentControllers.getCommentByAuthorId)

router.delete("/:commentId",
    auth(UserRole.ADMIN, UserRole.USER), 
    commentControllers.deleteComment
)

router.patch("/:commentId",
    auth(UserRole.ADMIN, UserRole.USER), 
    commentControllers.updateComment
)
router.patch("/:commentId/moderate",
    auth(UserRole.ADMIN), 
    commentControllers.moderateComment
)

router.post(
    "/",
    auth(UserRole.ADMIN, UserRole.USER),
    commentControllers.createComment
)



export  const commentRouter:Router = router;