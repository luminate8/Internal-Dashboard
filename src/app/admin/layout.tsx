"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard, BookOpen, MessageSquare, Brain, Users, LogOut, Menu, X
} from "lucide-react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/knowledge", label: "Knowledge Base", icon: BookOpen },
  { href: "/admin/conversations", label: "Conversations", icon: MessageSquare },
  { href: "/admin/learning", label: "Learning Queue", icon: Brain },
  { href: "/admin/users", label: "Users", icon: Users },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/login"); return; }
    // Decode JWT to check is_admin
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      if (!payload.is_admin) router.push("/chat");
    } catch {
      router.push("/login");
    }
  }, [router]);

  function logout() {
    localStorage.removeItem("token");
    router.push("/login");
  }

  const Sidebar = () => (
    <div className="flex flex-col h-full bg-gray-900 text-white w-64">
      <div className="px-6 py-5 border-b border-gray-700">
        <h1 className="font-bold text-lg">LMN8 Admin</h1>
        <p className="text-xs text-gray-400 mt-0.5">Ketamine Therapy System</p>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            onClick={() => setOpen(false)}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
              pathname === href ? "bg-indigo-600 text-white" : "text-gray-300 hover:bg-gray-800"
            }`}
          >
            <Icon size={18} />
            {label}
          </Link>
        ))}
      </nav>
      <div className="px-3 py-4 border-t border-gray-700">
        <button onClick={logout} className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-gray-800 w-full">
          <LogOut size={18} /> Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop sidebar */}
      <div className="hidden md:flex flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile sidebar */}
      {open && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="flex-shrink-0"><Sidebar /></div>
          <div className="flex-1 bg-black/50" onClick={() => setOpen(false)} />
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile header */}
        <div className="md:hidden bg-gray-900 text-white px-4 py-3 flex items-center gap-3">
          <button onClick={() => setOpen(true)}><Menu size={20} /></button>
          <span className="font-semibold">LMN8 Admin</span>
        </div>
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
