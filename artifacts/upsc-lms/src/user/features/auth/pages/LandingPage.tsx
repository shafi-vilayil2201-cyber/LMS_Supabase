import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { GraduationCap, Flame, Trophy, Users, BookOpen, CheckCircle, Star, ChevronDown, ChevronRight, ArrowRight, Lock } from "lucide-react";
import { ThemeToggle } from "@/shared/components/ThemeToggle";

const NAVY = "#0A1628";
const SAFFRON = "#009E2C";
const GOLD = "#009E2C";
const TEAL = "#1A7F8E";

const domains = [
  { name: "UPSC", sub: "Civil Services Examination", status: "live", desc: "IAS · IPS · IFS preparation" },
  { name: "NEET", sub: "Medical Entrance", status: "soon", desc: "Phase 2" },
  { name: "CA", sub: "Chartered Accountancy", status: "soon", desc: "Foundation · Inter · Final" },
  { name: "CMA", sub: "Cost Management", status: "soon", desc: "Phase 2" },
  { name: "PSC", sub: "State Civil Services", status: "soon", desc: "Phase 3" },
  { name: "SSC", sub: "Staff Selection", status: "soon", desc: "CGL · CHSL · MTS" },
];

const steps = [
  { icon: BookOpen, title: "Enrol in a Course", desc: "Choose the full 12-month UPSC journey or subject-specific modules. Your structured roadmap begins immediately.", color: SAFFRON },
  { icon: CheckCircle, title: "Track Daily Habits", desc: "Complete daily tasks — topic study, quiz, newspaper reading, exercise. Every habit earns discipline points.", color: TEAL },
  { icon: Trophy, title: "Get Reviewed & Unlock", desc: "Weekly 60-minute reviews by expert mentors gate your progress. Score 7.5/10 to unlock the next week.", color: GOLD },
];

const mentors = [
  { name: "Dr. Ramesh Kumar", expertise: ["History", "GS Paper 1", "Polity"], rating: 4.8, reviews: 142, badge: "Top Reviewer" },
  { name: "Advocate Suresh Mehta", expertise: ["Polity", "Ethics", "Governance"], rating: 4.9, reviews: 211, badge: "Most Booked" },
  { name: "Prof. Anita Singh", expertise: ["Geography", "Environment"], rating: 4.7, reviews: 98, badge: "" },
  { name: "Col. Vijay Nair (Retd.)", expertise: ["Security", "IR", "GS Paper 3"], rating: 4.8, reviews: 134, badge: "IAS Officer" },
];

const faqs = [
  { q: "What makes IGen different from other UPSC platforms?", a: "IGen is the only platform combining daily habit tracking, weekly mentor-gated progression locks, live oral + written reviews, and WhatsApp AI nudges — all in one integrated ecosystem." },
  { q: "How does the weekly review lock system work?", a: "Each week is locked until you score at least 7.5 out of 10 in a 60-minute review session. Three phases: oral interview (30 min), prelims objective (15 min), and mains answer writing (15 min)." },
  { q: "Can I choose my mentor?", a: "Yes! At week-end, you browse available reviewers filtered by subject, rating, and availability. You send a booking request and the mentor accepts." },
  { q: "What is the daily discipline score?", a: "Each day has 4 habits: topic study (10 pts), daily quiz (10 pts), newspaper reading (10 pts), and exercise (10 pts). Your 7-day average forms 40% of your weekly review score." },
  { q: "What happens if I score below 7.5 in the weekly review?", a: "You get one re-review within 48 hours with a different reviewer. Second failure allows admin override with a note." },
  { q: "Are the sessions recorded?", a: "Yes, with consent. Session recordings are stored for 30 days and accessible only to the enrolled student and their mentor." },
  { q: "How is the leaderboard score calculated?", a: "Weekly review (50%) + Daily discipline streak (20%) + Quiz accuracy (15%) + Group participation (10%) + Mains writing (5%)." },
  { q: "Is the platform available for other exams?", a: "UPSC is live. NEET, CA, and CMA are in Phase 2. PSC and SSC in Phase 3." },
];

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } };

