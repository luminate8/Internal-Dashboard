"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Check, X, Edit2 } from "lucide-react";

interface QueueItem {
  id: string;
  question: string;
  ai_answer: string;
  feedback: string;
  suggested_answer: string;
  status: string;
  created_at: string;
}

export default function LearningQueuePage() {
  const [items, setItems] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("pending");
  const [editId, setEditId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [acting, setActing] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    api.getLearningQueue(status).then(setItems).finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, [status]);

  async function approve(id: string, edited?: string) {
    setActing(id);
    await api.approveItem(id, edited).catch(() => {});
    setEditId(null);
    setActing(null);
    load();
  }

  async function reject(id: string) {
    setActing(id);
    await api.rejectItem(id).catch(() => {});
    setActing(null);
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Learning Queue</h1>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
        >
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading...</div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-100">
          <p className="text-gray-500">No {status} items in the queue.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase mb-1">Question</p>
                  <p className="text-sm text-gray-800">{item.question}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase mb-1">AI Answer</p>
                  <p className="text-sm text-gray-600 line-clamp-3">{item.ai_answer}</p>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-xs font-medium text-gray-400 uppercase mb-1">Suggested Answer</p>
                {editId === item.id ? (
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="w-full border border-indigo-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    rows={3}
                  />
                ) : (
                  <p className="text-sm text-gray-700">{item.suggested_answer || <span className="text-gray-400 italic">None provided</span>}</p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                  item.feedback === "positive" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
                }`}>
                  {item.feedback === "positive" ? "👍 Helpful" : "👎 Not helpful"}
                </span>

                {status === "pending" && (
                  <div className="flex gap-2">
                    {editId === item.id ? (
                      <>
                        <Button variant="primary" loading={acting === item.id} onClick={() => approve(item.id, editText)} className="text-xs py-1.5">
                          <Check size={14} className="mr-1" /> Approve Edited
                        </Button>
                        <Button variant="outline" onClick={() => setEditId(null)} className="text-xs py-1.5">Cancel</Button>
                      </>
                    ) : (
                      <>
                        <Button variant="outline" onClick={() => { setEditId(item.id); setEditText(item.suggested_answer || ""); }} className="text-xs py-1.5">
                          <Edit2 size={14} className="mr-1" /> Edit
                        </Button>
                        <Button variant="primary" loading={acting === item.id} onClick={() => approve(item.id)} className="text-xs py-1.5">
                          <Check size={14} className="mr-1" /> Approve
                        </Button>
                        <Button variant="danger" loading={acting === item.id} onClick={() => reject(item.id)} className="text-xs py-1.5">
                          <X size={14} className="mr-1" /> Reject
                        </Button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
