// frontend/src/pages/PostDetailPage.jsx
import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom'; // Import Link if not already
import usePostStore from '../store/usePostStore';
import useAuthStore from '../store/useAuthStore';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:5001/api';

const PostDetailPage = () => {
  const { id: postId } = useParams();
  const { authUser } = useAuthStore();
  // Destructure isFetchingDetails instead of isLoading for more specific loading state
  const { getPostById, isFetchingDetails, error } = usePostStore();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newCommentContent, setNewCommentContent] = useState('');
  const socketRef = useRef(null);

  useEffect(() => {
    const fetchPostAndConnectSocket = async () => {
      // Set a local loading state if usePostStore's isFetchingDetails isn't granular enough
      // Or just rely on isFetchingDetails directly from the store
      const data = await getPostById(postId); // This will set isFetchingDetails in usePostStore
      if (data) {
        setPost(data.post);
        setComments(data.comments);
      }

      // Initialize Socket.IO connection
      // Ensure the URL matches your backend Socket.IO server (without /api)
      socketRef.current = io(API_BASE_URL.replace('/api', ''), {
        withCredentials: true, // Necessary for cookies to be sent
      });

      // Join the room for this specific post
      socketRef.current.emit('joinPostRoom', postId); // Tell backend to add this socket to the post's room

      // Listen for new comments
      socketRef.current.on('newComment', (comment) => {
        console.log('Received new comment:', comment);
        // Add the new comment to the state
        setComments((prevComments) => [...prevComments, comment]);
        toast.success("New comment received!");
      });

      // Handle socket disconnection
      socketRef.current.on('disconnect', () => {
        console.log('Socket disconnected');
      });

      // Clean up socket on component unmount
      return () => {
        if (socketRef.current) {
          socketRef.current.emit('leavePostRoom', postId); // Tell backend to remove this socket from the post's room
          socketRef.current.disconnect();
          socketRef.current = null;
        }
      };
    };

    fetchPostAndConnectSocket();
  }, [postId, getPostById]); // Dependencies: Re-run if postId changes or getPostById (though it's a stable function)


const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!authUser) {
      toast.error('You must be logged in to comment.');
      return;
    }
    if (!newCommentContent.trim()) {
      toast.error('Comment cannot be empty.');
      return;
    }

    try {
      const response = await usePostStore.getState().createCommentApi(newCommentContent, postId);
      if (response) {
        setNewCommentContent('');
      }
    } catch (err) {
      console.error('Error submitting comment:', err);
      toast.error('Failed to submit comment.');
    }
};


  // Use isFetchingDetails from the store for the loading state specific to this page
  if (isFetchingDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl text-primary">
        Loading post details...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl text-error">
        Error: {error}
      </div>
    );
  }

  if (!post) {
    // This case would typically be hit if the post was not found (e.g., 404 from API)
    return (
      <div className="min-h-screen flex items-center justify-center text-xl text-base-content">
        Post not found.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200 p-6 pt-20"> {/* Adjusted padding-top for fixed navbar */}
      <div className="max-w-4xl mx-auto">
        {/* Post Details */}
        <div className="card bg-base-100 shadow-xl border border-base-300 mb-8">
          <div className="card-body">
            <h1 className="card-title text-4xl text-accent-content mb-4">{post.title}</h1>
            <p className="text-base-content text-lg mb-4">{post.content}</p>
            <div className="text-sm text-gray-500">
              Posted by: {post.createdBy ? post.createdBy.username : 'Anonymous'} on {new Date(post.createdAt).toLocaleDateString()}
            </div>
            {/* Add Upvote/Downvote buttons for post if you have them */}
          </div>
        </div>

        {/* Comments Section */}
        <div className="card bg-base-100 shadow-xl border border-base-300">
          <div className="card-body">
            <h2 className="text-3xl font-bold text-primary mb-4">Comments</h2>

            {/* Comment Submission Form */}
            {authUser ? (
              <form onSubmit={handleCommentSubmit} className="mb-6">
                <textarea
                  className="textarea textarea-bordered w-full resize-none mb-2"
                  placeholder="Add your comment..."
                  value={newCommentContent}
                  onChange={(e) => setNewCommentContent(e.target.value)}
                  rows="3"
                ></textarea>
                <button type="submit" className="btn btn-primary">
                  Submit Comment
                </button>
              </form>
            ) : (
              <p className="text-center text-base-content mb-4">
                <Link to="/login" className="link link-primary">Log in</Link> to post a comment.
              </p>
            )}

            {/* Display Comments */}
            <div className="space-y-4">
              {comments.length === 0 ? (
                <p className="text-base-content text-center">No comments yet. Be the first!</p>
              ) : (
                comments.map((comment) => (
                  <div key={comment._id} className="bg-base-200 p-4 rounded-lg border border-base-300">
                    <p className="text-base-content">{comment.content}</p>
                    <div className="text-xs text-gray-500 mt-2">
                      Comment by: {comment.author ? comment.author.username : 'Anonymous'} on {new Date(comment.createdAt).toLocaleDateString()}
                    </div>
                    {/* Add comment upvote/downvote if needed */}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostDetailPage;