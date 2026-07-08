import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";

type Category = { id: number; name: string };
type Tag = { id: number; name: string };

export default function CreatePost() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [published, setPublished] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.get("/categories").then((res) => setCategories(res.data.data));
    api.get("/tags").then((res) => setTags(res.data.data));
  }, []);

  function toggleTag(id: number) {
    setSelectedTags((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const res = await api.post("/posts", {
        title,
        content,
        published,
        categoryId: categoryId ? Number(categoryId) : undefined,
        tagIds: selectedTags,
      });
      navigate(`/posts/${res.data.data.slug}`);
    } catch (err: any) {
      setError(err.response?.data?.message || "Could not create post");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto mt-8 bg-white p-6 rounded-lg border shadow-sm">
      <h1 className="text-xl font-bold mb-4">Write a new post</h1>
      {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full border rounded-md px-3 py-2 text-sm"
        />
        <textarea
          placeholder="Write your content here..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          rows={8}
          className="w-full border rounded-md px-3 py-2 text-sm"
        />

        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="w-full border rounded-md px-3 py-2 text-sm"
        >
          <option value="">No category</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <div>
          <p className="text-sm font-medium mb-1">Tags</p>
          <div className="flex flex-wrap gap-2">
            {tags.map((t) => (
              <button
                type="button"
                key={t.id}
                onClick={() => toggleTag(t.id)}
                className={`text-xs px-3 py-1 rounded-full border ${
                  selectedTags.includes(t.id)
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "bg-white text-slate-600"
                }`}
              >
                #{t.name}
              </button>
            ))}
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} />
          Publish immediately
        </label>

        <button
          disabled={busy}
          className="w-full bg-indigo-600 text-white rounded-md py-2 text-sm hover:bg-indigo-700 disabled:opacity-50"
        >
          {busy ? "Publishing..." : "Publish post"}
        </button>
      </form>
    </div>
  );
}
