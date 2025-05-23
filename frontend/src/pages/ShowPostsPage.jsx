// frontend/src/pages/ShowPostsPage.jsx
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import usePostStore from '../store/usePostStore';

const ShowPostsPage = () => {
  const fetchPosts = usePostStore((s) => s.fetchPosts);
  const posts = usePostStore((s) => s.posts);
  const isLoading = usePostStore((s) => s.isLoading);
  const error = usePostStore((s) => s.error);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl text-primary">
        Loading posts...
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

  return (
    <div className="min-h-screen bg-base-200 p-6 pt-16">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-bold text-primary">Community Posts</h1>
          <Link to="/create-post" className="btn btn-primary">
            Create New Post
          </Link>
        </div>

        {posts.length === 0 ? (
          <p className="text-center text-base-content text-lg">No posts yet. Be the first to create one!</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <div key={post._id} className="card bg-base-100 shadow-xl border border-base-300">
                <div className="card-body">
                  <h2 className="card-title text-2xl text-accent-content mb-2">{post.title}</h2>
                  <p className="text-base-content line-clamp-3">{post.content}</p>
                  <div className="text-sm text-gray-500 mt-3">
                    Posted by **{post.createdBy ? post.createdBy.username : 'Anonymous'}** {/* <--- CHANGED HERE */}
                    <br />
                    on {new Date(post.createdAt).toLocaleDateString()}
                  </div>
                  <div className="card-actions justify-end mt-4">
                    <button className="btn btn-sm btn-ghost">
                      👍 {post.upvotedBy?.length || 0}
                    </button>
                    <button className="btn btn-sm btn-ghost">
                      👎 {post.downvotedBy?.length || 0}
                    </button>
                    <Link to={`/posts/${post._id}`} className="btn btn-sm btn-info">
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ShowPostsPage;