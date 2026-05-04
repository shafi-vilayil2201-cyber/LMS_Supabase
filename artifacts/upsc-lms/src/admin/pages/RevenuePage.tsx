import { useEffect, useState } from "react";
import { getAdminAnalytics } from "../../services/db";
import { DollarSign, TrendingUp, Users, BookOpen } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

const NAVY = "#0A1628";
const SAFFRON = "#FF6B00";
const GOLD = "#F5A623";
const TEAL = "#1A7F8E";

export default function RevenuePage() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminAnalytics().then((a) => { setAnalytics(a); setLoading(false); });
  }, []);

  if (loading) return (
    <div className="space-y-5">
      <div className="grid grid-cols-4 gap-4">{Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}</div>
      <div className="grid lg:grid-cols-2 gap-5"><Skeleton className="h-64 rounded-2xl" /><Skeleton className="h-64 rounded-2xl" /></div>
    </div>
  );

  const revenueData = analytics?.monthlyRevenueData ?? [];
  const courseRevenue = analytics?.courseRevenue ?? [];
  const monthlyRevenue = analytics?.monthlyRevenue ?? 0;
  const annualRevenue = monthlyRevenue * 12;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: NAVY, fontFamily: "Inter, sans-serif" }}>Revenue</h1>
        <p className="text-sm text-muted-foreground mt-1">Platform revenue breakdown and subscription analytics</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: DollarSign, label: "Monthly Revenue", val: `₹${(monthlyRevenue / 1000).toFixed(0)}k`, color: SAFFRON },
          { icon: TrendingUp, label: "Annual Run Rate", val: `₹${(annualRevenue / 100000).toFixed(1)}L`, color: GOLD },
          { icon: Users, label: "Active Subscriptions", val: analytics?.activeEnrollments ?? "—", color: TEAL },
          { icon: BookOpen, label: "Avg Revenue/Student", val: analytics?.totalStudents ? `₹${Math.round(monthlyRevenue / analytics.totalStudents).toLocaleString()}` : "—", color: NAVY },
        ].map((m) => {
          const Icon = m.icon;
          return (
            <div key={m.label} data-testid={`metric-${m.label.toLowerCase().replace(/\s/g, "-")}`}
              className="bg-white rounded-2xl border border-border p-5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: `${m.color}18` }}>
                <Icon className="w-5 h-5" style={{ color: m.color }} />
              </div>
              <p className="text-2xl font-bold" style={{ color: NAVY, fontFamily: "Inter, sans-serif" }}>{m.val}</p>
              <p className="text-xs text-muted-foreground mt-1">{m.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        {/* Monthly Revenue Trend */}
        <div className="bg-white rounded-2xl border border-border p-5">
          <h2 className="font-bold text-sm mb-5" style={{ color: NAVY, fontFamily: "Inter, sans-serif" }}>Monthly Revenue (6 Months)</h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v: any) => [`₹${(v / 1000).toFixed(0)}k`, "Revenue"]} contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "12px" }} />
              <Line type="monotone" dataKey="revenue" stroke={SAFFRON} strokeWidth={2.5} dot={{ fill: SAFFRON, r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue by Course */}
        <div className="bg-white rounded-2xl border border-border p-5">
          <h2 className="font-bold text-sm mb-5" style={{ color: NAVY, fontFamily: "Inter, sans-serif" }}>Revenue by Course</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={courseRevenue} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v: any) => [`₹${(v / 1000).toFixed(0)}k`, "Revenue"]} contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "12px" }} />
              <Bar dataKey="revenue" radius={[6, 6, 0, 0]}>
                {courseRevenue.map((_: any, i: number) => (
                  <Cell key={i} fill={[NAVY, SAFFRON, TEAL, GOLD][i % 4]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Course Revenue Breakdown Table */}
      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        <div className="px-5 py-4 border-b border-border" style={{ background: `${NAVY}05` }}>
          <h2 className="font-bold text-sm" style={{ color: NAVY, fontFamily: "Inter, sans-serif" }}>Revenue Breakdown by Course</h2>
        </div>
        <table className="w-full" data-testid="table-revenue-breakdown">
          <thead className="border-b border-border">
            <tr>
              {["Course", "Price", "Enrollments", "Revenue", "% of Total"].map((h) => (
                <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {courseRevenue.map((row: any, i: number) => {
              const pct = revenueData.length ? ((row.revenue / courseRevenue.reduce((a: number, r: any) => a + r.revenue, 0)) * 100).toFixed(1) : "0";
              return (
                <tr key={row.name} className="hover:bg-muted/20 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ background: [NAVY, SAFFRON, TEAL, GOLD][i % 4] }} />
                      <span className="text-sm font-medium" style={{ color: NAVY }}>{row.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-sm text-muted-foreground">₹{row.price?.toLocaleString("en-IN") ?? "—"}</td>
                  <td className="px-5 py-3 text-sm font-semibold" style={{ color: NAVY }}>{row.enrollments}</td>
                  <td className="px-5 py-3 text-sm font-bold" style={{ color: TEAL }}>₹{(row.revenue / 1000).toFixed(0)}k</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden max-w-20">
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: [NAVY, SAFFRON, TEAL, GOLD][i % 4] }} />
                      </div>
                      <span className="text-xs text-muted-foreground">{pct}%</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
