import { useState } from "react";
import { useLocation } from "wouter";
import { GraduationCap, ArrowRight, CheckCircle, AlertCircle, Users, Check } from "lucide-react";
import { useAuthStore } from "@/user/features/auth/store/authStore";

const SUBJECTS_LIST = [
  "History",
  "Geography",
  "Polity",
  "Economy",
  "Environment",
  "Science",
  "Ethics",
  "CSAT"
];

export default function RegisterPage() {
  const [, setLocation] = useLocation();
  const { signUp } = useAuthStore();
  const [role, setRole] = useState<"student" | "mentor">("student");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
    qualification: "",
    experience: "",
    teachingMode: "online",
    password: "",
    confirm: ""
  });
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function toggleSubject(subject: string) {
    if (selectedSubjects.includes(subject)) {
      setSelectedSubjects(selectedSubjects.filter((s) => s !== subject));
    } else {
      setSelectedSubjects([...selectedSubjects, subject]);
    }
  }

  function validatePassword(pw: string): string | null {
    if (pw.length < 8) return "Password must be at least 8 characters";
    if (!/[A-Z]/.test(pw)) return "Password must contain at least one uppercase letter";
    if (!/[a-z]/.test(pw)) return "Password must contain at least one lowercase letter";
    if (!/[0-9]/.test(pw)) return "Password must contain at least one number";
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirm) {
      setError("Passwords do not match");
      return;
    }

    const pwError = validatePassword(form.password);
    if (pwError) {
      setError(pwError);
      return;
    }

    if (role === "mentor" && selectedSubjects.length === 0) {
      setError("Please select at least one subject to teach.");
      return;
    }

    setLoading(true);
    try {
      let profilePayload: any = {
        name: form.name,
        role: role,
        phone: form.phone,
        city: form.city,
        joinedAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      };

      if (role === "student") {
        profilePayload = {
          ...profilePayload,
          targetYear: 2025,
          studyStreak: 0,
          totalScore: 0.0,
          rank: null as unknown as number,
          badges: [],
          enrolledCourses: [],
          currentWeek: 1,
          currentMonth: 1
        };
      } else {
        profilePayload = {
          ...profilePayload,
          expertise: selectedSubjects,
          qualification: form.qualification,
          experience: form.experience,
          teachingMode: form.teachingMode,
          approvalStatus: "pending",
          rating: 0.0,
          totalReviews: 0,
          totalSessions: 0,
          studentsGuided: 0,
          availability: []
        };
      }

      const result = await signUp(form.email, form.password, profilePayload);

      if (result.success) {
        setSubmitted(true);
      } else {
        setError(result.error ?? "Registration failed");
      }
    } catch (err: any) {
      setError(err.message || "Failed to create account.");
    }
    setLoading(false);
  }

  const passwordStrength = (() => {
    const pw = form.password;
    if (!pw) return null;
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[a-z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    if (score <= 2) return { label: "Weak", color: "#ef4444", width: "33%" };
    if (score <= 3) return { label: "Fair", color: "#f59e0b", width: "60%" };
    return { label: "Strong", color: "#22c55e", width: "100%" };
  })();

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: "#0A1628" }}>
      <div className="w-full max-w-lg">
        <div className="bg-white rounded-2xl shadow-2xl p-8 my-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "#009E2C" }}>
              {role === "student" ? (
                <GraduationCap className="w-5 h-5 text-white" />
              ) : (
                <Users className="w-5 h-5 text-white" />
              )}
            </div>
            <span className="font-bold text-foreground text-lg">
              {role === "student" ? "Create Student Account" : "Apply as a Mentor"}
            </span>
          </div>

          {/* Role Toggle Switcher */}
          <div className="flex bg-slate-100 p-1.5 rounded-xl mb-6 relative border border-slate-200">
            <button
              type="button"
              onClick={() => { setRole("student"); setError(""); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-lg transition-all ${
                role === "student"
                  ? "bg-white text-slate-900 shadow-sm border border-slate-200/50"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              Student Registration
            </button>
            <button
              type="button"
              onClick={() => { setRole("mentor"); setError(""); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-lg transition-all ${
                role === "mentor"
                  ? "bg-white text-slate-900 shadow-sm border border-slate-200/50"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <Users className="w-4 h-4" />
              Mentor Application
            </button>
          </div>

          {submitted ? (
            <div className="text-center py-8">
              <div className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: "#22c55e20" }}>
                <CheckCircle className="w-7 h-7" style={{ color: "#22c55e" }} />
              </div>
              <p className="font-semibold text-foreground">
                {role === "student" ? "Account created successfully!" : "Application submitted successfully!"}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {role === "student"
                  ? "Check your email to verify your account, then sign in."
                  : "Check your email to verify your account. Admin will review your application soon."}
              </p>
              <button
                onClick={() => setLocation("/login")}
                className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-white text-sm font-semibold transition-opacity hover:opacity-90"
                style={{ background: "#009E2C" }}
                data-testid="button-go-login"
              >
                <ArrowRight className="w-4 h-4" />
                Go to Sign In
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Common Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5 font-sans">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Arjun Sharma"
                    required
                    data-testid="input-name"
                    className="w-full px-4 py-2.5 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-background"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5 font-sans">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    required
                    data-testid="input-email"
                    className="w-full px-4 py-2.5 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-background"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5 font-sans">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="+91 9876543210"
                    required
                    data-testid="input-phone"
                    className="w-full px-4 py-2.5 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-background"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5 font-sans">City</label>
                  <input
                    type="text"
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    placeholder="Delhi"
                    required
                    data-testid="input-city"
                    className="w-full px-4 py-2.5 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-background"
                  />
                </div>
              </div>

              {/* Mentor-Specific Fields */}
              {role === "mentor" && (
                <div className="space-y-4 border-t border-dashed border-slate-200 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5 font-sans">Qualification</label>
                      <input
                        type="text"
                        name="qualification"
                        value={form.qualification}
                        onChange={handleChange}
                        placeholder="PhD Economics, Former IAS"
                        required
                        data-testid="input-qualification"
                        className="w-full px-4 py-2.5 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-background"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5 font-sans">Experience</label>
                      <input
                        type="text"
                        name="experience"
                        value={form.experience}
                        onChange={handleChange}
                        placeholder="5 years mentoring"
                        required
                        data-testid="input-experience"
                        className="w-full px-4 py-2.5 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-background"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5 font-sans">Teaching Mode</label>
                    <select
                      name="teachingMode"
                      value={form.teachingMode}
                      onChange={handleChange}
                      data-testid="select-teaching-mode"
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-background"
                    >
                      <option value="online">Online Sessions Only</option>
                      <option value="offline">Offline / In-Person Only</option>
                      <option value="both">Both Online & Offline</option>
                    </select>
                  </div>

                  {/* Subjects pill selector */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2 font-sans">
                      Subjects you can mentor
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {SUBJECTS_LIST.map((subj) => {
                        const isSelected = selectedSubjects.includes(subj);
                        return (
                          <button
                            type="button"
                            key={subj}
                            onClick={() => toggleSubject(subj)}
                            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                              isSelected
                                ? "bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm"
                                : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3" />}
                            {subj}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Password Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-dashed border-slate-200 pt-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5 font-sans">Password</label>
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                    data-testid="input-password"
                    className="w-full px-4 py-2.5 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-background"
                  />
                  {passwordStrength && (
                    <div className="mt-2">
                      <div className="h-1 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{ width: passwordStrength.width, background: passwordStrength.color }}
                        />
                      </div>
                      <p className="text-[10px] mt-1 font-semibold" style={{ color: passwordStrength.color }}>
                        {passwordStrength.label} Strength
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5 font-sans">Confirm Password</label>
                  <input
                    type="password"
                    name="confirm"
                    value={form.confirm}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                    data-testid="input-confirm"
                    className="w-full px-4 py-2.5 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-background"
                  />
                </div>
              </div>

              {/* Password requirements hint */}
              <div className="text-[11px] text-muted-foreground grid grid-cols-2 gap-x-4 gap-y-1 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                {[
                  { check: form.password.length >= 8, text: "Min 8 characters" },
                  { check: /[A-Z]/.test(form.password), text: "One uppercase letter" },
                  { check: /[a-z]/.test(form.password), text: "One lowercase letter" },
                  { check: /[0-9]/.test(form.password), text: "One number" },
                ].map((req) => (
                  <div key={req.text} className="flex items-center gap-1.5">
                    {form.password ? (
                      req.check ? (
                        <CheckCircle className="w-3 h-3 text-emerald-500" />
                      ) : (
                        <AlertCircle className="w-3 h-3 text-slate-300" />
                      )
                    ) : (
                      <div className="w-3 h-3 rounded-full border border-slate-300" />
                    )}
                    <span className={req.check && form.password ? "text-slate-700 font-medium" : ""}>
                      {req.text}
                    </span>
                  </div>
                ))}
              </div>

              {error && (
                <div className="text-sm text-red-500 bg-red-50 border border-red-200 px-3 py-2 rounded-lg" data-testid="text-error">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                data-testid="button-register"
                className="w-full py-2.5 rounded-lg text-white font-semibold text-sm transition-opacity hover:opacity-90 disabled:opacity-60"
                style={{ background: "#009E2C" }}
              >
                {loading ? "Registering..." : role === "student" ? "Create Account" : "Submit Application"}
              </button>
            </form>
          )}

          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{" "}
            <button onClick={() => setLocation("/login")} className="font-semibold hover:underline" style={{ color: "#009E2C" }}>
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
