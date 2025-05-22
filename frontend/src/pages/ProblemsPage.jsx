import React, { useState } from 'react';
import useProblemStore from '../store/useProblemStore';
import toast from 'react-hot-toast';

export const ProblemsPage = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    difficulty: "",
    tags: [], // State for tags
    constraint: [], // State for constraints
    examples: [{ input: "", output: "", explanation: "" }],
    testCases: [{ input: "", expectedOutput: "", isHidden: true }],
    timeLimit: 1,
    memoryLimit: 256,
  });

  const { createProblem, isCreating } = useProblemStore();

  const validateForm = () => {
    const { title, description, difficulty, examples, testCases, tags, constraint } = formData; // Added tags and constraint to validation
    if (!title.trim() || !description.trim() || !difficulty || examples.length === 0 || testCases.length === 0) {
      toast.error("Title, Description, Difficulty, and at least one Example and one Test Case are required.");
      return false;
    }
    for (const ex of examples) {
      if (!ex.input.trim() || !ex.output.trim()) {
        toast.error("All example inputs and outputs must be filled.");
        return false;
      }
    }
    for (const tc of testCases) {
      if (!tc.input.trim() || !tc.expectedOutput.trim()) {
        toast.error("All test case inputs and expected outputs must be filled.");
        return false;
      }
    }
    
    // Add validation for tags and constraints to ensure they are not just empty lines
    // This filtering happens at validation time, not on every keystroke
    if (tags.filter(tag => tag.trim() !== '').length === 0) {
        toast.error("At least one tag is required.");
        return false;
    }
    if (constraint.filter(c => c.trim() !== '').length === 0) {
        toast.error("At least one constraint is required.");
        return false;
    }

    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      // It's good practice to ensure final data is clean before sending
      const dataToSubmit = {
          ...formData,
          tags: formData.tags.map(tag => tag.trim()).filter(tag => tag !== ''),
          constraint: formData.constraint.map(c => c.trim()).filter(c => c !== ''),
      };
      createProblem(dataToSubmit);
    }
  };

  // --- Handlers for Examples ---
  const handleExampleChange = (index, field, value) => {
    const updated = [...formData.examples];
    updated[index][field] = value;
    setFormData({ ...formData, examples: updated });
  };

  const addExample = () => {
    setFormData({
      ...formData,
      examples: [...formData.examples, { input: "", output: "", explanation: "" }],
    });
  };

  const removeExample = (index) => {
    const updated = formData.examples.filter((_, i) => i !== index);
    setFormData({ ...formData, examples: updated });
  };

  // --- Handlers for Test Cases ---
  const handleTestCaseChange = (index, field, value) => {
    const updated = [...formData.testCases];
    updated[index][field] = value;
    setFormData({ ...formData, testCases: updated });
  };

  const addTestCase = () => {
    setFormData({
      ...formData,
      testCases: [...formData.testCases, { input: "", expectedOutput: "", isHidden: true }],
    });
  };

  const removeTestCase = (index) => {
    const updated = formData.testCases.filter((_, i) => i !== index);
    setFormData({ ...formData, testCases: updated });
  };

  return (
    <div className="p-8 max-w-4xl mx-auto bg-base-200 rounded-xl mt-24">
      <h2 className="text-3xl font-bold mb-6 text-center text-primary">Create New Problem</h2>
      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Title */}
        <div>
          <label className="label">
            <span className="label-text text-lg">Title</span>
          </label>
          <input
            type="text"
            className="input input-bordered w-full"
            placeholder="Problem Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="label">
            <span className="label-text text-lg">Description</span>
          </label>
          <textarea
            className="textarea textarea-bordered w-full h-48"
            placeholder="Problem Description (Markdown supported)"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
          />
        </div>

        {/* Difficulty Dropdown */}
        <div>
          <label className="label">
            <span className="label-text text-lg">Difficulty</span>
          </label>
          <select
            className="select select-bordered w-full"
            value={formData.difficulty}
            onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
            required
          >
            <option value="">Select difficulty</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>

        {/* Tags - FIX APPLIED HERE */}
        <div>
          <label className="label">
            <span className="label-text text-lg">Tags (one per line)</span>
          </label>
          <textarea
            className="textarea textarea-bordered w-full h-24"
            placeholder="e.g.,
Arrays
Dynamic Programming
Graph"
            value={formData.tags.join('\n')}
            onChange={(e) => {
              const rawInput = e.target.value;
              // IMPORTANT: Do NOT filter out empty strings while typing
              const processedTags = rawInput.split('\n').map(tag => tag.trim());
              setFormData(prev => ({
                ...prev,
                tags: processedTags
              }));
            }}
          />
          <p className="text-sm text-base-content-secondary mt-1">
            Enter each tag on a new line. Tags can now contain commas.
          </p>
        </div>

        {/* Constraints - FIX APPLIED HERE */}
        <div>
          <label className="label">
            <span className="label-text text-lg">Constraints (one per line)</span>
          </label>
          <textarea
            className="textarea textarea-bordered w-full h-24"
            placeholder="e.g.,
