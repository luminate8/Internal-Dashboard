"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { ShieldCheck, User } from "lucide-react";

interface UserRow {
  id: string;
  email: string;
  is_verified: boolean;
  is_admin: boolean;
  created_at: string;
  session_count: number;
  message_count: number;
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getUsers().then((res) => setUsers(res.users)).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Users</h1>
        <span className="text-sm text-gray-500">{users.length} total users</span>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading...</div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center text-gray-400">No users found.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100 bg-gray-50">
              <tr>
                <th className="text-left px-6 py-3 text-gray-500 font-medium">#</th>
                <th className="text-left px-6 py-3 text-gray-500 font-medium">Email</th>
                <th className="text-left px-6 py-3 text-gray-500 font-medium">Role</th>
                <th className="text-left px-6 py-3 text-gray-500 font-medium">Messages</th>
                <th className="text-left px-6 py-3 text-gray-500 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map((u, i) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3 text-gray-400">{i + 1}</td>
                  <td className="px-6 py-3 text-gray-800 flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center">
                      <User size={13} className="text-indigo-500" />
                    </div>
                    {u.email}
                  </td>
                  <td className="px-6 py-3">
                    {u.is_admin ? (
                      <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-medium">
                        <ShieldCheck size={11} /> Admin
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                        User
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-3 text-gray-600">{u.message_count}</td>
                  <td className="px-6 py-3 text-gray-500">{new Date(u.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
