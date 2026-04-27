"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function OnboardingPage() {
  const router = useRouter();
  const [form, setForm] = useState({ ideal_person: "", favourite_celebrity: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!localStorage.getItem("token")) router.push("/login");
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const session = await api.createSession(form);
      localStorage.setItem("session_id", session.id);
      router.push("/chat");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-slate-100 px-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-lg p-8">
        <div className="mb-8 text-center">
          <div className="text-4xl mb-3">✨</div>
          <h1 className="text-2xl font-bold text-gray-900">Personalize your experience</h1>
          <p className="mt-1 text-sm text-gray-500">Help us tailor the assistant to you</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Who is your ideal person? <span className="text-gray-400">(optional)</span>
            </label>
            <Input
              placeholder="e.g. A calm, empathetic therapist"
              value={form.ideal_person}
              onChange={(e) => setForm((f) => ({ ...f, ideal_person: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Favourite celebrity <span className="text-gray-400">(optional)</span>
            </label>
            <Input
              placeholder="e.g. Oprah Winfrey"
              value={form.favourite_celebrity}
              onChange={(e) => setForm((f) => ({ ...f, favourite_celebrity: e.target.value }))}
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" loading={loading} className="w-full cursor-pointer">
            Continue to Chat
          </Button>
          <button
            type="button"
            onClick={async () => {
              setLoading(true);
              try {
                const session = await api.createSession({});
                localStorage.setItem("session_id", session.id);
                router.push("/chat");
              } finally {
                setLoading(false);
              }
            }}
            className="cursor-pointer w-full text-sm text-gray-400 hover:text-gray-600 text-center transition-colors"
          >
            Skip for now
          </button>
        </form>
      </div>
    </div>
  );
}
