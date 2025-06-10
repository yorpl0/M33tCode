import React, { useEffect, useState } from 'react';
import useProblemStore from '../store/useProblemStore';
import { useParams } from 'react-router-dom';
import CodeEditorPanel from './CodeEditorPanel'; // Assuming this component exists
import toast from 'react-hot-toast'; // For showing submission feedback

const ProblemDetailPage = () => {
  const { id: problemId } = useParams(); // Renamed 'id' to 'problemId' for clarity
  const fetchProblem = useProblemStore((s) => s.fetchProblem);
  const problem = useProblemStore((s) => s.problem);
  // Import submitSolution action, isSubmitting state, AND submissionResult state from your store
  const { submitSolution, isSubmitting, submissionResult } = useProblemStore(); 

  const [editorData, setEditorData] = useState({
    language: 'javascript',
    code: '// Write your code here', // Initial code value
  });

  // Effect to fetch problem and set initial code
  useEffect(() => {
    console.log("Fetched ID from route:", problemId);
    if (problemId) {
      fetchProblem(problemId);
    }
  }, [problemId, fetchProblem]);

  // Effect to update editor code when problem data is loaded
  useEffect(() => {
    if (problem && problem.initialCode && problem.initialCode[editorData.language]) {
      setEditorData(prev => ({
        ...prev,
        code: problem.initialCode[editorData.language],
      }));
    } else if (problem && !problem.initialCode) {
        // If problem doesn't have initialCode, ensure editor is not stuck on old code
        setEditorData(prev => ({
            ...prev,
            code: '// Write your code here',
        }));
    }
  }, [problem, editorData.language]); // Depend on problem and selected language

  // Handle changes from the CodeEditorPanel
  const handleEditorPanelChange = (newLanguage, newCode) => {
    setEditorData({ language: newLanguage, code: newCode });
  };

  const handleSubmitButtonPress = async () => {
    if (!problemId || !editorData.language || !editorData.code) {
      toast.error("Please select a language and write some code before submitting.");
      return;
    }
    
    // Call the submitSolution action from your Zustand store
    await submitSolution(problemId, editorData.language, editorData.code);
  };

  // You might want a better loading indicator than just a div
  if (!problem) return <div className="min-h-screen flex items-center justify-center text-xl text-primary">Loading problem...</div>;

  // Helper to determine verdict styling
  const getVerdictColorClass = (verdict) => {
    switch (verdict) {
      case 'Accepted':
        return 'text-success'; // Tailwind success color
      case 'Wrong Answer':
      case 'Time Limit Exceeded':
      case 'Memory Limit Exceeded':
      case 'Runtime Error':
      case 'Compilation Error':
      case 'Failed': // For client-side or generic server errors
        return 'text-error'; // Tailwind error color
      case 'Pending':
      case 'Judging...':
        return 'text-info'; // Tailwind info color
      default:
        return 'text-base-content'; // Default text color
    }
  };

  return (
    // Add pt-16 for navbar clearance
    <div className="min-h-screen bg-base-200 p-6 pt-16">
      {/* Use flexbox to arrange left and right panels side-by-side */}
      <div className="flex flex-col lg:flex-row gap-6"> {/* Added lg:flex-row for responsive layout */}
        {/* Left side: problem details */}
        <div className="w-full lg:w-1/2 max-w-3xl bg-base-100 shadow-lg p-6 rounded-xl">
          {/* Title */}
          <h1 className="card-title text-3xl text-primary">{problem.title}</h1>

          {/* Difficulty */}
          <div className="mt-2">
            <span className="font-semibold text-base-content">Difficulty:</span>
            <span className={`badge ml-2 ${
              problem.difficulty === 'Easy' ? 'badge-success'
                : problem.difficulty === 'Medium' ? 'badge-warning'
                  : 'badge-error'
              }`}>
              {problem.difficulty}
            </span>
          </div>

          {/* Tags */}
          {problem.tags?.length > 0 && (
            <div className="mt-4">
              <h2 className="text-md font-semibold text-base-content mb-1">Tags:</h2>
              <div className="flex flex-wrap gap-2">
                {problem.tags.map((tag, index) => (
                  <div key={index} className="badge badge-outline badge-info">{tag}</div>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          <div className="mt-4">
            <h2 className="text-lg font-semibold text-base-content mb-2">Description</h2>
            <p className="text-base-content whitespace-pre-line">{problem.description}</p>
          </div>

          {/* Constraints */}
          {problem.constraint?.length > 0 && (
            <div className="mt-4">
              <h2 className="text-lg font-semibold text-base-content mb-2">Constraints</h2>
              <ul className="list-disc list-inside text-base-content">
                {problem.constraint.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Examples */}
          {problem.examples?.length > 0 && (
            <div className="mt-4">
              <h2 className="text-lg font-semibold text-base-content mb-2">Examples</h2>
              <div className="flex flex-col gap-4">
                {problem.examples.map((ex, idx) => (
                  <div key={idx} className="bg-base-300 p-4 rounded-lg">
                    <p><strong>Input:</strong> <code className="bg-base-100 px-2 py-1 rounded">{ex.input}</code></p>
                    <p><strong>Output:</strong> <code className="bg-base-100 px-2 py-1 rounded">{ex.output}</code></p>
                    {ex.explanation && <p><strong>Explanation:</strong> {ex.explanation}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right side: Code Editor Panel, Buttons, and Submission Results */}
        <div className="flex-1 min-w-0 flex flex-col">
          <CodeEditorPanel
            language={editorData.language}
            code={editorData.code}
            onLanguageChange={(newLang) => handleEditorPanelChange(newLang, editorData.code)}
            onCodeChange={(newCode) => handleEditorPanelChange(editorData.language, newCode)}
          />
          
          {/* Buttons for Run and Submit */}
          <div className="mt-4 flex gap-4 justify-end">
            {/* CAN ADD RUN TESTS IF REQUIRED*/}
            <button
              type="button" // Changed to type="button" to prevent accidental form submission if not wrapped in a form
              className="btn btn-primary w-48 justify-center"
              onClick={handleSubmitButtonPress}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Code'}
            </button>
          </div>

          {/* === START: SUBMISSION RESULT DISPLAY === */}
          {submissionResult && (
            <div className="mt-6 p-4 bg-base-100 shadow-lg rounded-xl">
              <h3 className="text-xl font-bold mb-2 text-base-content">Submission Result:</h3>
              
              {isSubmitting ? (
                <p className="text-info">Judging your code...</p>
              ) : (
                <>
                  {submissionResult.verdict && (
                    <p className={`text-2xl font-bold ${getVerdictColorClass(submissionResult.verdict)}`}>
                      Verdict: {submissionResult.verdict}
                    </p>
                  )}
                  {submissionResult.time && (
                    <p className="text-base-content mt-1">Time: {submissionResult.time} s</p>
                  )}
                  {submissionResult.memory && (
                    <p className="text-base-content mt-1">Memory: {submissionResult.memory} KB</p>
                  )}

                  {/* Display stdout (if available and not empty) */}
                  {submissionResult.stdout && submissionResult.stdout.trim() !== '' && (
                    <div className="mt-3">
                      <h4 className="font-semibold text-base-content">Standard Output:</h4>
                      <pre className="bg-base-300 p-2 rounded-md text-sm overflow-auto max-h-40">
                        {submissionResult.stdout}
                      </pre>
                    </div>
                  )}

                  {/* Display stderr (if available and not empty) */}
                  {submissionResult.stderr && submissionResult.stderr.trim() !== '' && (
                    <div className="mt-3">
                      <h4 className="font-semibold text-error">Standard Error:</h4>
                      <pre className="bg-base-300 p-2 rounded-md text-sm overflow-auto max-h-40">
                        {submissionResult.stderr}
                      </pre>
                    </div>
                  )}

                  {/* Display compileOutput (if available and not empty) */}
                  {submissionResult.compileOutput && submissionResult.compileOutput.trim() !== '' && (
                    <div className="mt-3">
                      <h4 className="font-semibold text-error">Compilation Output:</h4>
                      <pre className="bg-base-300 p-2 rounded-md text-sm overflow-auto max-h-40">
                        {submissionResult.compileOutput}
                      </pre>
                    </div>
                  )}

                  {/* Display general details/error message if verdict is 'Failed' or 'Unknown Error' from backend */}
                  {(submissionResult.verdict === 'Failed' || submissionResult.verdict === 'Unknown Error') && submissionResult.details && (
                    <div className="mt-3">
                      <h4 className="font-semibold text-error">Details:</h4>
                      <p className="text-error">{submissionResult.details}</p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
          {/* === END: SUBMISSION RESULT DISPLAY === */}
        </div>
      </div>
    </div>
  );
};

export default ProblemDetailPage;