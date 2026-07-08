import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";

type Post = {
  id: number;
  title: string;
  slug: string;
  content: string;
  createdAt: string;
  author: { id: number; name: string };
  category?: { id: number; name: string } | null;
  tags: { id: number; name: string }[];
};

export default function Posts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/posts")
      .then((res) => setPosts(res.data.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-center mt-10">Loading posts...</p>;

  return (
    <div className="max-w-2xl mx-auto mt-8 space-y-4">
      <h1 className="text-2xl font-bold">Latest posts</h1>
      {posts.length === 0 && <p className="text-slate-500">No posts yet. Be the first to write one!</p>}
      {posts.map((post) => (
        <Link
          key={post.id}
          to={`/posts/${post.slug}`}
          className="block bg-white p-4 rounded-lg border shadow-sm hover:shadow-md transition"
        >
          <h2 className="font-semibold text-lg">{post.title}</h2>
          <p className="text-sm text-slate-500 mt-1">
            by {post.author?.name} {post.category && `· in ${post.category.name}`}
          </p>
          <p className="text-slate-600 mt-2 line-clamp-2">{post.content}</p>
          <div className="flex gap-2 mt-2">
            {post.tags?.map((t) => (
              <span key={t.id} className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">
                #{t.name}
              </span>
            ))}
          </div>
        </Link>
      ))}
    </div>
  );
}
