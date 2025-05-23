import { create } from "zustand";
import { axiosInstance } from "../libs/axios";
import toast from "react-hot-toast";

const useProblemStore = create((set) => ({
  problems: [],
  isLoading: false,
  problem: null,
  isCreating: false,
  // === START: NEW STATE FOR SUBMISSION ===
  isSubmitting: false,
  submissionResult: null, // To store the result of the last submission
  // === END: NEW STATE FOR SUBMISSION ===

  createProblem: async (data) => {
    console.log("reached problem store:");
    set({ isCreating: true });
    try {
      const res = await axiosInstance.post("/auth/admin/problems", data);
      set({ problem: res.data });
      toast.success("Problem has been created");
    } catch (error) {
      console.error("Error creating problem:", error);
      const message =
        error?.response?.data?.message || "Something went wrong, Please try again.";
      toast.error(message);
    } finally {
      set({ isCreating: false });
    }
  },

  fetchProblems: async () => {
    set({ isLoading: true });
    try {
      const res = await axiosInstance.get("/auth/admin/problems");
      set({ problems: res.data });
    } catch (e) {
      console.error("Error in fetching problems", e);
      toast.error("Failed to fetch problems.");
    } finally {
      set({ isLoading: false });
    }
  },

  fetchProblem: async (id) => {
    console.log("calling store with:",id);
    set({ isLoading: true });
    try {
      const res = await axiosInstance.get(`/auth/problems/${id}`);
      set({ problem: res.data });
    } catch (error) {
      console.error("Error in fetching problem", error);
      toast.error("Failed to fetch problem.");
    } finally {
      set({ isLoading: false });
    }
  },

  // === START: NEW SUBMISSION ACTION ===
  submitSolution: async (problemId, language, code) => {
    console.log("reached problem store: submitSolution");
    set({ isSubmitting: true, submissionResult: null }); // Reset previous result
    try {
      const res = await axiosInstance.post(`/problems/${problemId}/submit`, {
        language,
        code,
      });
      set({ submissionResult: res.data });
      // You can refine the success message based on the verdict received from backend
      toast.success(res.data.message || "Code submitted successfully!");
      console.log("Submission result:", res.data);
    } catch (error) {
      console.error("Error submitting solution:", error);
      const message =
        error?.response?.data?.message || "Failed to submit code. Please try again.";
      toast.error(message);
      // Store a simplified error verdict if the API call fails
      set({ submissionResult: { verdict: 'Failed', details: message } });
    } finally {
      set({ isSubmitting: false });
    }
  },
}));

export default useProblemStore;