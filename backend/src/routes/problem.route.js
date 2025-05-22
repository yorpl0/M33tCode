import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { handleSubmitProblem, getSubmissionDetails } from "../controllers/problem.controller.js"; // Import new function

const router = express.Router();

// Route to submit code for a specific problem
// Client will POST to /api/problems/:problemId/submit with { language, code } in body
router.post("/:problemId/submit", protectRoute, handleSubmitProblem);

// Route to get details of a specific submission by its ID
// Client will GET from /api/problems/submissions/:submissionId
router.get("/submissions/:submissionId", protectRoute, getSubmissionDetails);

export default router;