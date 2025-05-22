import React, { useEffect, useState } from 'react';
import useProblemStore from '../store/useProblemStore';
import { useParams } from 'react-router-dom';
import CodeEditorPanel from './CodeEditorPanel'; // Assuming this component exists
import toast from 'react-hot-toast'; // For showing submission feedback

const ProblemDetailPage = () => {
  const { id: problemId } = useParams(); // Renamed 'id' to 'problemId' for clarity
  const fetchProblem = useProblemStore((s) => s.fetchProblem);
  const problem = useProblemStore((s) => s.problem);
  // Import submitSolution action and isSubmitting state from your store
  const { submitSolution, isSubmitting } = useProblemStore(); 

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

  // Handler for the "Run Tests" button
  const handleRunButtonPress = () => {
    // TODO: Implement logic to run code against sample test cases
    toast.info("Running tests... (Not yet implemented)");
    console.log("Running tests for problem:", problemId, "Code:", editorData.code, "Language:", editorData.language);
  };

  // Handler for the "Submit Code" button
  const handleSubmitButtonPress = async () => {
    if (!problemId || !editorData.language || !editorData.code) {
      toast.error("Please select a language and write some code before submitting.");
      return;
    }
    
    // Call the submitSolution action from your Zustand store
    // The submitSolution function should handle the API call to your backend
    // and update the store's state (e.g., isSubmitting, submissionResult)
    await submitSolution(problemId, editorData.language, editorData.code);
    // The submitSolution function should internally handle toasts for success/failure
  };

  // if isLoading put up an icon
  // You might want a better loading indicator than just a div
  if (!problem) return <div className="min-h-screen flex items-center justify-center text-xl text-primary">Loading problem...</div>;

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
              </ul> {/* Closing </ul> tag was missing here */}
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

        {/* Right side: Code Editor Panel and Buttons */}
        <div className="flex-1 min-w-0 flex flex-col"> {/* Use flex-col for stacking editor and buttons */}
          <CodeEditorPanel
            language={editorData.language}
            code={editorData.code}
            onLanguageChange={(newLang) => handleEditorPanelChange(newLang, editorData.code)}
            onCodeChange={(newCode) => handleEditorPanelChange(editorData.language, newCode)}
          />
          
          {/* Buttons for Run and Submit */}
          <div className="mt-4 flex gap-4 justify-end"> {/* Added justify-end to align buttons to the right */}
            <button
              type="button" // Important: use type="button" to prevent accidental form submission
              className="btn btn-outline btn-info w-48" // Styled for "Run Tests"
              onClick={handleRunButtonPress}
            >
              Run Tests
            </button>
            <button
              type="submit" // Use type="submit" if this button is inside a form, otherwise "button"
              className="btn btn-primary w-48" // Styled for "Submit Code"
              onClick={handleSubmitButtonPress}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Code'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProblemDetailPage;