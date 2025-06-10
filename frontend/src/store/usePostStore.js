// frontend/src/store/usePostStore.js
import { create } from 'zustand';
import toast from 'react-hot-toast';
import { axiosInstance } from '../libs/axios';

const usePostStore = create((set) => ({
  posts: [],
  isLoading: false,
  isCreating: false,
  error: null,
  // New state for single post details
  selectedPost: null,
  selectedPostComments: [],
  isFetchingDetails: false,


  fetchPosts: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.get("/posts", {
        withCredentials: true,
      });
      set({ posts: response.data, isLoading: false });
    } catch (error) {
      console.error("Error fetching posts:", error);
      const message = error?.response?.data?.message || "Failed to fetch posts.";
      set({ error: message, isLoading: false });
      toast.error(message);
    }
  },

  createPost: async (title, content) => {
    set({ isCreating: true, error: null });
    try {
      console.log("reached store-post")
      const response = await axiosInstance.post(
        "/posts/create-post",
        { title, content },
        { withCredentials: true }
      );
      set((state) => ({
        posts: [response.data, ...state.posts],
        isCreating: false,
      }));
      toast.success("Post created successfully!");
      return true;
    } catch (error) {
      console.error("Error creating post:", error);
      const message = error?.response?.data?.message || "Failed to create post.";
      set({ error: message, isCreating: false });
      toast.error(message);
      return false;
    }
  },

  // New action to fetch a single post and its comments
  getPostById: async (postId) => {
    set({ isFetchingDetails: true, error: null });
    try {
      const response = await axiosInstance.get(`/posts/${postId}`, {
        withCredentials: true,
      });
      // Assuming backend returns { post: {}, comments: [] }
      set({
        selectedPost: response.data.post,
        selectedPostComments: response.data.comments,
        isFetchingDetails: false,
      });
      return response.data; // Return data for direct use in component
    } catch (error) {
      console.error(`Error fetching post ${postId}:`, error);
      const message = error?.response?.data?.message || "Failed to fetch post details.";
      set({ error: message, isFetchingDetails: false });
      toast.error(message);
      return null;
    }
  },

  // Action to send comments (moved to be standalone, as it's not updating store's main 'comments' array directly)
  // The Socket.IO listener will update the comments array on the PostDetailPage
  createCommentApi: async (content, postId) => {
    try {
        const response = await axiosInstance.post(
            `/posts/${postId}/comments`, // Match backend route
            { content },
            { withCredentials: true }
        );
        toast.success("Comment submitted!");
        return response.data; // Return the new comment
    } catch (error) {
        console.error("Error submitting comment:", error);
        const message = error?.response?.data?.message || "Failed to submit comment.";
        toast.error(message);
        throw error; // Re-throw to be caught by the component
    }
  }
}));

export default usePostStore;