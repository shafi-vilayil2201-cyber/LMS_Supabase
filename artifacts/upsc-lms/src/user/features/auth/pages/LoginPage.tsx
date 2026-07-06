import { useState } from "react";
import { useLocation } from "wouter";
import { useAuthStore } from "@/user/features/auth/store/authStore";
import { GraduationCap, Eye, EyeOff, LogIn, Mail, Users } from "lucide-react";
import { supabase } from "@/shared/lib/supabaseClient";

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const { login, currentUser } = useAuthStore();
  const [role, setRole] = useState<"student" | "mentor">("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState("");

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

  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault();
    setResetError("");
    setResetLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/login`,
      });
      if (error) {
        setResetError(error.message);
      } else {
        setResetSent(true);
      }
    } catch {
      setResetError("Failed to send reset email");
    }
    setResetLoading(false);
  }

  return (
    <div className="min-h-screen flex" style={{ background: "#0A1628" }}>
      <div className="flex-1 hidden lg:flex flex-col justify-center px-16">
        <div className="max-w-md">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6" style={{ background: "#009E2C" }}>
            {role === "student" ? (
              <GraduationCap className="w-8 h-8 text-white" />
            ) : (
              <Users className="w-8 h-8 text-white" />
            )}
          </div>
          <h1 className="text-4xl font-bold text-white mb-4 leading-tight">
            {role === "student" ? (
              <>
                Your UPSC Journey,<br />
                <span style={{ color: "#009E2C" }}>Starts Here.</span>
              </>
            ) : (
              <>
                Empower Aspirants,<br />
                <span style={{ color: "#009E2C" }}>Shape Future Leaders.</span>
              </>
            )}
          </h1>
          <p className="text-white/60 text-lg leading-relaxed">
            {role === "student" ? (
              "Track daily habits, compete on leaderboards, and get mentored by IAS officers — all in one disciplined ecosystem."
            ) : (
              "Guide the next generation of civil servants. Manage structured review sessions, grade answers, and mentor candidates to success."
            )}
          </p>
          <div className="mt-10 grid grid-cols-3 gap-4">
            {role === "student"
              ? [
                  { n: "24,500+", l: "Aspirants" },
                  { n: "87%", l: "Pass Rate" },
                  { n: "48+", l: "Mentors" },
                ].map((s) => (
                  <div key={s.l} className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.05)" }}>
                    <p className="text-2xl font-bold" style={{ color: "#009E2C" }}>{s.n}</p>
                    <p className="text-white/50 text-sm mt-1">{s.l}</p>
                  </div>
                ))
              : [
                  { n: "48+", l: "Active Mentors" },
                  { n: "350+", l: "Mock Reviews" },
                  { n: "1-on-1", l: "Personalized Guidance" },
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

            {showForgot ? (
              // ── Forgot Password Form ─────────────────────────────────────
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-1">Reset Password</h2>
                <p className="text-muted-foreground text-sm mb-7">Enter your email to receive a password reset link</p>

                {resetSent ? (
                  <div className="text-center py-6">
                    <div className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: "#22c55e20" }}>
                      <Mail className="w-7 h-7" style={{ color: "#22c55e" }} />
                    </div>
                    <p className="font-semibold text-foreground">Reset email sent!</p>
                    <p className="text-sm text-muted-foreground mt-1">Check your inbox for the password reset link.</p>
                    <button
                      onClick={() => { setShowForgot(false); setResetSent(false); setResetEmail(""); }}
                      className="mt-4 text-sm font-semibold hover:underline"
                      style={{ color: "#009E2C" }}
                    >
                      Back to Sign In
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleForgotPassword} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
                      <input
                        type="email"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        placeholder="you@example.com"
                        required
                        data-testid="input-reset-email"
                        className="w-full px-4 py-2.5 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-background"
                      />
                    </div>

                    {resetError && (
                      <div className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">
                        {resetError}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={resetLoading}
                      data-testid="button-reset-submit"
                      className="w-full py-2.5 rounded-lg text-white font-semibold text-sm flex items-center justify-center gap-2 transition-opacity disabled:opacity-60"
                      style={{ background: "#009E2C" }}
                    >
                      <Mail className="w-4 h-4" />
                      {resetLoading ? "Sending..." : "Send Reset Link"}
                    </button>

                    <button
                      type="button"
                      onClick={() => { setShowForgot(false); setResetError(""); }}
                      className="w-full text-center text-sm font-semibold hover:underline"
                      style={{ color: "#009E2C" }}
                    >
                      Back to Sign In
                    </button>
                  </form>
                )}
              </div>
            ) : (
              // ── Login Form ───────────────────────────────────────────────
              <div>
                {/* Dynamic Header */}
                <h2 className="text-2xl font-bold text-foreground mb-1">
                  {role === "student" ? "Welcome back" : "Mentor Sign In"}
                </h2>
                <p className="text-muted-foreground text-sm mb-6">
                  {role === "student" ? "Sign in to continue your preparation" : "Sign in to guide future civil servants"}
                </p>

                {/* Role Switcher */}
                <div className="flex bg-slate-100 p-1.5 rounded-xl mb-6 relative border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setRole("student")}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-lg transition-all ${
                      role === "student"
                        ? "bg-white text-slate-900 shadow-sm border border-slate-200/50"
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    <GraduationCap className="w-4 h-4" />
                    Student
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole("mentor")}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-lg transition-all ${
                      role === "mentor"
                        ? "bg-white text-slate-900 shadow-sm border border-slate-200/50"
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    <LogIn className="w-4 h-4" />
                    Mentor
                  </button>
                </div>

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
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-sm font-medium text-foreground">Password</label>
                      <button
                        type="button"
                        onClick={() => setShowForgot(true)}
                        className="text-xs font-medium hover:underline"
                        style={{ color: "#009E2C" }}
                        data-testid="link-forgot-password"
                      >
                        Forgot password?
                      </button>
                    </div>
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

                <p className="text-center text-sm text-muted-foreground mt-6">
                  Don't have an account?{" "}
                  <button onClick={() => setLocation("/register")} className="font-semibold hover:underline" style={{ color: "#009E2C" }}>
                    Register
                  </button>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
