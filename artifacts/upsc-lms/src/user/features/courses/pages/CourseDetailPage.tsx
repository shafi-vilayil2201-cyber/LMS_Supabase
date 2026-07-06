import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { getCourses, getWeeklyBlocks } from "@/shared/services/db";
import { useAuthStore } from "@/user/features/auth/store/authStore";
import { supabase } from "@/shared/lib/supabaseClient";
import {
  Star,
  Users,
  Clock,
  BookOpen,
  Lock,
  CheckCircle,
  ChevronLeft,
  AlertTriangle,
  Award,
  Crown,
  Compass,
  MessageSquare,
  HelpCircle,
  ChevronRight,
  UserCheck
} from "lucide-react";
import { useToast } from "@/shared/hooks/use-toast";
import { Skeleton } from "@/shared/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/components/ui/dialog";

// ─── Design Themes ───────────────────────────────────────────────────────────
const NAVY = "#0A1628";
const GREEN = "#009E2C";
const GOLD = "#EAB308";
const TEAL = "#1A7F8E";

// ─── Side-Quest Challenge Data ────────────────────────────────────────────────
const mcqQuestions = [
  {
    q: "Which of the following statement is correct regarding the Preamble of the Indian Constitution?",
    options: [
      "It is a source of power to the legislature.",
      "It is a prohibition upon the powers of the legislature.",
      "It is part of the constitution but has no legal effect independently.",
      "It is not part of the constitution."
    ],
    answer: 2
  },
  {
    q: "The ideals of liberty, equality, and fraternity in our Preamble have been taken from:",
    options: [
      "The Russian Revolution",
      "The French Revolution",
      "The Irish Constitution",
      "The US Bill of Rights"
    ],
    answer: 1
  },
  {
    q: "Which Constitutional Amendment Act added 'Socialist', 'Secular' and 'Integrity' to the Preamble?",
    options: [
      "44th Amendment Act",
      "42nd Amendment Act",
      "86th Amendment Act",
      "40th Amendment Act"
    ],
    answer: 1
  }
];

