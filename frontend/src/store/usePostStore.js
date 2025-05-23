import { create } from 'zustand';// Or your configured axiosInstance if you have one
import toast from 'react-hot-toast'; // For showing feedback
import { axiosInstance } from '../libs/axios';

// Assuming your backend URL is defined somewhere, e.g., in a config file
const API_BASE_URL ='http://localhost:5001/api';

const usePostStore = create((set) => ({
  posts: [],
  isLoading: false,
  isCreating: false,
  error: null,
  fetchPosts: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.get("/posts", {
        withCredentials: true, // Important for sending cookies/JWT
      });
      set({ posts: response.data, isLoading: false });
    } catch (error) {
      console.error("Error fetching posts:", error);
      const message = error?.response?.data?.message || "Failed to fetch posts.";
      set({ error: message, isLoading: false });
      toast.error(message);
    }
  },

  // Action to create a new post
  createPost: async (title, content) => {
    set({ isCreating: true, error: null });
    try {
        console.log("reached store-post")
      const response = await axiosInstance.post(
        "/posts/create-post", // Your backend route for creating posts
        { title, content },
        {
          withCredentials: true, // Important for sending cookies/JWT
        }
      );
      set((state) => ({
        posts: [response.data, ...state.posts], // Add new post to the top
        isCreating: false,
      }));
      toast.success("Post created successfully!");
      return true; // Indicate success
    } catch (error) {
      console.error("Error creating post:", error);
      const message = error?.response?.data?.message || "Failed to create post.";
      set({ error: message, isCreating: false });
      toast.error(message);
      return false; // Indicate failure
    }
  },

  // Add more post-related actions here (e.g., upvote, downvote, fetch single post, delete)
}));

export default usePostStore;