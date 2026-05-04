import { useEffect, useState } from "react";
import { getAdminAnalytics, getUsers, getMentorApplications } from "../../services/db";
import { Users, UserCheck, BookOpen, DollarSign, TrendingUp, AlertTriangle, ChevronRight } from "lucide-react";
import { useLocation } from "wouter";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

const NAVY = "#0A1628";
const SAFFRON = "#FF6B00";
const GOLD = "#F5A623";
const TEAL = "#1A7F8E";
const COLORS = [SAFFRON, TEAL, GOLD, "#7c3aed", "#16a34a"];

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const [analytics, setAnalytics] = useState<any>(null);
  const [pendingApplications, setPendingApplications] = useState(0);
  const [topStudents, setTopStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [ana, apps, users] = await Promise.all([getAdminAnalytics(), getMentorApplications(), getUsers()]);
      setAnalytics(ana);
      setPendingApplications(apps.filter((a: any) => a.status === "pending").length);
      const students = users.filter((u: any) => u.role === "student")
        .sort((a: any, b: any) => (a.rank ?? 99) - (b.rank ?? 99)).slice(0, 5);
      setTopStudents(students);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 lg:grid-cols-6 gap-4">{Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}</div>
      <div className="grid lg:grid-cols-2 gap-5">{Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-64 rounded-2xl" />)}</div>
    </div>
  );

  const metrics = [
    { icon: Users, label: "Total Students", val: analytics?.totalStudents ?? "—", color: NAVY },
    { icon: UserCheck, label: "Total Mentors", val: analytics?.totalMentors ?? "—", color: TEAL },
    { icon: BookOpen, label: "Active Enrollments", val: analytics?.activeEnrollments ?? "—", color: SAFFRON },
    { icon: DollarSign, label: "Monthly Revenue", val: analytics?.monthlyRevenue ? `₹${(analytics.monthlyRevenue / 1000).toFixed(0)}k` : "—", color: GOLD },
    { icon: TrendingUp, label: "Avg Weekly Score", val: analytics?.avgWeeklyScore ?? "—", color: "#7c3aed" },
    { icon: AlertTriangle, label: "Dropout Risk", val: analytics?.dropoutRiskPercent ? `${analytics.dropoutRiskPercent}%` : "—", color: "#dc2626" },
  ];

  const growthData = analytics?.userGrowth ?? [];
  const enrollmentData = analytics?.courseEnrollments ?? [];
  const scoreDistData = analytics?.scoreDistribution ?? [];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: NAVY, fontFamily: "Inter, sans-serif" }}>Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">IGen LMS platform overview</p>
        </div>
        {pendingApplications > 0 && (
          <button onClick={() => setLocation("/admin/mentors")} data-testid="alert-pending-applications"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold"
            style={{ background: "#dc2626" }}>
            <AlertTriangle className="w-4 h-4" />
            {pendingApplications} Pending Applications
          </button>
        )}
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <div key={m.label} data-testid={`metric-${m.label.toLowerCase().replace(/\s/g, "-")}`}
              className="bg-white rounded-2xl border border-border p-4">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3" style={{ background: `${m.color}18` }}>
                <Icon className="w-4 h-4" style={{ color: m.color }} />
              </div>
              <p className="text-xl font-bold" style={{ color: NAVY, fontFamily: "Inter, sans-serif" }}>{m.val}</p>
              <p className="text-xs text-muted-foreground mt-0.5 leading-tight">{m.label}</p>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-5">
        {/* User Growth */}
        <div className="bg-white rounded-2xl border border-border p-5">
          <h2 className="font-bold text-sm mb-5" style={{ color: NAVY, fontFamily: "Inter, sans-serif" }}>Student Growth (6 Months)</h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={growthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "12px" }} />
              <Line type="monotone" dataKey="students" stroke={SAFFRON} strokeWidth={2.5} dot={{ fill: SAFFRON, r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Enrollments by Course */}
        <div className="bg-white rounded-2xl border border-border p-5">
          <h2 className="font-bold text-sm mb-5" style={{ color: NAVY, fontFamily: "Inter, sans-serif" }}>Enrollments by Course</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={enrollmentData} barSize={24}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="course" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "12px" }} />
              <Bar dataKey="count" fill={NAVY} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Score Distribution + Top Students */}
      <div className="grid lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl border border-border p-5">
          <h2 className="font-bold text-sm mb-5" style={{ color: NAVY, fontFamily: "Inter, sans-serif" }}>Score Distribution</h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={scoreDistData} cx="50%" cy="50%" innerRadius={60} outerRadius={90}
                dataKey="count" nameKey="range" paddingAngle={3}>
                {scoreDistData.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "12px" }} />
              <Legend formatter={(v) => <span style={{ fontSize: "11px", color: "#6b7280" }}>{v}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-sm" style={{ color: NAVY, fontFamily: "Inter, sans-serif" }}>Top Students</h2>
            <button onClick={() => setLocation("/admin/students")} data-testid="link-all-students"
              className="text-xs font-semibold flex items-center gap-1" style={{ color: SAFFRON }}>
              All <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="space-y-2">
            {topStudents.map((s, i) => (
              <div key={s.id} data-testid={`row-top-student-${s.id}`}
                className="flex items-center gap-3 p-2.5 rounded-xl border border-border">
                <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                  style={{ background: i === 0 ? GOLD : i === 1 ? "#C0C0C0" : i === 2 ? "#CD7F32" : "#e5e7eb", color: i < 3 ? "white" : "#374151" }}>
                  {i + 1}
                </span>
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                  style={{ background: NAVY }}>{s.name?.charAt(0)}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold truncate" style={{ color: NAVY }}>{s.name}</p>
                  <p className="text-xs text-muted-foreground">{s.city} · W{s.currentWeek}</p>
                </div>
                <p className="text-xs font-bold flex-shrink-0" style={{ color: TEAL }}>{s.totalScore}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
