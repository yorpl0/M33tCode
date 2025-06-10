import express from "express";

import { createComment, createPost } from "../controllers/post.controller.js"; 
import { protectRoute } from "../middleware/auth.middleware.js";
import Post from "../models/post.model.js";
import Comment from "../models/comment.model.js";

const router = express.Router();

router.post("/create-post", protectRoute, createPost);

router.get("/", async (req, res) => {
    try {
        const posts = await Post.find()
            .populate('createdBy', 'username')
            .sort({ createdAt: -1 });
        res.status(200).json(posts);
    } catch (error) {
        console.error("Error fetching posts:", error);
        res.status(500).json({ message: "Failed to fetch posts" });
    }
});

router.get("/:id", async (req, res) => { // This will be GET /api/posts/:id
    try {
        const postId = req.params.id;
        const post = await Post.findById(postId).populate('createdBy', 'username');

        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        const comments = await Comment.find({ postId: postId })
            .populate('author', 'username')
            .sort({ createdAt: 1 });

        res.status(200).json({ post, comments });
    } catch (error) {
        console.error("Error fetching post details:", error);
        res.status(500).json({ message: "Server error while fetching post details" });
    }
});

router.post("/:id/comments", protectRoute, createComment);

export default router;