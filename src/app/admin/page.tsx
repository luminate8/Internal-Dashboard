"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { MessageSquare, Users, Brain, TrendingUp, CheckCircle } from "lucide-react";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface Stats {
  total_conversations: number;
  pending_approvals: number;
  approved_count: number;
  active_users: number;
  accuracy_rate: number;
}

interface GraphStats {
  conversation_trend: { month: string; conversations: number }[];
  user_activity: { day: string; active: number }[];
  approval_status: { name: string; value: number; color: string }[];
  accuracy_trend: { week: string; accuracy: number }[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [graphStats, setGraphStats] = useState<GraphStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getDashboardStats(),
      api.getGraphStats(),
    ]).then(([s, g]) => {
      setStats(s);
      setGraphStats(g);
    }).finally(() => setLoading(false));
  }, []);

  const cards = stats
    ? [
        { label: "Total Conversations", value: stats.total_conversations, icon: MessageSquare, color: "bg-blue-500" },
        { label: "Registered Users", value: stats.active_users, icon: Users, color: "bg-green-500" },
        { label: "Pending Approvals", value: stats.pending_approvals, icon: Brain, color: "bg-yellow-500" },
        { label: "Approved Corrections", value: stats.approved_count, icon: CheckCircle, color: "bg-emerald-500" },
        { label: "Accuracy Rate", value: `${stats.accuracy_rate.toFixed(1)}%`, icon: TrendingUp, color: "bg-indigo-500" },
      ]
    : [];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-6 shadow-sm animate-pulse h-28" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5 gap-4 mb-8">
            {cards.map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="bg-white rounded-xl p-4.5 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{label}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
                  </div>
                  <div className={`${color} p-3 rounded-lg`}>
                    <Icon size={22} className="text-white" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Conversation Trends (Weekly)</h2>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={graphStats?.conversation_trend || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip />
                  <Area type="monotone" dataKey="conversations" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Daily Activity (Last 14 Days)</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={graphStats?.user_activity || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="day" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip />
                  <Bar dataKey="messages" fill="#22c55e" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Approval Status Distribution</h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={graphStats?.approval_status || []} cx="50%" cy="50%" outerRadius={100} dataKey="value" label>
                    {(graphStats?.approval_status || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Accuracy Rate Progress</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={graphStats?.accuracy_trend || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="week" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" domain={[0, 100]} />
                  <Tooltip />
                  <Line type="monotone" dataKey="accuracy" stroke="#6366f1" strokeWidth={3} dot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