1 <= N <= 10^5
-10^9 <= arr[i] <= 10^9"
            value={formData.constraint.join('\n')}
            onChange={(e) => {
              const rawInput = e.target.value;
              // IMPORTANT: Do NOT filter out empty strings while typing
              const processedConstraints = rawInput.split('\n').map(c => c.trim());
              setFormData(prev => ({
                ...prev,
                constraint: processedConstraints
              }));
            }}
          />
          <p className="text-sm text-base-content-secondary mt-1">
            Enter each constraint on a new line. Constraints can now contain commas.
          </p>
        </div>

        <hr className="my-6 border-base-300" />

        {/* Examples Section */}
        <div className="space-y-4">
          <h3 className="font-bold text-xl">Examples (Displayed to User)</h3>
          {formData.examples.map((example, idx) => (
            <div key={idx} className="space-y-2 p-4 border border-base-300 rounded-md bg-base-100 relative">
              <label className="label"><span className="label-text">Example {idx + 1} Input:</span></label>
              <textarea
                placeholder="Input for example"
                className="textarea textarea-bordered w-full h-24"
                value={example.input}
                onChange={(e) => handleExampleChange(idx, 'input', e.target.value)}
                required
              />
              <label className="label"><span className="label-text">Example {idx + 1} Output:</span></label>
              <textarea
                placeholder="Expected output for example"
                className="textarea textarea-bordered w-full h-24"
                value={example.output}
                onChange={(e) => handleExampleChange(idx, 'output', e.target.value)}
                required
              />
              <label className="label"><span className="label-text">Example {idx + 1} Explanation (Optional):</span></label>
              <textarea
                placeholder="Explanation for example"
                className="textarea textarea-bordered w-full h-24"
                value={example.explanation}
                onChange={(e) => handleExampleChange(idx, 'explanation', e.target.value)}
              />
              {formData.examples.length > 1 && (
                <button
                  type="button"
                  className="btn btn-sm btn-error absolute top-2 right-2"
                  onClick={() => removeExample(idx)}
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button type="button" className="btn btn-outline btn-success" onClick={addExample}>
            Add Example
          </button>
        </div>

        <hr className="my-6 border-base-300" />

        {/* Test Cases Section */}
        <div className="space-y-4">
          <h3 className="font-bold text-xl">Test Cases (for Judge0)</h3>
          <p className="text-sm text-base-content-secondary">
            Enter each test case's input and expected output. Check "Hidden" for cases not shown to the user.
          </p>
          {formData.testCases.map((testcase, idx) => (
            <div key={idx} className="space-y-2 p-4 border border-base-300 rounded-md bg-base-100 relative">
              <label className="label"><span className="label-text">Test Case {idx + 1} Input:</span></label>
              <textarea
                placeholder="Input for test case"
                className="textarea textarea-bordered w-full h-24"
                value={testcase.input}
                onChange={(e) => handleTestCaseChange(idx, 'input', e.target.value)}
                required
              />
              <label className="label"><span className="label-text">Test Case {idx + 1} Expected Output:</span></label>
              <textarea
                placeholder="Expected output for test case"
                className="textarea textarea-bordered w-full h-24"
                value={testcase.expectedOutput}
                onChange={(e) => handleTestCaseChange(idx, 'expectedOutput', e.target.value)}
                required
              />
              <div className="form-control">
                <label className="label cursor-pointer">
                  <span className="label-text">Hidden Test Case?</span>
                  <input
                    type="checkbox"
                    className="checkbox checkbox-primary"
                    checked={testcase.isHidden}
                    onChange={(e) => handleTestCaseChange(idx, 'isHidden', e.target.checked)}
                  />
                </label>
              </div>
              {formData.testCases.length > 1 && (
                <button
                  type="button"
                  className="btn btn-sm btn-error absolute top-2 right-2"
                  onClick={() => removeTestCase(idx)}
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button type="button" className="btn btn-outline btn-success" onClick={addTestCase}>
            Add Test Case
          </button>
        </div>

        <hr className="my-6 border-base-300" />

        {/* Limits Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">
              <span className="label-text text-lg">Time Limit (seconds)</span>
            </label>
            <input
              type="number"
              className="input input-bordered w-full"
              value={formData.timeLimit}
              onChange={(e) => setFormData({ ...formData, timeLimit: Number(e.target.value) })}
              min="0.1"
              step="0.1"
              required
            />
          </div>
          <div>
            <label className="label">
              <span className="label-text text-lg">Memory Limit (MB)</span>
            </label>
            <input
              type="number"
              className="input input-bordered w-full"
              value={formData.memoryLimit}
              onChange={(e) => setFormData({ ...formData, memoryLimit: Number(e.target.value) })}
              min="16"
              step="1"
              required
            />
          </div>
        </div>

        <hr className="my-6 border-base-300" />

        <button
          type="submit"
          className="btn btn-primary w-full"
          disabled={isCreating}
        >
          {isCreating ? "Creating..." : "Create Problem"}
        </button>
      </form>
    </div>
  );
};