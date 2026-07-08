import { useEffect, useState } from "react";
import { api } from "../api/client";

type UserRow = {
  id: number;
  name: string;
  email: string;
  role: string;
  profile: { bio: string | null } | null;
};

export default function AdminUsers() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);

  function load() {
    api.get("/users").then((res) => setUsers(res.data.data)).finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleDelete(id: number) {
    if (!confirm("Delete this user?")) return;
    await api.delete(`/users/${id}`);
    load();
  }

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="max-w-2xl mx-auto mt-8">
      <h1 className="text-xl font-bold mb-4">All users (admin)</h1>
      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-left">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Role</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t">
                <td className="p-3">{u.name}</td>
                <td className="p-3">{u.email}</td>
                <td className="p-3">{u.role}</td>
                <td className="p-3 text-right">
                  {u.role !== "admin" && (
                    <button onClick={() => handleDelete(u.id)} className="text-red-600 hover:underline">
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
