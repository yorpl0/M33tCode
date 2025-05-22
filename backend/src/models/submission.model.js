import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema(
    {
        problem: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Problem', // Reference to your Problem model
            required: true,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User', // Reference to your User model (assuming you have one)
            required: true,
        },
        userCode: {
            type: String,
            required: true,
        },
        userLanguage: {
            type: String,
            required: true,
            enum: ['javascript', 'python', 'cpp', 'java'], // Ensure these match Judge0 IDs later
        },
        // Judge0 related fields - these will be populated after Judge0 returns a result
        judge0SubmissionToken: {
            type: String,
            unique: true,
            sparse: true, // Allows null values, but ensures uniqueness if present
        },
        verdict: {
            type: String,
            default: "Pending", // Initial status
        },
        stdout: { // Standard output from the user's code
            type: String,
        },
        stderr: { // Standard error from the user's code (e.g., from runtime errors)
            type: String,
        },
        compileOutput: { // Compiler output (if compilation fails)
            type: String,
        },
        time: { // Execution time in seconds
            type: Number,
        },
        memory: { // Memory usage in kilobytes (KB)
            type: Number,
        },
    },
    { timestamps: true } // Adds createdAt and updatedAt automatically
);

const Submission = mongoose.model('Submission', submissionSchema);

export default Submission;