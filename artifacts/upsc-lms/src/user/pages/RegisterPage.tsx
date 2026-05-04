import { useState } from "react";
import { useLocation } from "wouter";
import { GraduationCap, ArrowRight } from "lucide-react";

export default function RegisterPage() {
  const [, setLocation] = useLocation();
  const [form, setForm] = useState({ name: "", email: "", phone: "", city: "", password: "", confirm: "" });
  const [submitted, setSubmitted] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setLocation("/login"), 2000);
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: "#0A1628" }}>
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "#FF6B00" }}>
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-foreground text-lg">Create Your Account</span>
          </div>

          {submitted ? (
            <div className="text-center py-8">
              <div className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: "#22c55e20" }}>
                <ArrowRight className="w-7 h-7" style={{ color: "#22c55e" }} />
              </div>
              <p className="font-semibold text-foreground">Registration submitted!</p>
              <p className="text-sm text-muted-foreground mt-1">Redirecting to login...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {[
                { name: "name", label: "Full Name", type: "text", placeholder: "Arjun Sharma" },
                { name: "email", label: "Email", type: "email", placeholder: "you@example.com" },
                { name: "phone", label: "Phone", type: "tel", placeholder: "+91 9876543210" },
                { name: "city", label: "City", type: "text", placeholder: "Delhi" },
                { name: "password", label: "Password", type: "password", placeholder: "••••••••" },
                { name: "confirm", label: "Confirm Password", type: "password", placeholder: "••••••••" },
              ].map((field) => (
                <div key={field.name}>
                  <label className="block text-sm font-medium text-foreground mb-1.5">{field.label}</label>
                  <input
                    type={field.type}
                    name={field.name}
                    value={(form as any)[field.name]}
                    onChange={handleChange}
                    placeholder={field.placeholder}
                    required
                    data-testid={`input-${field.name}`}
                    className="w-full px-4 py-2.5 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-background"
                  />
                </div>
              ))}
              <button type="submit" data-testid="button-register"
                className="w-full py-2.5 rounded-lg text-white font-semibold text-sm transition-opacity hover:opacity-90"
                style={{ background: "#FF6B00" }}>
                Create Account
              </button>
            </form>
          )}

          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{" "}
            <button onClick={() => setLocation("/login")} className="font-semibold hover:underline" style={{ color: "#FF6B00" }}>
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
