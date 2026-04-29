"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Send, ThumbsUp, ThumbsDown, LogOut } from "lucide-react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";

interface Message {
  role: "user" | "assistant";
  content: string;
  sources?: string[];
}

function parseThinking(content: string): { thinking: string | null; response: string } {
  const thinkingMatch = content.match(/^Thinking:\s*\n([\s\S]*?)\n\n([\s\S]*)$/);
  if (thinkingMatch) {
    return { thinking: thinkingMatch[1].trim(), response: thinkingMatch[2].trim() };
  }
  return { thinking: null, response: content };
}

export default function ChatPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [feedbackGiven, setFeedbackGiven] = useState<Record<number, string>>(() => {
    if (typeof window === "undefined") return {};
    try { return JSON.parse(localStorage.getItem("feedbackGiven") || "{}"); } catch { return {}; }
  });
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/login"); return; }

    // Fetch session from server so history works across devices
    api.getMySession().then((res) => {
      if (!res.session_id) { router.push("/onboarding"); return null; }
      localStorage.setItem("session_id", res.session_id);
      setSessionId(res.session_id);
      return api.getHistory(res.session_id);
    }).then((res) => {
      if (res) setMessages(res.history.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })));
    }).catch((err) => {
      console.error("Failed to load session/history:", err);
    });
  }, [router]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || !sessionId) return;
    const userMsg = input.trim();
    setInput("");
    setMessages((m) => [...m, { role: "user", content: userMsg }]);
    setLoading(true);
    try {
      const res = await api.chat(sessionId, userMsg);
      setMessages((m) => [...m, { role: "assistant", content: res.response, sources: res.sources }]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "Sorry, something went wrong. Please try again." }]);
    } finally {
      setLoading(false);
    }
  }

  async function giveFeedback(idx: number, type: "positive" | "negative") {
    const aiMsg = messages[idx];
    const userMsg = messages[idx - 1];
    if (!aiMsg || !userMsg || feedbackGiven[idx]) return;
    setFeedbackGiven((f) => {
      const updated = { ...f, [idx]: type };
      localStorage.setItem("feedbackGiven", JSON.stringify(updated));
      return updated;
    });
    await api.submitFeedback({
      question: userMsg.content,
      ai_answer: aiMsg.content,
      feedback: type,
    }).catch(() => {});
  }

  function logout() {
    localStorage.removeItem("token");
    router.push("/login");
  }

  return (
    <div className="flex flex-col h-screen bg-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">K</div>
          <div>
            <h1 className="font-semibold text-gray-900 text-sm">LMN8 Ketamine Assistant</h1>
            <p className="text-xs text-green-500 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" /> Online
            </p>
          </div>
        </div>
        <button onClick={logout} className="cursor-pointer text-gray-400 hover:text-gray-600 flex items-center gap-1.5 text-sm transition-colors">
          <LogOut size={16} /> Sign out
        </button>
      </header>

      {/* Messages — constrained width */}
      <div className="flex-1 overflow-y-auto py-6 px-4">
        <div className="max-w-2xl mx-auto space-y-5">
          {messages.length === 0 && (
            <div className="text-center mt-16">
              <div className="text-5xl mb-4">💊</div>
              <h2 className="text-xl font-semibold text-gray-700">Welcome to LMN8</h2>
              <p className="text-gray-400 mt-2 text-sm max-w-sm mx-auto">
                Ask me anything about ketamine therapy. I only answer based on verified medical documents.
              </p>
            </div>
          )}

          {messages.map((msg, i) => {
            const { thinking, response } = msg.role === "assistant" ? parseThinking(msg.content) : { thinking: null, response: msg.content };
            
            return (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className="max-w-[80%]">
                  {/* Thinking section - only for assistant */}
                  {thinking && (
                    <div className="mb-2 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 italic">
                      <div className="font-semibold text-slate-700 mb-1">Thinking:</div>
                      {thinking}
                    </div>
                  )}
                  
                  {/* Main message */}
                  <div
                    className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-indigo-600 text-white rounded-br-none"
                        : "bg-white text-gray-800 shadow-sm border border-gray-100 rounded-bl-none prose prose-sm max-w-none"
                    }`}
                  >
                    {msg.role === "assistant" ? (
                      <ReactMarkdown
                        components={{
                          h3: ({ children }) => <h3 className="text-base font-semibold mt-4 mb-2 text-gray-900">{children}</h3>,
                          h2: ({ children }) => <h2 className="text-lg font-semibold mt-4 mb-2 text-gray-900">{children}</h2>,
                          p: ({ children }) => <p className="mb-3 text-gray-800">{children}</p>,
                          ul: ({ children }) => <ul className="list-disc pl-5 mb-3 space-y-1">{children}</ul>,
                          ol: ({ children }) => <ol className="list-decimal pl-5 mb-3 space-y-1">{children}</ol>,
                          li: ({ children }) => <li className="text-gray-800">{children}</li>,
                          strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
                        }}
                      >
                        {response}
                      </ReactMarkdown>
                    ) : (
                      msg.content
                    )}
                  </div>

                  {msg.role === "assistant" && (
                    <div className="flex gap-2 mt-2 px-1">
                      <button
                        onClick={() => giveFeedback(i, "positive")}
                        disabled={!!feedbackGiven[i]}
                        className={`cursor-pointer flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-all ${
                          feedbackGiven[i] === "positive"
                            ? "bg-emerald-500 border-emerald-500 text-white"
                            : feedbackGiven[i]
                            ? "opacity-40 border-gray-200 text-gray-400 cursor-not-allowed"
                            : "border-gray-300 text-gray-500 hover:border-emerald-400 hover:text-emerald-600 hover:bg-emerald-50"
                        }`}
                      >
                        <ThumbsUp size={12} /> Helpful
                      </button>
                      <button
                        onClick={() => giveFeedback(i, "negative")}
                        disabled={!!feedbackGiven[i]}
                        className={`cursor-pointer flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-all ${
                          feedbackGiven[i] === "negative"
                            ? "bg-rose-500 border-rose-500 text-white"
                            : feedbackGiven[i]
                            ? "opacity-40 border-gray-200 text-gray-400 cursor-not-allowed"
                            : "border-gray-300 text-gray-500 hover:border-rose-400 hover:text-rose-600 hover:bg-rose-50"
                        }`}
                      >
                        <ThumbsDown size={12} /> Not helpful
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-100 shadow-sm rounded-2xl rounded-bl-none px-4 py-3">
                <div className="flex gap-1 items-center">
                  <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-200 px-4 py-3">
        <div className="max-w-2xl mx-auto">
          <form onSubmit={sendMessage} className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about ketamine therapy..."
              className="flex-1 rounded-full border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="cursor-pointer w-10 h-10 rounded-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center text-white transition-colors"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
