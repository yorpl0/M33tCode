import React, { useEffect } from "react";
import useProblemStore from "../store/useProblemStore";
import { Link } from 'react-router-dom';
const ShowProblemsPage = () => {
  const fetchProblems = useProblemStore((s) => s.fetchProblems);
  const problems = useProblemStore((s) => s.problems);
  const isLoading = useProblemStore((s) => s.isLoading);

  useEffect(() => {
    fetchProblems();
  }, [fetchProblems]);

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-3xl font-semibold mb-6">Problem List</h1>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <div className="border rounded-md overflow-hidden shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b text-gray-700 font-medium">
              <tr>
                <th className="py-3 px-4">SN</th>
                <th className="py-3 px-4">Title</th>
                <th className="py-3 px-4">Difficulty</th>
                <th className="py-3 px-4">Category</th>
              </tr>
            </thead>
            <tbody>
              {problems.map((problem, index) => (

                <tr
                  key={problem._id || index}
                  className="hover:bg-gray-100 transition"
                >
                  <td className="py-2 px-4 text-green-500">{index+1}</td>
                  <td className="py-2 px-4"> {/* Removed text-blue-600 hover:underline cursor-pointer from td */}
                    <Link 
                        to={`/problems/${problem._id}`} 
                        className="text-blue-600 hover:underline cursor-pointer"
                    >
                        {problem.title}
                    </Link>
                </td>

                  <td className="py-2 px-4">
                    <span
                      className={`font-medium ${
                        problem.difficulty === "Easy"
                          ? "text-green-600"
                          : problem.difficulty === "Medium"
                          ? "text-yellow-600"
                          : "text-red-600"
                      }`}
                    >
                      {problem.difficulty}
                    </span>
                  </td>
                  <td className="py-2 px-4 text-gray-700">{problem.tags}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ShowProblemsPage;
