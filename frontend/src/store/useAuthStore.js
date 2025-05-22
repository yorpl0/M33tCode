import { create } from "zustand";
import { persist } from "zustand/middleware";
import { axiosInstance } from "../libs/axios";
import toast from "react-hot-toast";

const useAuthStore = create(
  persist(
    (set) => ({
      authUser: null,
      isSigningUp: false,
      isLoggingIn: false,
      isUpdatingProfile: false,
      isCheckingAuth: true,

      checkAuth: async () => {
        try {
          
          const res = await axiosInstance.get("/auth/check");
          set({ authUser: res.data });
        } catch (error) {
          console.log("Error in checkAuth:", error);
          set({ authUser: null });
        } finally {
          set({ isCheckingAuth: false });
        }
      },

      signup: async (data) => {
        set({ isSigningUp: true });
        try {
          const res = await axiosInstance.post("/auth/signup", data);
          set({ authUser: res.data });
          toast.success("Account created successfully");
        } catch (error) {
          const message =
            error?.response?.data?.message || "Something went wrong. Please try again.";
          toast.error(message);
        } finally {
          set({ isSigningUp: false });
        }
      },

      login: async (data) => {
        set({ isLoggingIn: true });
        try {
          const res = await axiosInstance.post("/auth/login", data);
          set({ authUser: res.data });
          toast.success("You have been logged in");
        } catch (error) {
          const message =
            error?.response?.data?.message || "Something went wrong, Please try again.";
          toast.error(message);
        } finally {
          set({ isLoggingIn: false });
        }
      },

      logout: async () => {
        try {
          await axiosInstance.post("/auth/logout");
          set({ authUser: null });
          toast.success("Logged out successfully");
        } catch (error) {
          console.log("Error in logging out FE", error);
          toast.error("Logout failed.");
        }
      },

      updateProfile: async (data) => {
        set({ isUpdatingProfile: true });
        try {
          const res = await axiosInstance.put("/auth/update-profile", data);
           set({ authUser: res.data });
          toast.success("Profile updated successfully");
        } catch (error) {
          console.log("Error in update profile:", error);
          toast.error(error?.response?.data?.message || "Update failed");
        } finally {
          set({ isUpdatingProfile: false });
        }
      },
    }),
    {
      name: "auth-storage", // key in localStorage
      partialize: (state) => ({ authUser: state.authUser }), // only persist authUser
    }
  )
);

export default useAuthStore;