export default function LandingPage() {
  const [, setLocation] = useLocation();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-background" style={{ fontFamily: "Lexend, sans-serif" }}>
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10" style={{ background: NAVY }}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: SAFFRON }}>
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-bold text-lg">IGen</span>
            <span className="font-bold text-lg" style={{ color: SAFFRON }}>LMS</span>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button onClick={() => setLocation("/login")} data-testid="button-nav-login"
              className="text-white/80 hover:text-white text-sm font-medium px-4 py-2 transition-colors">Login</button>
            <button onClick={() => setLocation("/register")} data-testid="button-nav-register"
              className="text-white text-sm font-semibold px-5 py-2 rounded-lg transition-opacity hover:opacity-90"
              style={{ background: SAFFRON }}>Start Free Trial</button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-16 min-h-screen flex items-center relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${NAVY} 0%, #0f2545 60%, #1a3a6e 100%)` }}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-24 left-12 w-64 h-64 rounded-full opacity-10"
            style={{ background: SAFFRON, filter: "blur(80px)" }} />
          <div className="absolute bottom-16 right-16 w-80 h-80 rounded-full opacity-10"
            style={{ background: TEAL, filter: "blur(100px)" }} />
        </div>
        <div className="max-w-7xl mx-auto px-6 py-24 grid lg:grid-cols-2 gap-16 items-center relative z-10">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-6 border border-white/20"
              style={{ background: "rgba(0,158,44,0.15)", color: SAFFRON }}>
              <Flame className="w-3.5 h-3.5" />
              India's Most Disciplined UPSC Platform
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold text-white leading-[1.1] mb-6"
              style={{ fontFamily: "Inter, sans-serif" }}>
              Your 1-Year UPSC Journey,{" "}
              <span style={{ color: SAFFRON }}>Structured,</span>{" "}
              <span style={{ color: GOLD }}>Gamified</span>{" "}
              <span className="text-white">&amp;</span>{" "}
              <span style={{ color: "#4fc3d4" }}>Mentor-Driven.</span>
            </h1>
            <p className="text-white/70 text-lg leading-relaxed mb-8 max-w-xl">
              Join 24,500+ aspirants who track daily habits, compete on leaderboards, and learn from IAS mentors — all in one integrated ecosystem. From 6 AM WhatsApp nudges to Sunday review sessions.
            </p>
            <div className="flex flex-wrap gap-4">
              <button onClick={() => setLocation("/register")} data-testid="button-hero-trial"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-white font-semibold text-base transition-transform hover:scale-105"
                style={{ background: SAFFRON }}>
                Start Free Trial <ArrowRight className="w-4 h-4" />
              </button>
              <button onClick={() => setLocation("/login")} data-testid="button-hero-mentors"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-base border border-white/30 text-white hover:bg-white/10 transition-colors">
                Meet our Mentors
              </button>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.2 }}>
            <div className="rounded-2xl p-5 border border-white/10"
              style={{ background: "rgba(255,255,255,0.06)", backdropFilter: "blur(10px)" }}>
              <div className="flex items-center justify-between mb-4">
                <p className="text-white font-semibold text-sm">Weekly Leaderboard</p>
                <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{ background: `${SAFFRON}20`, color: SAFFRON }}>Live</span>
              </div>
              {[
                { rank: 1, name: "S**** I***", city: "Bengaluru", score: "96.5", color: GOLD },
                { rank: 2, name: "K**** S***", city: "Chennai", score: "94.2", color: "#C0C0C0" },
                { rank: 3, name: "M**** P***", city: "Trivandrum", score: "92.8", color: "#CD7F32" },
              ].map((e) => (
                <div key={e.rank} className="flex items-center gap-3 py-2.5 border-b border-white/5 last:border-0">
                  <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                    style={{ background: e.color }}>{e.rank}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium">{e.name}</p>
                    <p className="text-white/40 text-xs">{e.city}</p>
                  </div>
                  <span className="text-sm font-bold" style={{ color: GOLD }}>{e.score}</span>
                </div>
              ))}
              <div className="mt-4 pt-3 border-t border-white/10 flex items-center gap-2 text-xs text-white/50">
                <Flame className="w-3 h-3" style={{ color: SAFFRON }} />
                <span>You: <strong className="text-white">Rank #23</strong> — 14 day streak active</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-8 border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { n: "24,500+", l: "Enrolled Aspirants" },
            { n: "48+", l: "Expert Mentors" },
            { n: "87%", l: "Prelims Pass Rate" },
            { n: "52 Weeks", l: "Structured Journey" },
          ].map((s) => (
            <div key={s.l} className="text-center">
              <p className="text-3xl font-bold text-foreground" style={{ fontFamily: "Inter, sans-serif" }}>{s.n}</p>
              <p className="text-sm text-muted-foreground mt-1">{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Domain Cards */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div className="text-center mb-12" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <h2 className="text-3xl font-bold mb-3 text-foreground" style={{ fontFamily: "Inter, sans-serif" }}>Choose Your Exam Vertical</h2>
            <p className="text-muted-foreground">One platform, multiple competitive examinations. Start with UPSC today.</p>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
            {domains.map((d, i) => (
              <motion.div key={d.name} initial="hidden" whileInView="visible" viewport={{ once: true }}
                variants={fadeUp} transition={{ delay: i * 0.07 }}>
                <div onClick={() => d.status === "live" && setLocation("/register")}
                  data-testid={`card-domain-${d.name.toLowerCase()}`}
                  className={`rounded-2xl p-6 border transition-all ${d.status === "live"
                    ? "cursor-pointer shadow-md hover:shadow-xl hover:-translate-y-1" : "opacity-60 cursor-not-allowed"}`}
                  style={d.status === "live" ? { borderColor: SAFFRON, background: `${SAFFRON}08` } : { borderColor: "#e5e7eb" }}>
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-2xl font-bold" style={{ color: d.status === "live" ? NAVY : "#9ca3af", fontFamily: "Inter, sans-serif" }}>{d.name}</span>
                    {d.status === "live"
                      ? <span className="text-xs px-2 py-0.5 rounded-full font-semibold text-white" style={{ background: "#22c55e" }}>Live</span>
                      : <span className="text-xs px-2 py-0.5 rounded-full font-medium text-muted-foreground bg-muted">Soon</span>}
                  </div>
                  <p className="text-sm font-medium" style={{ color: d.status === "live" ? "#374151" : "#9ca3af" }}>{d.sub}</p>
                  <p className="text-xs text-muted-foreground mt-1">{d.desc}</p>
                  {d.status === "live" && (
                    <div className="mt-4 flex items-center gap-1 text-xs font-semibold" style={{ color: SAFFRON }}>
                      Enter Platform <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20" style={{ background: `${NAVY}06` }}>
        <div className="max-w-7xl mx-auto px-6">
          <motion.div className="text-center mb-14" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <h2 className="text-3xl font-bold mb-3 text-foreground" style={{ fontFamily: "Inter, sans-serif" }}>How IGen Works</h2>
            <p className="text-muted-foreground">A structured 3-step system that keeps you disciplined and moving forward every single day</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((s, i) => {
              const Icon = s.icon;
              return (
                <motion.div key={s.title} initial="hidden" whileInView="visible" viewport={{ once: true }}
                  variants={fadeUp} transition={{ delay: i * 0.1 }}>
                  <div className="text-center bg-card rounded-2xl p-8 border border-border shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-5"
                      style={{ background: s.color }}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="w-7 h-7 rounded-full border-2 mx-auto -mt-2 mb-4 flex items-center justify-center text-xs font-bold bg-white"
                      style={{ borderColor: s.color, color: s.color }}>{i + 1}</div>
                    <h3 className="text-lg font-bold mb-2 text-foreground" style={{ fontFamily: "Inter, sans-serif" }}>{s.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Gamification Preview */}
      <section className="py-20 bg-card">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-14 items-center">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
              <h2 className="text-3xl font-bold mb-4 text-foreground" style={{ fontFamily: "Inter, sans-serif" }}>Stay Motivated with Gamification</h2>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                The one-year UPSC journey is a marathon. IGen's gamification engine keeps you engaged through competitive leaderboards, badge achievements, and streak multipliers.
              </p>
              <div className="space-y-4">
                {[
                  { icon: Flame, label: "Streak Multiplier System", desc: "Streak bonus ×1.5 after 7 consecutive days — consistency pays off", color: SAFFRON },
                  { icon: Trophy, label: "Top-100 Public Leaderboard", desc: "Compete with aspirants across India in real-time rankings", color: GOLD },
                  { icon: Star, label: "8 Achievement Badges", desc: "From Rising Star to Course Completer — track your milestones", color: TEAL },
                ].map((f) => {
                  const Icon = f.icon;
                  return (
                    <div key={f.label} className="flex items-start gap-4 p-4 rounded-xl border border-border">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: `${f.color}18` }}>
                        <Icon className="w-5 h-5" style={{ color: f.color }} />
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-foreground">{f.label}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{f.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
              <div className="rounded-2xl p-6 border border-border shadow-sm bg-background">
                <p className="font-semibold text-sm mb-5 text-foreground">Weekly Progress — Week 12 of 52</p>
                <div className="space-y-3 mb-5">
                  {[
                    { label: "Discipline Score", val: 3.6, max: 4, color: SAFFRON, pending: false },
                    { label: "Oral Interview", val: 0, max: 2, color: TEAL, pending: true },
                    { label: "Prelims MCQ", val: 0, max: 2, color: GOLD, pending: true },
                    { label: "Mains Writing", val: 0, max: 2, color: "#a855f7", pending: true },
                  ].map((row) => (
                    <div key={row.label}>
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-muted-foreground">{row.label}</span>
                        <span className="font-semibold" style={{ color: row.pending ? "#9ca3af" : NAVY }}>
                          {row.pending ? "Pending review" : `${row.val} / ${row.max}`}
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${(row.val / row.max) * 100}%`, background: row.color }} />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-3 rounded-xl flex items-center gap-3"
                  style={{ background: `${SAFFRON}10`, border: `1px dashed ${SAFFRON}60` }}>
                  <Lock className="w-4 h-4 flex-shrink-0" style={{ color: SAFFRON }} />
                  <div>
                    <p className="text-xs font-semibold text-foreground">Week 13 Locked</p>
                    <p className="text-xs text-muted-foreground">Score 7.5 / 10 to unlock Constitutional Bodies</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mentor Showcase */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div className="text-center mb-12" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <h2 className="text-3xl font-bold mb-3 text-foreground" style={{ fontFamily: "Inter, sans-serif" }}>Learn from the Best</h2>
            <p className="text-muted-foreground">Hand-picked IAS officers, professors, and subject experts — all super-admin approved</p>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {mentors.map((m, i) => (
              <motion.div key={m.name} initial="hidden" whileInView="visible" viewport={{ once: true }}
                variants={fadeUp} transition={{ delay: i * 0.08 }}>
                <div className="bg-card rounded-2xl p-5 border border-border hover:shadow-md transition-shadow text-center">
                  <div className="w-14 h-14 rounded-full mx-auto mb-3 flex items-center justify-center text-xl font-bold text-white bg-primary">{m.name.charAt(0)}</div>
                  <h3 className="font-semibold text-sm mb-1 text-foreground">{m.name}</h3>
                  {m.badge && (
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium inline-block mb-2"
                      style={{ background: `${SAFFRON}15`, color: SAFFRON }}>{m.badge}</span>
                  )}
                  <div className="flex items-center justify-center gap-0.5 mb-3">
                    {Array.from({ length: 5 }).map((_, si) => (
                      <Star key={si} className="w-3 h-3" fill={si < Math.floor(m.rating) ? GOLD : "none"} stroke={GOLD} />
                    ))}
                    <span className="text-xs text-muted-foreground ml-1">{m.rating} ({m.reviews})</span>
                  </div>
                  <div className="flex flex-wrap gap-1 justify-center">
                    {m.expertise.slice(0, 2).map((t) => (
                      <span key={t} className="text-xs px-2 py-0.5 rounded-md bg-muted text-muted-foreground">{t}</span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 bg-background">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div className="text-center mb-12" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <h2 className="text-3xl font-bold mb-3 text-primary" style={{ fontFamily: "Inter, sans-serif" }}>Simple, Transparent Pricing</h2>
            <p className="text-muted-foreground">Invest in your future. One IAS salary pays for this course in a day.</p>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { name: "Full Year Course", price: "₹25,000", period: "12 months", desc: "Complete UPSC CSE Prelims + Mains journey",
                features: ["52 weekly structured modules", "Daily habit tracking system", "Weekly mentor-gated review", "WhatsApp daily nudges", "Leaderboard & badges", "Completion certificate"], cta: "Start Full Year Journey", highlight: true },
              { name: "Subject Course", price: "₹2,500", period: "from 4 weeks", desc: "Deep-dive into a single UPSC subject",
                features: ["4–10 week structured modules", "Daily habit tracking", "Weekly expert review", "Subject completion certificate", "10+ subject options available"], cta: "Choose a Subject", highlight: false },
            ].map((plan) => (
              <div key={plan.name} className={`rounded-2xl p-7 border ${plan.highlight ? "shadow-xl" : "border-border"}`}
                style={plan.highlight ? { borderColor: SAFFRON, background: "var(--background)" } : {}}>
                {plan.highlight && <div className="text-xs font-bold mb-3 uppercase tracking-wider" style={{ color: SAFFRON }}>Most Popular</div>}
                <h3 className="text-xl font-bold mb-1 text-foreground" style={{ fontFamily: "Inter, sans-serif" }}>{plan.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{plan.desc}</p>
                <div className="flex items-end gap-2 mb-6">
                  <span className="text-4xl font-bold text-primary" style={{ fontFamily: "Inter, sans-serif" }}>{plan.price}</span>
                  <span className="text-muted-foreground text-sm mb-1">/ {plan.period}</span>
                </div>
                <ul className="space-y-2.5 mb-7">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm">
                      <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: plan.highlight ? SAFFRON : TEAL }} />
                      <span className="text-foreground">{f}</span>
                    </li>
                  ))}
                </ul>
                <button onClick={() => setLocation("/register")}
                  data-testid={`button-pricing-${plan.highlight ? "full-year" : "subject"}`}
                  className="w-full py-3 rounded-xl font-semibold text-sm transition-opacity hover:opacity-90 text-white"
                  style={plan.highlight ? { background: SAFFRON } : { background: "var(--primary)" }}>
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-3xl mx-auto px-6">
          <motion.div className="text-center mb-12" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <h2 className="text-3xl font-bold text-primary" style={{ fontFamily: "Inter, sans-serif" }}>Frequently Asked Questions</h2>
          </motion.div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-card rounded-xl border border-border overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  data-testid={`button-faq-${i}`}
                  className="w-full flex items-center justify-between px-5 py-4 text-left">
                  <span className="font-medium text-sm pr-4 text-primary">{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 flex-shrink-0 transition-transform text-muted-foreground ${openFaq === i ? "rotate-180" : ""}`} />
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed border-t border-border pt-3">{faq.a}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20" style={{ background: NAVY }}>
        <div className="max-w-3xl mx-auto px-6 text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <h2 className="text-3xl font-bold text-white mb-4" style={{ fontFamily: "Inter, sans-serif" }}>Your IAS dream needs daily discipline.</h2>
            <p className="text-white/60 mb-8 text-lg">Start your structured 12-month journey today. Every day you delay is one more day of unstructured preparation.</p>
            <button onClick={() => setLocation("/register")} data-testid="button-footer-cta"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-white font-semibold text-base transition-transform hover:scale-105"
              style={{ background: SAFFRON }}>
              Begin My UPSC Journey <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 border-t border-white/10" style={{ background: "#060e1a" }}>
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: SAFFRON }}>
              <GraduationCap className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-bold">IGen LMS</span>
          </div>
          <p className="text-white/30 text-xs">© 2025 IGen Technologies. All rights reserved. UPSC Prep Platform v1.0</p>
          <div className="flex gap-5 text-xs text-white/40">
            {["Privacy", "Terms", "Contact"].map((l) => (
              <span key={l} className="hover:text-white/70 cursor-pointer transition-colors">{l}</span>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
