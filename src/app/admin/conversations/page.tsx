"use client";
import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { ChevronDown, ChevronRight } from "lucide-react";

interface Message { role: string; content: string; created_at: string; }
interface Conversation {
  session_id: string;
  user_email: string;
  message_count: number;
  started_at: string;
  last_active: string;
  messages: Message[];
}

export default function ConversationsPage() {
  const [convs, setConvs] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    api.getAllConversations()
      .then((res) => setConvs(res.conversations as any))
      .finally(() => setLoading(false));
  }, []);

  function toggle(id: string) {
    setExpanded((e) => ({ ...e, [id]: !e[id] }));
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Conversations</h1>
        <span className="text-sm text-gray-500">{convs.length} conversations</span>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading...</div>
        ) : convs.length === 0 ? (
          <div className="p-8 text-center text-gray-400">No conversations found.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100 bg-gray-50">
              <tr>
                <th className="w-8 px-4 py-3" />
                <th className="text-left px-4 py-3 text-gray-500 font-medium">User</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Messages</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Last Active</th>
              </tr>
            </thead>
            <tbody>
              {convs.map((c) => (
                <React.Fragment key={c.session_id}>
                  <tr
                    onClick={() => toggle(c.session_id)}
                    className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer"
                  >
                    <td className="px-4 py-3 text-gray-400">
                      {expanded[c.session_id] ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                    </td>
                    <td className="px-4 py-3 text-gray-800">{c.user_email}</td>
                    <td className="px-4 py-3 text-gray-500">{c.message_count}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{new Date(c.last_active).toLocaleString()}</td>
                  </tr>

                  {expanded[c.session_id] && (
                    <tr key={`${c.session_id}-expanded`}>
                      <td colSpan={4} className="bg-gray-200 px-6 py-4 border-b border-gray-100">
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                          {(typeof c.messages === "string" ? JSON.parse(c.messages) : c.messages).map((m: Message, i: number) => (
                            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                              <div className={`max-w-[75%] rounded-xl px-3 py-2 text-xs leading-relaxed ${
                                m.role === "user"
                                  ? "bg-indigo-600 text-white"
                                  : "bg-white border border-gray-200 text-gray-700"
                              }`}>
                                {m.content}
                              </div>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
