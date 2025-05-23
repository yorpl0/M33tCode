import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import usePostStore from '../store/usePostStore';
import toast from 'react-hot-toast';

const CreatePostPage = () => {
  const navigate = useNavigate();
  const createPost = usePostStore((s) => s.createPost);
  const isCreating = usePostStore((s) => s.isCreating);
  const error = usePostStore((s) => s.error); // Though toast is handled by store, good to have

  const [postData, setPostData] = useState({
    title: '',
    content: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPostData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!postData.title.trim() || !postData.content.trim()) {
      toast.error("Title and content cannot be empty.");
      return;
    }

    const success = await createPost(postData.title, postData.content);
    if (success) {
      navigate('/posts'); // Navigate to the posts list after successful creation
    }
  };

  return (
    <div className="min-h-screen bg-base-200 p-6 pt-16 flex items-center justify-center">
      <div className="w-full max-w-2xl bg-base-100 shadow-lg p-8 rounded-xl">
        <h1 className="text-3xl font-bold text-center text-primary mb-6">Create New Post</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-base-content mb-1">
              Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={postData.title}
              onChange={handleChange}
              className="input input-bordered w-full"
              placeholder="Enter post title"
              disabled={isCreating}
            />
          </div>
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-base-content mb-1">
              Content
            </label>
            <textarea
              id="content"
              name="content"
              value={postData.content}
              onChange={handleChange}
              className="textarea textarea-bordered w-full h-40"
              placeholder="Write your post content here..."
              disabled={isCreating}
            ></textarea>
          </div>
          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={isCreating}
          >
            {isCreating ? 'Creating Post...' : 'Create Post'}
          </button>
          {error && <p className="text-error text-center mt-2">{error}</p>}
        </form>
      </div>
    </div>
  );
};

export default CreatePostPage;