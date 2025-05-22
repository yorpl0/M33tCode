import Post from "../models/post.model.js";
import Comment from "../models/comment.model.js";
export const createPost=async (req,res)=>{
    const userId=req.user._id;
    const {title,content} = req.body;
    if(!title || !content){
        return res.status(400).json({message:"All fields must be filled"})
    };
    const newPost= new Post({title,content,createdBy:userId});  
    try {
        await newPost.save();
           return res.status(201).json({
            createdBy:userId,
            id:newPost._id,
            title,content
           })
        }
    catch (error) {
        console.error("Error creating post:", error);
        res.status(500).json({ message: "Server error while creating post" });
    }
};
export const createComment=async(req,res)=>{
    const userId=req.user._id;
    const {content,postId}=req.body;
    if(!content || !postId){
        return res.status(400).json({message:"All fields must be filled"})
    };
    const newComment = new Comment({content,postId,author:userId})
    try {
        await newComment.save();
        return res.status(201).json(newComment);
    } catch (error) {
        console.error("Error creating comment:", error);
        res.status(500).json({ message: "Server error while creating comment" });
    }
};

