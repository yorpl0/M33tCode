import Problem from "../models/problem.model.js";
import Submission from "../models/submission.model.js";
import axios from 'axios';


// --- Judge0 Configuration ---
const JUDGE0_API_URL = process.env.JUDGE0_API_URL;
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY; // Use the new variable name
const RAPIDAPI_HOST = process.env.RAPIDAPI_HOST; // New variable for RapidAPI Host

// Helper to map language names to Judge0 Language IDs
// IMPORTANT: Verify these IDs against your Judge0 instance's `/languages` endpoint
const getJudge0LanguageId = (language) => {
    switch (language.toLowerCase()) {
        case 'cpp': return 54; // C++ (GCC 9.2.0)
        case 'java': return 62; // Java (OpenJDK 13.0.1)
        case 'python': return 71; // Python (3.8.1)
        case 'javascript': return 63; // JavaScript (Node.js 12.14.0)
        default: return null; // Or throw an error for unsupported language
    }
};

// --- Controller for Creating a New Problem ---
export const createProblem = async (req, res) => {
    console.log("Reached createProblem:", req.body);
    const {
        title,
        description,
        difficulty,
        tags, // <--- Now directly expecting 'tags' as an array
        constraint, // <--- Now directly expecting 'constraint' as an array
        examples,
        testCases,
        timeLimit,
        memoryLimit
    } = req.body;

    // Basic validation for required fields
    if (!title?.trim() || !description?.trim() || !difficulty || !examples || examples.length === 0 || !testCases || testCases.length === 0) {
        return res.status(400).json({ message: "Title, Description, Difficulty, at least one Example, and at least one Test Case are required." });
    }
    console.log("1");

    // --- REMOVED: processedTags and processedConstraints logic ---
    // The frontend is now responsible for sending these as processed arrays.

    // Validate tags and constraints directly (assuming they are arrays from frontend)
    // We'll still filter and trim here to ensure no empty strings or whitespace-only strings are saved.
    const finalTags = Array.isArray(tags) ? tags.map(tag => tag.trim()).filter(tag => tag !== '') : [];
    const finalConstraints = Array.isArray(constraint) ? constraint.map(c => c.trim()).filter(c => c !== '') : [];

    console.log("finalTags:", finalTags);
    console.log("finalConstraints:", finalConstraints);

    if (finalTags.length === 0) {
        return res.status(400).json({ message: "At least one tag is required." });
    }
    if (finalConstraints.length === 0) {
        return res.status(400).json({ message: "At least one constraint is required." });
    }
    console.log("2");

    // Check if problem with this title already exists
    const existing = await Problem.findOne({ title: title.trim() });
    if (existing) {
        return res.status(409).json({ message: "Problem with this title already exists" });
    }
    console.log("3");

    // Create new Problem document
    const newProblem = new Problem({
        title: title.trim(),
        description: description.trim(),
        difficulty,
        tags: finalTags, // <--- Use the directly received/validated array
        constraint: finalConstraints, // <--- Use the directly received/validated array
        examples,
        testCases,
        timeLimit: timeLimit || 1,
        memoryLimit: memoryLimit || 2048,
    });
    console.log("4:", newProblem);
    try {
        await newProblem.save();
        return res.status(201).json(newProblem);
    } catch (error) {
        console.error("Error in creating problem:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// --- Problem Submission Controller ---
export const handleSubmitProblem = async (req, res) => {
    const { language, code } = req.body;
    const { problemId } = req.params;
    // Assuming req.user._id is populated by your protectRoute middleware
    const userId = req.user._id; 
    console.log("Reached handleSubmit", { language, code, problemId, userId });

    if (!problemId || !language || !code) {
        return res.status(400).json({ message: 'Problem ID, language, and code are required.' });
    }

    const judge0LanguageId = getJudge0LanguageId(language);
    console.log("lang id:", judge0LanguageId);
    if (judge0LanguageId === null) {
        return res.status(400).json({ message: 'Unsupported programming language.' });
    }

    // --- CRITICAL DEBUGGING: Check URL and API Key values ---
    console.log("DEBUG: JUDGE0_API_URL for request:", JUDGE0_API_URL);
    console.log("DEBUG: RAPIDAPI_KEY for request:", RAPIDAPI_KEY ? '******' : 'UNDEFINED/NULL');
    console.log("DEBUG: RAPIDAPI_HOST for request:", RAPIDAPI_HOST);
    // -----------------------------------------------------------

    if (!JUDGE0_API_URL || !RAPIDAPI_KEY || !RAPIDAPI_HOST) {
        console.error("Missing Judge0 API configuration in environment variables.");
        return res.status(500).json({ message: "Server configuration error: Judge0 API credentials are not set." });
    }


    let newSubmission;

    try {
        const problem = await Problem.findById(problemId);
        console.log("Problem deets", { problem });
        if (!problem) {
            return res.status(404).json({ message: 'Problem not found.' });
        }
        if (!problem.testCases || problem.testCases.length === 0) {
            return res.status(400).json({ message: 'Problem has no test cases defined. Cannot judge.' });
        }

        const firstTestCase = problem.testCases[0]; // Get the first test case
        if (!firstTestCase) {
            return res.status(400).json({ message: 'Problem has no test cases to judge against.' });
        }

        const inputForJudge0 = firstTestCase.input;
        const expectedOutputForJudge0 = firstTestCase.expectedOutput; // Ensure this is 'expectedOutput'

        newSubmission = new Submission({
            problem: problemId,
            user: userId,
            userCode: code,
            userLanguage: language,
            verdict: 'Pending',
        });
        await newSubmission.save();
        console.log("New submission:", newSubmission);
        
        const judge0Payload = {
            source_code: code,
            language_id: judge0LanguageId,
            stdin: inputForJudge0,
            expected_output: expectedOutputForJudge0,
            cpu_time_limit: problem.timeLimit || 1,
            memory_limit: 2048,
            base64_encoded: false,
        };

        const judge0Headers = {
            'Content-Type': 'application/json',
            'X-RapidAPI-Key': RAPIDAPI_KEY,    // Use the RapidAPI Key
            'X-RapidAPI-Host': RAPIDAPI_HOST,  // Add the RapidAPI Host header
        };

        const judge0Response = await axios.post(
            `${JUDGE0_API_URL}/submissions?base64_encoded=false&wait=true`,
            judge0Payload,
            { headers: judge0Headers }
        );

        const judge0Result = judge0Response.data;
        console.log("Result:", judge0Result);

        newSubmission.judge0SubmissionToken = judge0Result.token;
        newSubmission.verdict = judge0Result.status?.description || 'Unknown Error';
        newSubmission.stdout = judge0Result.stdout;
        newSubmission.stderr = judge0Result.stderr;
        newSubmission.compileOutput = judge0Result.compile_output;
        newSubmission.time = judge0Result.time;
        newSubmission.memory = judge0Result.memory;

        await newSubmission.save();

        res.status(201).json({
            message: 'Code submitted and judged successfully!',
            submission: newSubmission,
            verdict: newSubmission.verdict // Return verdict for frontend
        });

    } catch (error) {
        console.error('Error in handleSubmitProblem:', error.message);
        if (error.response) {
            console.error('Judge0 API Error Response:', error.response.data);
            return res.status(error.response.status).json({ // Use actual status from Judge0 if available
                message: error.response.data.message || 'Error communicating with judging server.',
                details: error.response.data.error || error.response.data, // Judge0 errors often have 'error' key
            });
        } else if (newSubmission && newSubmission._id) {
            // Update the submission if an error occurred after saving it initially
            await Submission.findByIdAndUpdate(newSubmission._id, {
                verdict: 'Server Error',
                stderr: `Submission failed: ${error.message}`
            });
            return res.status(500).json({ message: 'Internal server error after initial submission setup.' });
        }
        res.status(500).json({ message: 'Internal server error during problem submission.' });
    }
};

export const getSubmissionDetails = async (req, res) => {
    try {
        const { submissionId } = req.params;
        const submission = await Submission.findById(submissionId).populate('problem user');
        if (!submission) {
            return res.status(404).json({ message: 'Submission not found.' });
        }
        res.status(200).json(submission);
    } catch (error) {
        console.error('Error fetching submission details:', error.message);
        res.status(500).json({ message: 'Internal server error.' });
    }
};