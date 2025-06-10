// backend/src/controllers/post.controller.js
import Post from "../models/post.model.js";
import Comment from "../models/comment.model.js";
import User from "../models/user.model.js";

export const createPost = async (req, res) => {
    // console.log("reached createPost");
    const userId = req.user._id;
    const { title, content } = req.body;
    if (!title || !content) {
        return res.status(400).json({ message: "All fields must be filled" });
    }
    const newPost = new Post({ title, content, createdBy: userId });
    try {
        await newPost.save();
        const populatedPost = await newPost.populate('createdBy', 'username');

        return res.status(201).json(populatedPost);
    }
    catch (error) {
        console.error("Error creating post:", error);
        res.status(500).json({ message: "Server error while creating post" });
    }
};

export const createComment = async (req, res) => {
    const userId = req.user._id;
    const { content } = req.body;
    const { id: postId } = req.params;

    if (!content || !postId) {
        return res.status(400).json({ message: "Content and Post ID are required" });
    }

    const newComment = new Comment({ content, postId, author: userId });

    try {
        await newComment.save();
        const populatedComment = await newComment.populate('author', 'username');

        const io = req.app.get('io');
        io.to(postId).emit('newComment', populatedComment); 

        return res.status(201).json(populatedComment);
    } catch (error) {
        console.error("Error creating comment:", error);
        res.status(500).json({ message: "Server error while creating comment" });
    }
};