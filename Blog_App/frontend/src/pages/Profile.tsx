import { FormEvent, useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/client";

type ProfileData = {
  id: number;
  name: string;
  email: string;
  role: string;
  profile: { bio: string | null; avatarUrl: string | null; phone: string | null } | null;
  posts: { id: number; title: string; slug: string }[];
};

export default function Profile() {
  const { user } = useAuth();
  const [data, setData] = useState<ProfileData | null>(null);
  const [bio, setBio] = useState("");
  const [phone, setPhone] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!user) return;
    api.get(`/users/${user.id}`).then((res) => {
      setData(res.data.data);
      setBio(res.data.data.profile?.bio || "");
      setPhone(res.data.data.profile?.phone || "");
    });
  }, [user]);

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    await api.patch("/users/me/profile", { bio, phone });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (!data) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="max-w-2xl mx-auto mt-8 space-y-6">
      <div className="bg-white p-6 rounded-lg border shadow-sm">
        <h1 className="text-xl font-bold">{data.name}</h1>
        <p className="text-sm text-slate-500">{data.email} · {data.role}</p>

        <form onSubmit={handleSave} className="mt-4 space-y-3">
          <textarea
            placeholder="Bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full border rounded-md px-3 py-2 text-sm"
            rows={3}
          />
          <input
            placeholder="Phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full border rounded-md px-3 py-2 text-sm"
          />
          <button className="bg-indigo-600 text-white rounded-md px-4 py-2 text-sm">
            Save profile
          </button>
          {saved && <span className="text-green-600 text-sm ml-2">Saved!</span>}
        </form>
      </div>

      <div>
        <h2 className="font-semibold mb-2">My posts</h2>
        <div className="space-y-2">
          {data.posts.map((p) => (
            <a key={p.id} href={`/posts/${p.slug}`} className="block bg-white p-3 rounded-md border text-sm">
              {p.title}
            </a>
          ))}
          {data.posts.length === 0 && <p className="text-slate-500 text-sm">No posts yet.</p>}
        </div>
      </div>
    </div>
  );
}
