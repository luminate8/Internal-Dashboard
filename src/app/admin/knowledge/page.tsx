"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { FileUpload } from "@/components/ui/file-upload";
import { Trash2, FileText, Download, AlertTriangle, RefreshCw } from "lucide-react";

export default function KnowledgePage() {
  const [docs, setDocs] = useState<{ id: string; filename: string }[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [reindexing, setReindexing] = useState(false);
  const [reindexMsg, setReindexMsg] = useState<string | null>(null);

  async function loadDocs() {
    try {
      const res = await api.getDocuments("");
      setDocs(res.documents);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadDocs(); }, []);

  async function handleUpload(files: File[]) {
    if (!files.length) return;
    setUploading(true);
    try {
      await api.uploadDocument(files[0]);
      await loadDocs();
    } finally {
      setUploading(false);
    }
  }

  async function confirmDelete() {
    if (!confirmId) return;
    await api.deleteDocument(confirmId);
    setDocs((d) => d.filter((doc) => doc.id !== confirmId));
    setConfirmId(null);
  }

  async function handleReindex() {
    setReindexing(true);
    setReindexMsg(null);
    try {
      const res = await api.reindexDocuments();
      setReindexMsg(res.message);
    } catch {
      setReindexMsg("Re-index failed. Please try again.");
    } finally {
      setReindexing(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Knowledge Base</h1>
        {/* Re-index button hidden for now */}
      </div>

      {reindexMsg && (
        <div className="mb-4 px-4 py-2.5 rounded-lg bg-indigo-50 border border-indigo-200 text-sm text-indigo-700">
          {reindexMsg}
        </div>
      )}

      <div className="mb-6">
        <FileUpload onChange={handleUpload} />
        {uploading && <p className="text-sm text-indigo-500 mt-2 text-center">Uploading...</p>}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading...</div>
        ) : docs.length === 0 ? (
          <div className="p-12 text-center">
            <FileText size={40} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">No documents uploaded yet.</p>
            <p className="text-sm text-gray-400 mt-1">Upload PDF, DOCX, or TXT files to build the knowledge base.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-3 text-gray-500 font-medium">Filename</th>
                <th className="text-right px-6 py-3 text-gray-500 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {docs.map((doc) => (
                <tr key={doc.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 flex items-center gap-2 text-gray-800">
                    <FileText size={16} className="text-indigo-400" /> {doc.filename}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => api.downloadDocument(doc.id)} className="text-indigo-400 hover:text-indigo-600 cursor-pointer mr-3">
                      <Download size={16} />
                    </button>
                    <button onClick={() => setConfirmId(doc.id)} className="text-red-400 hover:text-red-600 cursor-pointer">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {confirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-100">
                <AlertTriangle size={20} className="text-red-500" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Delete Document</h2>
            </div>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to delete{" "}
              <span className="font-medium text-gray-800">
                {docs.find((d) => d.id === confirmId)?.filename}
              </span>
              ? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setConfirmId(null)} className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer">
                Cancel
              </button>
              <button onClick={confirmDelete} className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors cursor-pointer">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
