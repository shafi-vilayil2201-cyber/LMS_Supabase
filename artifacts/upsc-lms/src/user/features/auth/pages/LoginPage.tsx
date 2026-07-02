import { useState } from "react";
import { useLocation } from "wouter";
import { useAuthStore } from "@/user/features/auth/store/authStore";
import { GraduationCap, Eye, EyeOff, LogIn } from "lucide-react";

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const { login, currentUser } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (currentUser) {
    if (currentUser.role === "admin") setLocation("/admin");
    else if (currentUser.role === "mentor") setLocation("/mentor");
    else setLocation("/dashboard");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (result.success) {
      const user = useAuthStore.getState().currentUser;
      if (user?.role === "admin") setLocation("/admin");
      else if (user?.role === "mentor") setLocation("/mentor");
      else setLocation("/dashboard");
    } else {
      setError(result.error ?? "Login failed");
    }
  }

  const demos = [
    { role: "Student", email: "student@upsc.com", pw: "password123" },
    { role: "Mentor", email: "mentor@upsc.com", pw: "password123" },
    { role: "Admin", email: "admin@igen.com", pw: "admin123" },
  ];

  return (
    <div className="min-h-screen flex" style={{ background: "#0A1628" }}>
      <div className="flex-1 hidden lg:flex flex-col justify-center px-16">
        <div className="max-w-md">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6" style={{ background: "#009E2C" }}>
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4 leading-tight">
            Your UPSC Journey,<br />
            <span style={{ color: "#009E2C" }}>Starts Here.</span>
          </h1>
          <p className="text-white/60 text-lg leading-relaxed">
            Track daily habits, compete on leaderboards, and get mentored by IAS officers — all in one disciplined ecosystem.
          </p>
          <div className="mt-10 grid grid-cols-3 gap-4">
            {[
              { n: "24,500+", l: "Aspirants" },
              { n: "87%", l: "Pass Rate" },
              { n: "48+", l: "Mentors" },
            ].map((s) => (
              <div key={s.l} className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.05)" }}>
                <p className="text-2xl font-bold" style={{ color: "#009E2C" }}>{s.n}</p>
                <p className="text-white/50 text-sm mt-1">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="flex items-center gap-3 mb-6 lg:hidden">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "#009E2C" }}>
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-foreground text-lg">IGen LMS</span>
            </div>

            <h2 className="text-2xl font-bold text-foreground mb-1">Welcome back</h2>
            <p className="text-muted-foreground text-sm mb-7">Sign in to continue your preparation</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  data-testid="input-email"
                  className="w-full px-4 py-2.5 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-background"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPw ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    data-testid="input-password"
                    className="w-full px-4 py-2.5 pr-10 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-background"
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg" data-testid="text-error">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                data-testid="button-submit"
                className="w-full py-2.5 rounded-lg text-white font-semibold text-sm flex items-center justify-center gap-2 transition-opacity disabled:opacity-60"
                style={{ background: "#009E2C" }}
              >
                <LogIn className="w-4 h-4" />
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            <div className="mt-6 rounded-xl p-4 border border-border" style={{ background: "#F8F9FA" }}>
              <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wide">Demo Credentials</p>
              <div className="space-y-2">
                {demos.map((d) => (
                  <button
                    key={d.role}
                    data-testid={`button-demo-${d.role.toLowerCase()}`}
                    onClick={() => { setEmail(d.email); setPassword(d.pw); }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-muted transition-colors"
                  >
                    <span className="inline-block w-16 text-xs font-semibold" style={{ color: "#009E2C" }}>{d.role}</span>
                    <span className="text-xs text-muted-foreground">{d.email}</span>
                  </button>
                ))}
              </div>
            </div>

            <p className="text-center text-sm text-muted-foreground mt-6">
              Don't have an account?{" "}
              <button onClick={() => setLocation("/register")} className="font-semibold hover:underline" style={{ color: "#009E2C" }}>
                Register
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
