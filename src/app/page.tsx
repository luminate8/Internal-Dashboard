"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    const token = localStorage.getItem("token");
    const sessionId = localStorage.getItem("session_id");
    if (token) {
      router.push(sessionId ? "/chat" : "/onboarding");
    } else {
      router.push("/login");
    }
  }, [router]);
  return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-400">Loading...</p></div>;
}
