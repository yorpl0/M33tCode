import express from "express";
import {checkAuth, login,logout,signup,updateProfile} from "../controllers/auth.controller.js";
import { checkAdminRoute, protectRoute } from "../middleware/auth.middleware.js";
import { createComment, createPost } from "../controllers/post.controller.js";
import { createProblem } from "../controllers/problem.controller.js";
import Problem from "../models/problem.model.js";
import Post from "../models/post.model.js";
const router=express.Router();
router.post("/signup",signup);
router.post("/login",login);
router.post("/logout",logout);
router.post("/update-profile",protectRoute,updateProfile);
router.get("/check", protectRoute, checkAuth);
router.post("/admin/problems",protectRoute,checkAdminRoute,createProblem);
router.get("/admin/problems",async(req,res)=>{
    try {
        const problems=await Problem.find();
        res.status(200).json(problems);
    } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch problems" });
}
});
router.get("/problems/:id",async(req,res)=>{
    
    const {id}=req.params;
    const problem= await Problem.findById(id);
    if(!problem){
        return res.status(404).json({message:"Not found."})
    }
    return res.json(problem);
})


export default router;
