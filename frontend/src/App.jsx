import {Routes, Route,Navigate} from "react-router-dom";
import {HomePage} from "./pages/HomePage";
import {LoginPage} from "./pages/LoginPage";
import {SignupPage} from "./pages/SignupPage.jsx";
import {ProfilePage} from "./pages/ProfilePage";
import {ProblemsPage} from "./pages/ProblemsPage";
import useAuthStore from "./store/useAuthStore.js";
import { useEffect } from "react";
import { Navbar } from "./components/Navbar.jsx";
import {Loader} from "lucide-react";
import useThemeStore from "./store/useThemeStore.js";
import SettingsPage from "./pages/SettingsPage.jsx";
import ShowProblemsPage from "./pages/ShowProblemsPage.jsx";
import ProblemDetailPage from "./pages/ProblemDetailPage.jsx";
import CodeEditorPanel from "./pages/CodeEditorPanel.jsx"; // Assuming this is a page, not just a panel
import ShowPostsPage from "./pages/ShowPostsPage.jsx";
import CreatePostPage from "./pages/CreatePostPage.jsx";
import PostDetailPage from "./pages/PostDetailPage.jsx";

const App = () => {
  window.authStore = useAuthStore;
  const {authUser,checkAuth,isCheckingAuth}=useAuthStore();
  const {theme}=useThemeStore();

  useEffect(()=>{
    checkAuth();
  },[checkAuth]);

  console.log({authUser});

  if(isCheckingAuth && !authUser)return(
    <div className="flex items-center justify-center h-screen">
      <Loader className="size-10 animate-spin"/>
    </div>
  )

  return (
      <div data-theme={theme}>
        <Navbar />
        <Routes key={authUser ? 'auth' : 'guest'}>
          <Route path="/" element={authUser ? <ShowProblemsPage /> : <Navigate to="/login" />} />
          <Route path="/signup" element={!authUser ? <SignupPage /> : <Navigate to="/" />} />
          <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to="/" />} />
          <Route path="/profile" element={authUser ? <ProfilePage /> : <Navigate to="/login" />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/admin/problems" element={authUser ? <ProblemsPage /> : <Navigate to="/login" />} />
          <Route path="/problems" element={authUser ? <ShowProblemsPage /> : <Navigate to="/login" />} />
          <Route path="/problems/:id" element={authUser ? <ProblemDetailPage/> : <Navigate to="/login" />} />
          <Route path="/test" element={<CodeEditorPanel/>}/> 
          <Route path="/posts" element={<ShowPostsPage />} />
          <Route path="/create-post" element={<CreatePostPage />} />
          <Route path="/posts/:id" element={<PostDetailPage />} />
        </Routes>
      </div>
  )
}

export default App;