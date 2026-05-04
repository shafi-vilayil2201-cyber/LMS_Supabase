import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { getCourses, getWeeklyBlocks } from "../../services/db";
import { useAuthStore } from "../../store/authStore";
import { Star, Users, Clock, BookOpen, Lock, CheckCircle, ChevronLeft, AlertTriangle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const NAVY = "#0A1628";
const SAFFRON = "#FF6B00";
const GOLD = "#F5A623";
const TEAL = "#1A7F8E";

export default function CourseDetailPage() {
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { currentUser } = useAuthStore();
  const [course, setCourse] = useState<any>(null);
  const [blocks, setBlocks] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"curriculum" | "about">("curriculum");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [courses, wb] = await Promise.all([getCourses(), getWeeklyBlocks()]);
      const found = courses.find((c: any) => c.id === params.id);
      setCourse(found);
      setBlocks(wb.filter((b: any) => b.courseId === params.id));
      setLoading(false);
    }
    load();
  }, [params.id]);

  if (loading) return <div className="space-y-4"><Skeleton className="h-48 rounded-2xl" /><Skeleton className="h-96 rounded-2xl" /></div>;
  if (!course) return <div className="text-center py-20 text-muted-foreground">Course not found.</div>;

  const months = [...new Set(blocks.map((b) => b.monthNumber))].sort();
  const isEnrolled = currentUser?.enrolledCourses?.includes(course.id);

  const statusStyle = (status: string) => {
    if (status === "completed") return { bg: "#f0fdf4", text: "#16a34a", label: "Completed" };
    if (status === "in_review") return { bg: `${GOLD}18`, text: GOLD, label: "In Review" };
    return { bg: "#f3f4f6", text: "#9ca3af", label: "Locked" };
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <button onClick={() => setLocation("/courses")} data-testid="button-back"
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ChevronLeft className="w-4 h-4" /> Back to Courses
      </button>

      {/* Header */}
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
          <button data-testid={`button-${isEnrolled ? "continue" : "enroll"}`}
            className="px-6 py-2 rounded-xl font-semibold text-sm text-white transition-opacity hover:opacity-90"
            style={{ background: SAFFRON }}>
            {isEnrolled ? "Continue Learning" : "Enroll Now"}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {(["curriculum", "about"] as const).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} data-testid={`tab-${tab}`}
            className={`px-5 py-2.5 text-sm font-medium capitalize border-b-2 transition-colors ${
              activeTab === tab ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "curriculum" && (
        <div className="space-y-4">
          {months.map((month) => {
            const monthBlocks = blocks.filter((b) => b.monthNumber === month);
            return (
              <div key={month} className="bg-white rounded-2xl border border-border overflow-hidden">
                <div className="px-6 py-4 border-b border-border flex items-center gap-3"
                  style={{ background: `${NAVY}05` }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                    style={{ background: NAVY }}>M{month}</div>
                  <p className="font-semibold text-sm" style={{ color: NAVY, fontFamily: "Inter, sans-serif" }}>
                    Month {month}
                  </p>
                  <span className="ml-auto text-xs text-muted-foreground">{monthBlocks.length} weeks</span>
                </div>
                <div className="divide-y divide-border">
                  {monthBlocks.map((block) => {
                    const s = statusStyle(block.status);
                    const isLocked = block.status === "locked";
                    return (
                      <div key={block.id} data-testid={`card-week-${block.id}`}
                        onClick={() => !isLocked && setLocation(`/courses/${course.id}/week/${block.id}`)}
                        className={`flex items-center gap-4 px-6 py-4 transition-colors ${isLocked ? "opacity-60 cursor-not-allowed" : "hover:bg-muted/30 cursor-pointer"}`}>
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={isLocked ? { background: "#f3f4f6" } : { background: `${NAVY}10` }}>
                          {isLocked ? <Lock className="w-4 h-4 text-muted-foreground" /> :
                            block.status === "completed" ? <CheckCircle className="w-4 h-4" style={{ color: "#16a34a" }} /> :
                            <BookOpen className="w-4 h-4" style={{ color: NAVY }} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold" style={{ color: isLocked ? "#9ca3af" : NAVY }}>
                              Week {block.weekNumber}: {block.title}
                            </p>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5 truncate">
                            {block.topics.slice(0, 3).join(" · ")}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          {block.totalScore != null && (
                            <div className="text-right">
                              <p className="text-xs font-bold" style={{ color: block.totalScore >= 7.5 ? "#16a34a" : "#dc2626" }}>
                                {block.totalScore}/10
                              </p>
                              <p className="text-xs text-muted-foreground">Score</p>
                            </div>
                          )}
                          <span className="text-xs px-2.5 py-1 rounded-full font-medium"
                            style={{ background: s.bg, color: s.text }}>{s.label}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
          {blocks.length === 0 && (
            <div className="text-center py-12 text-muted-foreground bg-white rounded-2xl border border-border">
              <AlertTriangle className="w-8 h-8 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Curriculum not yet available for this course.</p>
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
    </div>
  );
}
