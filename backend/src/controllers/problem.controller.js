import Problem from "../models/problem.model.js";
import Submission from "../models/submission.model.js";
import axios from 'axios';


const JUDGE0_API_URL = process.env.JUDGE0_API_URL;
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const RAPIDAPI_HOST = process.env.RAPIDAPI_HOST;

const getJudge0LanguageId = (language) => {
    switch (language.toLowerCase()) {
        case 'cpp': return 54;
        case 'java': return 62;
        case 'python': return 71;
        case 'javascript': return 63;
        default: return null;
    }
};
const toBase64 = (str) => Buffer.from(str || "", 'utf8').toString('base64');

const decodeBase64 = (str) => {
    if (str) {
        try {
            return Buffer.from(str, 'base64').toString('utf8');
        } catch (e) {
            return str;
        }
    }
    return null;
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));


export const createProblem = async (req, res) => {
    const {
        title,
        description,
        difficulty,
        tags,
        constraint,
        examples,
        testCases,
        timeLimit,
        memoryLimit
    } = req.body;

    if (!title?.trim() || !description?.trim() || !difficulty || !examples || examples.length === 0 || !testCases || testCases.length === 0) {
        return res.status(400).json({ message: "Title, Description, Difficulty, at least one Example, and at least one Test Case are required." });
    }

    const finalTags = Array.isArray(tags) ? tags.map(tag => tag.trim()).filter(tag => tag !== '') : [];
    const finalConstraints = Array.isArray(constraint) ? constraint.map(c => c.trim()).filter(c => c !== '') : [];

    if (finalTags.length === 0) {
        return res.status(400).json({ message: "At least one tag is required." });
    }
    if (finalConstraints.length === 0) {
        return res.status(400).json({ message: "At least one constraint is required." });
    }

    const existing = await Problem.findOne({ title: title.trim() });
    if (existing) {
        return res.status(409).json({ message: "Problem with this title already exists" });
    }

    const newProblem = new Problem({
        title: title.trim(),
        description: description.trim(),
        difficulty,
        tags: finalTags,
        constraint: finalConstraints,
        examples,
        testCases,
        timeLimit: timeLimit || 1,
        memoryLimit: memoryLimit || 2048,
    });
    try {
        await newProblem.save();
        return res.status(201).json(newProblem);
    } catch (error) {
        console.error("Error in creating problem:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};


export const handleSubmitProblem = async (req, res) => {
    console.log("reached handlesubmit")
    const { language, code } = req.body;
    const { problemId } = req.params;
    const userId = req.user._id; 

    if (!problemId || !language || !code) {
        return res.status(400).json({ message: 'Problem ID, language, and code are required.' });
    }

    const judge0LanguageId = getJudge0LanguageId(language);
    if (judge0LanguageId === null) {
        return res.status(400).json({ message: 'Unsupported programming language.' });
    }

    if (!JUDGE0_API_URL || !RAPIDAPI_KEY || !RAPIDAPI_HOST) {
        console.error("Missing Judge0 API configuration in environment variables.");
        return res.status(500).json({ message: "Server configuration error: Judge0 API credentials are not set." });
    }

    let newSubmission;

    try {
        const problem = await Problem.findById(problemId);
        if (!problem) {
            return res.status(404).json({ message: 'Problem not found.' });
        }
        if (!problem.testCases || problem.testCases.length === 0) {
            return res.status(400).json({ message: 'Problem has no test cases defined. Cannot judge.' });
        }


        const submissionsPayload = problem.testCases.map(testCase => ({
            source_code: toBase64(code),
            language_id: judge0LanguageId,
            stdin: toBase64(testCase.input),
            expected_output: toBase64(testCase.expectedOutput),
            cpu_time_limit:  2,
            memory_limit: 65536,
        }));


        newSubmission = new Submission({
            problem: problemId,
            user: userId,
            userCode: code,
            userLanguage: language,
            verdict: 'Pending',
            testCaseResults: [],
        });
        await newSubmission.save();

        const judge0Headers = {
            'Content-Type': 'application/json',
            'X-RapidAPI-Key': RAPIDAPI_KEY,
            'X-RapidAPI-Host': RAPIDAPI_HOST,
        };

        // Submit batch to Judge0 to get tokens
        const judge0TokensResponse = await axios.post(
            `${JUDGE0_API_URL}/submissions/batch?base64_encoded=true&wait=false`,
            { submissions: submissionsPayload },
            { headers: judge0Headers }
        );

        const judge0Tokens = judge0TokensResponse.data;

        let overallVerdict = 'Accepted';
        let verdictPriority = {
            'Accepted': 0, 'Accepted (with warnings)': 1, 'Wrong Answer': 2,
            'Time Limit Exceeded': 3, 'Memory Limit Exceeded': 4,
            'Runtime Error (NZEC)': 5, 'Runtime Error': 5, 'SIGSEGV': 5, 'SIGXFSZ': 5, 'SIGFPE': 5, 'NZEC': 5,
            'Internal Error': 6, 'Compilation Error': 7, 'Unknown Error': 8, 'Partial Accepted': 9,
            'In Queue': 10, 'Processing': 11
        };
        let highestPriorityVerdict = 'Accepted'; 
        let highestPriorityValue = verdictPriority['Accepted'];

        let totalTime = 0;
        let totalMemory = 0;
        const testCaseResults = [];

        // Fetch results for each token by polling
        for (let i = 0; i < judge0Tokens.length; i++) {
            const { token } = judge0Tokens[i];
            const testCase = problem.testCases[i]; 
            let result = null;
            let currentTestCaseVerdict = 'In Queue';

            let attempts = 0;
            const maxAttempts = 10;
            const pollInterval = 1000;

            while (
                (currentTestCaseVerdict === 'In Queue' || currentTestCaseVerdict === 'Processing') && 
                attempts < maxAttempts
            ) {
                if (attempts > 0) {
                    await sleep(pollInterval);
                }
                attempts++;
                try {
                    const singleSubmissionResponse = await axios.get(
                        `${JUDGE0_API_URL}/submissions/${token}?base64_encoded=true&fields=*`,
                        { headers: judge0Headers }
                    );
                    result = singleSubmissionResponse.data;
                    currentTestCaseVerdict = result.status?.description || 'Unknown Error';
                } catch (pollError) {
                    console.error(`Error polling for token ${token}:`, pollError.message);
                    currentTestCaseVerdict = 'Judge0 API Error';
                    result = { stdout: null, stderr: `Error polling: ${pollError.message}`, compile_output: null, time: null, memory: null, status: { description: 'Judge0 API Error' } };
                    break;
                }
            }

            if (currentTestCaseVerdict === 'In Queue' || currentTestCaseVerdict === 'Processing') {
                currentTestCaseVerdict = 'Unknown Error (Timeout)';
                result = { stdout: null, stderr: 'Judge0 did not return result within timeout.', compile_output: null, time: null, memory: null, status: { description: 'Unknown Error (Timeout)' } };
            }

            const decodedStdout = decodeBase64(result.stdout);
            const decodedStderr = decodeBase64(result.stderr);
            const decodedCompileOutput = decodeBase64(result.compile_output);
            
            const safeTime = parseFloat(result.time);
            const safeMemory = parseInt(result.memory);

            testCaseResults.push({
                input: testCase.input,
                expectedOutput: testCase.expectedOutput,
                actualOutput: decodedStdout, 
                verdict: currentTestCaseVerdict,
                time: isNaN(safeTime) ? null : safeTime,
                memory: isNaN(safeMemory) ? null : safeMemory,
                stderr: decodedStderr,
                compileOutput: decodedCompileOutput,
            });
            
            const currentPriority = verdictPriority[currentTestCaseVerdict] || verdictPriority['Unknown Error'];
            if (currentPriority > highestPriorityValue) {
                highestPriorityValue = currentPriority;
                highestPriorityVerdict = currentTestCaseVerdict;
            }

            totalTime += isNaN(safeTime) ? 0 : safeTime;
            totalMemory = Math.max(totalMemory, isNaN(safeMemory) ? 0 : safeMemory);

        }
        console.log("TESTCASE RESULTS:",testCaseResults);
        overallVerdict = highestPriorityVerdict; 

        newSubmission.judge0SubmissionToken = judge0Tokens.length > 0 ? judge0Tokens[0].token : null; 
        newSubmission.verdict = overallVerdict;
        newSubmission.stdout = testCaseResults.find(tc => tc.actualOutput)?.actualOutput || null; 
        newSubmission.stderr = testCaseResults.find(tc => tc.stderr)?.stderr || null;
        newSubmission.compileOutput = testCaseResults.find(tc => tc.compileOutput)?.compileOutput || null;

        newSubmission.time = totalTime; 
        newSubmission.memory = totalMemory; 
        newSubmission.testCaseResults = testCaseResults; 

        await newSubmission.save();

        res.status(201).json({
            message: 'Code submitted and judged successfully!',
            submission: newSubmission,
            verdict: newSubmission.verdict, 
            testCaseResults: newSubmission.testCaseResults, 
        });

    } catch (error) {
        console.error('Error in handleSubmitProblem:', error.message);
        if (error.response) {
            console.error('Judge0 API Error Response:', error.response.data);
            if (newSubmission && newSubmission._id) {
                await Submission.findByIdAndUpdate(newSubmission._id, {
                    verdict: 'Judge0 API Error',
                    stderr: JSON.stringify(error.response.data),
                    compileOutput: error.message
                });
            }
            return res.status(error.response.status).json({
                message: error.response.data.message || 'Error communicating with judging server.',
                details: error.response.data.error || error.response.data,
            });
        } else if (newSubmission && newSubmission._id) {
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
