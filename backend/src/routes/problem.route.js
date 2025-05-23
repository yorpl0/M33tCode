import express from "express";
import { handleSubmitProblem, getSubmissionDetails } from "../controllers/problem.controller.js"; // Import new function
import {checkAuth, login,logout,signup,updateProfile} from "../controllers/auth.controller.js";
import { checkAdminRoute, protectRoute } from "../middleware/auth.middleware.js";
import { createComment, createPost } from "../controllers/post.controller.js";
import { createProblem } from "../controllers/problem.controller.js";
import Problem from "../models/problem.model.js";
const router = express.Router();

// Route to submit code for a specific problem
// Client will POST to /api/problems/:problemId/submit with { language, code } in body
router.post("/:problemId/submit", protectRoute, handleSubmitProblem);

// Route to get details of a specific submission by its ID
// Client will GET from /api/problems/submissions/:submissionId
router.get("/submissions/:submissionId", protectRoute, getSubmissionDetails);
router.post("/admin/problems",protectRoute,checkAdminRoute,createProblem);
router.get("/problems",async(req,res)=>{
    try {
        const problems=await Problem.find();
        res.status(200).json(problems);
    } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch problems" });
}
});
router.get("/:id",async(req,res)=>{
        
    const {id}=req.params;
    const problem= await Problem.findById(id);
    if(!problem){
        return res.status(404).json({message:"Not found."})
    }
    return res.json(problem);
})

export default router;