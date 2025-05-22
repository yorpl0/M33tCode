import mongoose from "mongoose";
const postSchema=new mongoose.Schema({
    title:{type:String,required:true},
    content:{type:String,required:true},
    upvotedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    downvotedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    createdBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},
    createdAt:{type:Date,default:Date.now},
},{timestamps:true});


const Post = mongoose.model("Post", postSchema);
export default Post;
