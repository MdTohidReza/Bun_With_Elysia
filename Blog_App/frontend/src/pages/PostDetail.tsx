import { FormEvent, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";

type Comment = {
  id: number;
  content: string;
  createdAt: string;
  author: { id: number; name: string };
};

type Post = {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  authorId: number;
  author: { id: number; name: string };
  category?: { id: number; name: string } | null;
  tags: { id: number; name: string }[];
  comments: Comment[];
};

export default function PostDetail() {
  const { slug } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);
  const [commentText, setCommentText] = useState("");
  const [loading, setLoading] = useState(true);

  function load() {
    api
      .get(`/posts/${slug}`)
      .then((res) => setPost(res.data.data))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  async function handleComment(e: FormEvent) {
    e.preventDefault();
    if (!post) return;
    await api.post(`/posts/${post.id}/comments`, { content: commentText });
    setCommentText("");
    load();
  }

  async function handleDeletePost() {
    if (!post) return;
    if (!confirm("Delete this post?")) return;
    await api.delete(`/posts/${post.id}`);
    navigate("/");
  }

  async function handleDeleteComment(commentId: number) {
    if (!post) return;
    await api.delete(`/posts/${post.id}/comments/${commentId}`);
    load();
  }

  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (!post) return <p className="text-center mt-10">Post not found.</p>;

  const canManagePost = user && (user.id === post.authorId || user.role === "admin");

  return (
    <div className="max-w-2xl mx-auto mt-8">
      <div className="bg-white p-6 rounded-lg border shadow-sm">
        <h1 className="text-2xl font-bold">{post.title}</h1>
        <p className="text-sm text-slate-500 mt-1">
          by {post.author?.name} {post.category && `· in ${post.category.name}`}
        </p>
        <div className="flex gap-2 mt-2">
          {post.tags?.map((t) => (
            <span key={t.id} className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">
              #{t.name}
            </span>
          ))}
        </div>
        <p className="mt-4 whitespace-pre-wrap text-slate-700">{post.content}</p>

        {canManagePost && (
          <button onClick={handleDeletePost} className="mt-4 text-sm text-red-600 hover:underline">
            Delete post
          </button>
        )}
      </div>

      <div className="mt-6">
        <h2 className="font-semibold mb-2">Comments ({post.comments?.length || 0})</h2>

        {user && (
          <form onSubmit={handleComment} className="flex gap-2 mb-4">
            <input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a comment..."
              required
              className="flex-1 border rounded-md px-3 py-2 text-sm"
            />
            <button className="bg-indigo-600 text-white px-4 rounded-md text-sm">Post</button>
          </form>
        )}

        <div className="space-y-3">
          {post.comments?.map((c) => (
            <div key={c.id} className="bg-white p-3 rounded-md border text-sm">
              <div className="flex justify-between">
                <span className="font-medium">{c.author?.name}</span>
                {user && (user.id === c.author?.id || user.role === "admin") && (
                  <button
                    onClick={() => handleDeleteComment(c.id)}
                    className="text-red-600 text-xs hover:underline"
                  >
                    Delete
                  </button>
                )}
              </div>
              <p className="text-slate-600 mt-1">{c.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
