// backend/src/routes/post.route.js
import express from "express";
import { createComment, createPost } from "../controllers/post.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import Post from "../models/post.model.js"; // Make sure Post model is imported
import User from "../models/user.model.js"; // You might need to import User model if not already

const router = express.Router();

router.post("/create-post", protectRoute, createPost);

router.get("/", async (req, res) => {
    try {
        const posts = await Post.find()
                                .populate('createdBy', 'username')
                                .sort({ createdAt: -1 }); // Sort by newest first

        res.status(200).json(posts);
    } catch (error) {
        console.error("Error fetching posts:", error);
        res.status(500).json({ message: "Failed to fetch posts" });
    }
});

router.post("/:id/comments", protectRoute, createComment);

export default router;