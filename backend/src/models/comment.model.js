import mongoose from "mongoose";
const commentSchema=new mongoose.Schema({
    author:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},
    upvotedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    downvotedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    content:{type:String,required:true},
    postId:{type:mongoose.Schema.Types.ObjectId,ref:"Post",required:true},
},{timestamps:true});
const Comment = mongoose.model("Comment",commentSchema);
export default Comment;