export default function CourseDetailPage() {
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { currentUser, refreshUser } = useAuthStore();
  const { toast } = useToast();

  const [course, setCourse] = useState<any>(null);
  const [blocks, setBlocks] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"curriculum" | "about">("curriculum");
  const [loading, setLoading] = useState(true);
  const [reloadTrigger, setReloadTrigger] = useState(0);

  // Enrollment Loading
  const [enrolling, setEnrolling] = useState(false);
  const [unlocking, setUnlocking] = useState(false);

  // Side-Quest Modals
  const [activeQuest, setActiveQuest] = useState<"mcq" | "writing" | "ai" | null>(null);

  // MCQ State
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [mcqSubmitted, setMcqSubmitted] = useState(false);
  const [mcqScore, setMcqScore] = useState(0);

  // Answer Writing State
  const [writingAnswer, setWritingAnswer] = useState("");
  const [writingFeedback, setWritingFeedback] = useState<string | null>(null);
  const [writingSubmitting, setWritingSubmitting] = useState(false);

  // AI Challenger State
  const [chatMessages, setChatMessages] = useState<any[]>([
    { sender: "ai", text: "Greetings Aspirant! I am your AI UPSC Coach. Challenge me: write an outline of your answers for GS 2, or ask a tricky Polity question!" }
  ]);
  const [chatInput, setChatInput] = useState("");

  useEffect(() => {
    async function load() {
      const [courses, wb] = await Promise.all([getCourses(), getWeeklyBlocks()]);
      const found = courses.find((c: any) => c.id === params.id);
      setCourse(found);
      
      const staticBlocks = wb.filter((b: any) => b.courseId === params.id).sort((a: any, b: any) => a.weekNumber - b.weekNumber);
      
      if (staticBlocks.length > 0) {
        setBlocks(staticBlocks);
        setLoading(false);
      } else if (found) {
        // Construct journey blocks dynamically from attached subjects & curriculum trees!
        try {
          const { data: attachedSubjects } = await supabase
            .from("course_subjects")
            .select(`
              subject_id,
              display_order,
              start_month
            `)
            .eq("course_id", found.id)
            .order("display_order", { ascending: true });
            
          const subjectIds = (attachedSubjects || []).map((s: any) => s.subject_id);
          
          if (subjectIds.length > 0) {
            // Fetch months
            const { data: monthsData } = await supabase
              .from("subject_months")
              .select("*")
              .in("subject_id", subjectIds)
              .order("month_number", { ascending: true });
              
            const monthIds = (monthsData || []).map((m: any) => m.id);
            
            let allWeeks: any[] = [];
            let allDayTopics: any[] = [];
            
            if (monthIds.length > 0) {
              // Fetch weeks
              const { data: weeksData } = await supabase
                .from("subject_weeks")
                .select("*")
                .in("subject_month_id", monthIds)
                .order("week_number", { ascending: true });
              allWeeks = weeksData || [];
              
              const weekIds = allWeeks.map((w: any) => w.id);
              if (weekIds.length > 0) {
                // Fetch day topics
                const { data: daysData } = await supabase
                  .from("subject_day_topics")
                  .select("*")
                  .in("subject_week_id", weekIds)
                  .order("day_number", { ascending: true });
                allDayTopics = daysData || [];
              }
            }
            
            // Assemble dynamic sequence of weeks
            let sequenceWeeks: any[] = [];
            let globalWeekCounter = 1;
            const currentWeekNum = currentUser?.currentWeek || 1;
            
            (attachedSubjects || []).forEach((subj: any) => {
              const subjMonths = (monthsData || []).filter((m: any) => m.subject_id === subj.subject_id);
              subjMonths.forEach((month: any) => {
                const monthWeeks = allWeeks.filter((w: any) => w.subject_month_id === month.id);
                monthWeeks.forEach((week: any) => {
                  const weekDays = allDayTopics.filter((d: any) => d.subject_week_id === week.id);
                  
                  // Load simulated/saved score overrides if any
                  const scoreOverrideKey = `igen-weekly-score-${found.id}-${globalWeekCounter}`;
                  const savedScores = JSON.parse(localStorage.getItem(scoreOverrideKey) || "{}");
                  
                  sequenceWeeks.push({
                    id: `week-${week.id}`,
                    weekNumber: globalWeekCounter,
                    monthNumber: Math.ceil(globalWeekCounter / 4),
                    title: week.title,
                    topics: weekDays.map((d: any) => d.title),
                    status: globalWeekCounter < currentWeekNum ? "completed" : globalWeekCounter === currentWeekNum ? "active" : "locked",
                    disciplineScore: savedScores.disciplineScore !== undefined ? savedScores.disciplineScore : 0.0,
                    reviewScore: savedScores.reviewScore !== undefined ? savedScores.reviewScore : 0.0,
                  });
                  
                  globalWeekCounter++;
                });
              });
            });
            
            setBlocks(sequenceWeeks);
          } else {
            setBlocks([]);
          }
        } catch (err) {
          console.error("Error generating dynamic learning path blocks:", err);
          setBlocks([]);
        } finally {
          setLoading(false);
        }
      } else {
        setBlocks([]);
        setLoading(false);
      }
    }
    load();
  }, [params.id, currentUser, reloadTrigger]);

  if (loading) {
    return (
      <div className="space-y-4 max-w-5xl mx-auto p-4 animate-pulse">
        <Skeleton className="h-48 rounded-2xl" />
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    );
  }

  if (!course) {
    return <div className="text-center py-20 text-muted-foreground">Course not found.</div>;
  }

  const localEnrolled = JSON.parse(localStorage.getItem("igen-local-enrolled") || "[]");
  const isEnrolled = currentUser?.enrolledCourses?.includes(course.id) || localEnrolled.includes(course.id);
  const currentWeekNumber = currentUser?.currentWeek || 1;

  // ─── Enrollment Handler ─────────────────────────────────────────────────────
  const handleEnroll = async () => {
    if (!currentUser?.id) {
      toast({ title: "Authentication Required", description: "Please log in to enroll in courses.", variant: "destructive" });
      return;
    }
    
    setEnrolling(true);
    try {
      const currentList = currentUser.enrolledCourses || [];
      const updatedList = [...new Set([...currentList, course.id])];
      
      // Save locally first to guarantee instant unlock
      const localList = JSON.parse(localStorage.getItem("igen-local-enrolled") || "[]");
      localStorage.setItem("igen-local-enrolled", JSON.stringify([...new Set([...localList, course.id])]));
      
      const { error } = await supabase
        .from("users")
        .update({ enrolledCourses: updatedList })
        .eq("id", currentUser.id);

      if (error) throw error;

      await refreshUser();
      toast({ title: "Welcome Onboard!", description: `You have successfully enrolled in ${course.title}. Let's begin the journey!` });
    } catch (err: any) {
      console.warn("Could not write enrollment to database, using local session:", err.message);
      toast({ title: "Enrolled (Local Mode)", description: `Enrolled in ${course.title}. Saved locally.` });
      // Trigger a re-render to reflect enrollment state
      setCourse({ ...course });
    } finally {
      setEnrolling(false);
    }
  };

  // ─── Move to Next Week Handler (Gate Unlock) ───────────────────────────────
  const handleUnlockNextWeek = async (currentBlock: any) => {
    if (!currentUser?.id) return;
    setUnlocking(true);
    try {
      const nextWeek = currentBlock.weekNumber + 1;
      
      // Update User progress in Database
      const { error: userError } = await supabase
        .from("users")
        .update({ currentWeek: nextWeek })
        .eq("id", currentUser.id);
        
      if (userError) throw userError;

      // Update block state to completed in database (if static block)
      if (!currentBlock.id.startsWith("week-")) {
        const { error: blockError } = await supabase
          .from("weekly_blocks")
          .update({ status: "completed" })
          .eq("id", currentBlock.id);
        if (blockError) console.warn("Could not update static weekly_block status:", blockError.message);
      }

      await refreshUser();
      setReloadTrigger(prev => prev + 1);
      toast({ title: "Week Unlocked! 🎉", description: `You have advanced to Week ${nextWeek}!` });
    } catch (err: any) {
      toast({ title: "Unlock Failed", description: err.message, variant: "destructive" });
    } finally {
      setUnlocking(false);
    }
  };

  // ─── Simulation Trigger for Mentor Review ──────────────────────────────────
  const handleSimulateMentorReviewPass = async (currentBlock: any) => {
    try {
      // If static block, update Supabase
      if (!currentBlock.id.startsWith("week-")) {
        const { error } = await supabase
          .from("weekly_blocks")
          .update({
            disciplineScore: 4.0,
            reviewScore: 3.0,
            status: "in_review"
          })
          .eq("id", currentBlock.id);
        if (error) console.warn("Could not update static block score:", error.message);
      }

      // Always save locally in localStorage as a fallback/override
      const scoreOverrideKey = `igen-weekly-score-${course.id}-${currentBlock.weekNumber}`;
      localStorage.setItem(
        scoreOverrideKey,
        JSON.stringify({ disciplineScore: 4.0, reviewScore: 3.0 })
      );

      setReloadTrigger(prev => prev + 1);
      toast({ title: "Simulation Success", description: "Mentor Review passed with 100% score! Click Conquer & Advance to unlock next week." });
    } catch (err: any) {
      toast({ title: "Simulation Failed", description: err.message, variant: "destructive" });
    }
  };

  // ─── Side-Quest MCQ Challenge ───────────────────────────────────────────────
  const handleMcqAnswer = (qIndex: number, optionIndex: number) => {
    setSelectedAnswers(prev => ({ ...prev, [qIndex]: optionIndex }));
  };

  const handleMcqSubmit = () => {
    let score = 0;
    mcqQuestions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.answer) score++;
    });
    setMcqScore(score);
    setMcqSubmitted(true);
    
    if (score === 3) {
      toast({ title: "Mastery Achieved! 🎯", description: "Perfect score! Awarded +25 discipline points." });
    } else {
      toast({ title: "MCQ Complete", description: `You scored ${score}/3. Review the answers and retry.` });
    }
  };

  const resetMcq = () => {
    setSelectedAnswers({});
    setMcqSubmitted(false);
    setMcqScore(0);
  };

  // ─── Side-Quest Answer Writing Arena ───────────────────────────────────────
  const handleWritingSubmit = () => {
    if (!writingAnswer.trim()) return;
    setWritingSubmitting(true);
    
    // Simulate AI feedback review
    setTimeout(() => {
      setWritingFeedback(
        `🔍 **AI UPSC Evaluator Feedback:**\n\n` +
        `• **Introduction**: Solid definition of the Preamble. Mention of Kesavananda Bharati is excellent.\n` +
        `• **Body Structure**: Balanced points. Good reference to justice, liberty, equality.\n` +
        `• **Recommendation**: To score higher, link the Preamble to Article 21 and the basic structure doctrine in licensing cases.\n\n` +
        `🏆 **Score: 7.5 / 10** (+20 Study Willpower)`
      );
      setWritingSubmitting(false);
    }, 1500);
  };

  // ─── Side-Quest AI Challenger ──────────────────────────────────────────────
  const handleSendChatMessage = () => {
    if (!chatInput.trim()) return;
    const userMsg = { sender: "user", text: chatInput };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput("");

    // Simulate AI response
    setTimeout(() => {
      let aiResponseText = "Interesting perspective! The Constitution is a living document, and the Preamble serves as its key to identify the true values of our democracy. Ask me to outline Article 14 or test you with an MCQ next!";
      if (chatInput.toLowerCase().includes("preamble")) {
        aiResponseText = "Yes! The Preamble is non-justiciable (as per State of UP v. Kartar Singh), but acts as an key interpreter of ambiguous articles. Have you revised the Berubari Union case vs Kesavananda Bharati?";
      } else if (chatInput.toLowerCase().includes("article")) {
        aiResponseText = "Excellent focus. Article 14 ensures equality before law, Article 19 safeguards democratic freedoms, and Article 21 secures personal liberty. Ready to write a quick answer test on these?";
      }
      setChatMessages(prev => [...prev, { sender: "ai", text: aiResponseText }]);
    }, 1000);
  };

  // Duolingo UPSC Meme/Motivation Phrases
  const getMotivationalMeme = (weekNum: number) => {
    const lines = [
      "Avoided tea-stall political debates today (+10 concentration)",
      "Polity syllabus boss fight active! Stay focused",
      "Doomscrolling blocked! Wisdom streak holds (+15 points)",
      "Clearing Indian History checkpoints like a true bureaucrat",
      "UPSC Prelims MCQ Dragon Boss Fight ahead!",
      "Avoid late night tea stalls, protect your circadian rhythm (+20 power)",
    ];
    return lines[(weekNum - 1) % lines.length];
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <button onClick={() => setLocation("/courses")} data-testid="button-back"
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ChevronLeft className="w-4 h-4" /> Back to Courses
      </button>

      {/* ─── Header Card ──────────────────────────────────────────────────────── */}
      <div className="rounded-2xl p-8 text-white relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${NAVY} 0%, #0f2545 100%)` }}>
        <div className="absolute right-8 top-8 opacity-10"><BookOpen className="w-32 h-32" /></div>
        <span className="text-xs px-2.5 py-1 rounded-full bg-white/10 text-white/70 font-medium">{course.category}</span>
        <h1 className="text-2xl font-bold mt-3 mb-2 max-w-2xl" style={{ fontFamily: "Inter, sans-serif" }}>{course.title}</h1>
        <p className="text-white/60 text-sm mb-5 max-w-2xl leading-relaxed">{course.description}</p>
        <div className="flex flex-wrap items-center gap-5 text-sm">
          <span className="flex items-center gap-1.5 text-white/70"><Star className="w-4 h-4" fill={GOLD} stroke={GOLD} />{course.rating} rating</span>
          <span className="flex items-center gap-1.5 text-white/70"><Users className="w-4 h-4" />{course.enrolledStudents.toLocaleString()} enrolled</span>
          <span className="flex items-center gap-1.5 text-white/70"><Clock className="w-4 h-4" />{course.duration}</span>
          <span className="flex items-center gap-1.5 text-white/70"><BookOpen className="w-4 h-4" />{course.totalLessons} lessons</span>
        </div>
        <div className="mt-5 flex items-center gap-3">
          <span className="text-2xl font-bold" style={{ fontFamily: "Inter, sans-serif" }}>₹{course.price.toLocaleString("en-IN")}</span>
          
          <button
            onClick={isEnrolled ? () => setActiveTab("curriculum") : handleEnroll}
            disabled={enrolling}
            data-testid={`button-${isEnrolled ? "continue" : "enroll"}`}
            className="px-6 py-2.5 rounded-xl font-semibold text-sm text-white transition hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            style={{ background: GREEN }}
          >
            {enrolling ? "Enrolling..." : isEnrolled ? "Access Learning Path" : "Enroll Now"}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {(["curriculum", "about"] as const).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} data-testid={`tab-${tab}`}
            className={`px-5 py-2.5 text-sm font-medium capitalize border-b-2 transition-colors ${
              activeTab === tab ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab === "curriculum" && isEnrolled ? "Learning Path (Duolingo Style)" : tab}
          </button>
        ))}
      </div>

      {/* ─── Curriculum View (Traditional vs. Duolingo Journey Path) ──────────── */}
      {activeTab === "curriculum" && (
        <div className="space-y-4">
          {isEnrolled ? (
            /* ─── DUOLINGO STYLE PATHWAY ─── */
            <div className="relative bg-card rounded-2xl border border-border p-8 overflow-hidden">
              <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] pointer-events-none" />
              
              <div className="max-w-md mx-auto text-center mb-10">
                <h2 className="text-xl font-bold tracking-tight">Your UPSC Journey Path</h2>
                <p className="text-xs text-muted-foreground mt-1">
                  Complete weekly blocks, unlock roadside challenges, clear mentor checks, and advance.
                </p>
              </div>

              {/* Vertical Journey Road Map */}
              <div className="relative flex flex-col items-center gap-12 py-8 max-w-lg mx-auto">
                
                {/* Dashed Link Line */}
                <div className="absolute top-16 bottom-16 w-1 border-l-2 border-dashed border-muted-foreground/30 left-1/2 -translate-x-1/2 pointer-events-none" />

                {blocks.map((block, index) => {
                  const isActive = block.weekNumber === currentWeekNumber;
                  const isCompleted = block.weekNumber < currentWeekNumber;
                  const isLocked = block.weekNumber > currentWeekNumber;

                  // Alternating zig-zag offset classes
                  const alignments = ["self-center", "self-start pl-8 sm:pl-16", "self-end pr-8 sm:pr-16"];
                  const alignmentClass = alignments[index % alignments.length];

                  // Calculations for weekly gate
                  const rawScore = (block.disciplineScore || 0) + (block.reviewScore || 0);
                  const totalPossible = 7.0; // 4 discipline + 3 oral
                  const aggregatePct = totalPossible > 0 ? Math.round((rawScore / totalPossible) * 100) : 0;
                  const passedGate = aggregatePct >= 80;

                  return (
                    <div key={block.id} className={`w-full flex flex-col items-center ${alignmentClass} relative z-10 gap-3`}>
                      
                      {/* Milestone Crown / Avatar details */}
                      {isActive && (
                        <div className="absolute -top-7 flex flex-col items-center animate-bounce">
                          <span className="bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
                            You're Here
                          </span>
                          <div className="w-2.5 h-2.5 bg-primary rotate-45 -mt-1" />
                        </div>
                      )}

                      {/* Main Node Circle */}
                      <button
                        onClick={() => {
                          if (isLocked) {
                            toast({ title: "Milestone Locked", description: "Clear previous weeks first!", variant: "destructive" });
                          } else {
                            setLocation(`/courses/${course.id}/week/${block.id}`);
                          }
                        }}
                        className={`w-16 h-16 rounded-full flex items-center justify-center border-4 shadow-md transition-all hover:scale-105 active:scale-95 ${
                          isCompleted
                            ? "bg-green-500 border-green-300 text-white"
                            : isActive
                            ? "bg-[#EAB308] border-yellow-200 text-white animate-pulse"
                            : "bg-muted border-muted-foreground/20 text-muted-foreground"
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle className="w-7 h-7" />
                        ) : isActive ? (
                          <Crown className="w-7 h-7" />
                        ) : (
                          <Lock className="w-6 h-6" />
                        )}
                      </button>

                      {/* Node Text & UPSC Motto Banner */}
                      <div className="text-center max-w-xs space-y-1">
                        <p className="text-sm font-bold text-foreground">
                          Week {block.weekNumber}: {block.title}
                        </p>
                        <p className="text-[11px] text-muted-foreground italic font-medium">
                          "{getMotivationalMeme(block.weekNumber)}"
                        </p>
                      </div>

                      {/* ── Roadside Challenges (Duolingo Style Side-Quests) ── */}
                      {isActive && (
                        <div className="flex gap-2.5 py-1">
                          <button
                            onClick={() => {
                              resetMcq();
                              setActiveQuest("mcq");
                            }}
                            className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1.5 rounded-lg border border-[#1A7F8E]/20 bg-[#1A7F8E]/10 hover:bg-[#1A7F8E]/20 text-[#1A7F8E] transition"
                          >
                            <HelpCircle className="w-3.5 h-3.5" /> MCQ Challenge
                          </button>
                          <button
                            onClick={() => {
                              setWritingAnswer("");
                              setWritingFeedback(null);
                              setActiveQuest("writing");
                            }}
                            className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1.5 rounded-lg border border-[#7c3aed]/20 bg-[#7c3aed]/10 hover:bg-[#7c3aed]/20 text-[#7c3aed] transition"
                          >
                            <BookOpen className="w-3.5 h-3.5" /> Answer Writing
                          </button>
                          <button
                            onClick={() => setActiveQuest("ai")}
                            className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1.5 rounded-lg border border-green-600/20 bg-green-600/10 hover:bg-green-600/20 text-green-600 transition"
                          >
                            <MessageSquare className="w-3.5 h-3.5" /> AI Challenge
                          </button>
                        </div>
                      )}

                      {/* ── End of Week Mentor Gate ── */}
                      {!isLocked && (
                        <div className="w-full max-w-sm rounded-2xl border border-border bg-card/60 p-4 mt-2 shadow-sm space-y-3">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-muted-foreground">Week {block.weekNumber} Gate Score:</span>
                            <span className="font-bold text-foreground">
                              {aggregatePct}% / 80% Required
                            </span>
                          </div>
                          
                          <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                background: passedGate ? GREEN : GOLD,
                                width: `${Math.min(aggregatePct, 100)}%`
                              }}
                            />
                          </div>

                          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-muted-foreground">
                            <span>Discipline: {block.disciplineScore || 0}/4.0</span>
                            <span>Mentor Review: {block.reviewScore || 0}/3.0</span>
                          </div>

                          <div className="flex gap-2 pt-1">
                            {/* Simulated mentor passing pass for sandbox */}
                            {!passedGate && (
                              <button
                                onClick={() => handleSimulateMentorReviewPass(block)}
                                className="flex-1 h-8 rounded-lg bg-muted text-muted-foreground border border-border text-[10px] font-bold hover:bg-muted/80 transition"
                              >
                                Simulate Review Pass
                              </button>
                            )}

                            {passedGate && isActive ? (
                              <button
                                onClick={() => handleUnlockNextWeek(block)}
                                disabled={unlocking}
                                className="flex-1 h-8 text-white rounded-lg text-[10px] font-bold transition hover:opacity-90 flex items-center justify-center gap-1"
                                style={{ background: GREEN }}
                              >
                                <CheckCircle className="w-3 h-3" /> Conquer & Advance!
                              </button>
                            ) : !passedGate && isActive ? (
                              <button
                                onClick={() => setLocation("/mentors")}
                                className="flex-1 h-8 rounded-lg text-[10px] font-bold text-white transition hover:opacity-90 flex items-center justify-center gap-1"
                                style={{ background: TEAL }}
                              >
                                Book Review Session
                              </button>
                            ) : (
                              <span className="text-[10px] font-bold text-green-500 flex items-center gap-1 mx-auto py-1">
                                <UserCheck className="w-3 h-3" /> Completed & Verified
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Traditional Outline (For guest preview) */
            <div className="space-y-4">
              {blocks.map((block) => (
                <div key={block.id} className="bg-white rounded-2xl border border-border overflow-hidden">
                  <div className="px-6 py-4 border-b border-border flex items-center gap-3 bg-muted/20">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                      style={{ background: NAVY }}>W{block.weekNumber}</div>
                    <p className="font-semibold text-sm text-foreground">Week {block.weekNumber}: {block.title}</p>
                  </div>
                  <div className="px-6 py-4">
                    <p className="text-xs text-muted-foreground mb-3 font-semibold">Topics Covered:</p>
                    <div className="flex flex-wrap gap-2">
                      {block.topics.map((t: string) => (
                        <span key={t} className="text-xs px-2.5 py-1 rounded-lg bg-muted text-muted-foreground">{t}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "about" && (
        <div className="bg-white rounded-2xl border border-border p-6 space-y-5">
          <div>
            <h3 className="font-bold text-sm mb-2" style={{ color: NAVY }}>Instructor</h3>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
                style={{ background: NAVY }}>{course.instructor.charAt(0)}</div>
              <div>
                <p className="font-semibold text-sm" style={{ color: NAVY }}>{course.instructor}</p>
                <p className="text-xs text-muted-foreground">Subject Expert</p>
              </div>
            </div>
          </div>
          <div>
            <h3 className="font-bold text-sm mb-2" style={{ color: NAVY }}>Subjects Covered</h3>
            <div className="flex flex-wrap gap-2">
              {course.subjects.map((s: string) => (
                <span key={s} className="text-xs px-3 py-1 rounded-lg bg-muted text-muted-foreground">{s}</span>
              ))}
            </div>
          </div>
          <div>
            <h3 className="font-bold text-sm mb-2" style={{ color: NAVY }}>Course Stats</h3>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Total Lessons", val: course.totalLessons },
                { label: "Practice Tests", val: course.totalTests },
                { label: "Enrolled", val: course.enrolledStudents.toLocaleString() },
              ].map((s) => (
                <div key={s.label} className="text-center p-3 rounded-xl bg-muted/40">
                  <p className="font-bold text-lg" style={{ color: NAVY }}>{s.val}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── SIDE-QUEST MODAL CHALLENGES ─────────────────────────────────────── */}
      
      {/* MCQ challenge Modal */}
      <Dialog open={activeQuest === "mcq"} onOpenChange={(open) => !open && setActiveQuest(null)}>
        <DialogContent className="max-w-md bg-card border border-border p-6 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-foreground">Roadside MCQ Challenge</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 my-2">
            {mcqQuestions.map((question, qIdx) => (
              <div key={qIdx} className="space-y-2 border-b border-border/50 pb-3 last:border-none">
                <p className="text-xs font-semibold text-foreground">
                  Q{qIdx + 1}: {question.q}
                </p>
                <div className="grid gap-2">
                  {question.options.map((option, oIdx) => {
                    const isSelected = selectedAnswers[qIdx] === oIdx;
                    const isCorrect = question.answer === oIdx;
                    return (
                      <button
                        key={oIdx}
                        disabled={mcqSubmitted}
                        onClick={() => handleMcqAnswer(qIdx, oIdx)}
                        className={`text-left text-xs p-2.5 rounded-xl border transition-all ${
                          isSelected
                            ? mcqSubmitted
                              ? isCorrect
                                ? "bg-green-500/10 border-green-500 text-green-600"
                                : "bg-red-500/10 border-red-500 text-red-600"
                              : "bg-primary/10 border-primary text-foreground"
                            : "border-border hover:bg-muted"
                        }`}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <DialogFooter className="flex justify-between gap-2 pt-2">
            {mcqSubmitted ? (
              <>
                <span className="text-xs font-bold self-center text-foreground">
                  Final Score: {mcqScore} / 3 Correct
                </span>
                <button
                  onClick={resetMcq}
                  className="h-9 px-4 border border-border hover:bg-muted text-xs font-bold rounded-xl"
                >
                  Retry Challenge
                </button>
              </>
            ) : (
              <button
                onClick={handleMcqSubmit}
                className="h-9 px-4 text-white text-xs font-bold rounded-xl w-full hover:opacity-95 transition"
                style={{ background: GREEN }}
              >
                Submit Answers
              </button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Answer Writing Challenge Modal */}
      <Dialog open={activeQuest === "writing"} onOpenChange={(open) => !open && setActiveQuest(null)}>
        <DialogContent className="max-w-md bg-card border border-border p-6 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-foreground">Descriptive Answer Writing Arena</DialogTitle>
          </DialogHeader>
          <div className="space-y-3.5 mt-2">
            <div className="p-3 bg-muted/40 border border-border rounded-xl">
              <p className="text-xs font-semibold text-foreground">
                GS Paper 2 Practice Question:
              </p>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                "Evaluate the role of the Preamble as a key to resolve ambiguity in the Constitution." (150 words)
              </p>
            </div>
            
            <textarea
              value={writingAnswer}
              onChange={(e) => setWritingAnswer(e.target.value)}
              disabled={writingSubmitting || !!writingFeedback}
              className="min-h-32 w-full rounded-xl border border-input bg-background text-foreground px-3 py-2 text-xs outline-none transition focus:border-primary"
              placeholder="Start drafting your answer here..."
            />

            {writingFeedback && (
              <div className="p-3.5 bg-green-500/10 border border-green-500/20 text-xs text-foreground rounded-xl leading-relaxed whitespace-pre-line">
                {writingFeedback}
              </div>
            )}
          </div>

          <DialogFooter className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setActiveQuest(null)}
              className="h-9 px-4 border border-border hover:bg-muted text-xs font-semibold rounded-xl"
            >
              Close
            </button>
            {!writingFeedback && (
              <button
                onClick={handleWritingSubmit}
                disabled={writingSubmitting || !writingAnswer.trim()}
                className="h-9 px-4 text-white text-xs font-bold rounded-xl hover:opacity-95 transition disabled:opacity-50"
                style={{ background: GREEN }}
              >
                {writingSubmitting ? "Evaluating..." : "Submit Answer"}
              </button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AI Challenge chat Modal */}
      <Dialog open={activeQuest === "ai"} onOpenChange={(open) => !open && setActiveQuest(null)}>
        <DialogContent className="max-w-md bg-card border border-border p-6 rounded-2xl flex flex-col h-[400px]">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-foreground">AI Polity Challenger</DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto space-y-2 p-1.5 my-2 border border-border/50 rounded-xl bg-muted/20">
            {chatMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`max-w-[80%] p-2.5 rounded-xl text-xs leading-relaxed ${
                  msg.sender === "ai"
                    ? "bg-muted text-foreground mr-auto"
                    : "bg-green-600 text-white ml-auto"
                }`}
              >
                {msg.text}
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendChatMessage()}
              placeholder="Ask AI or write your argument..."
              className="h-9 flex-1 rounded-xl border border-input bg-background text-foreground px-3 text-xs outline-none"
            />
            <button
              onClick={handleSendChatMessage}
              className="h-9 px-3 text-white text-xs font-bold rounded-xl hover:opacity-95 transition"
              style={{ background: GREEN }}
            >
              Send
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
