import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuthStore } from "../../store/authStore";
import { getCourses } from "../../services/db";
import { Star, Users, Clock, BookOpen, Lock, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const NAVY = "#0A1628";
const SAFFRON = "#FF6B00";
const GOLD = "#F5A623";
const TEAL = "#1A7F8E";

const gradients = [
  `linear-gradient(135deg, #0A1628 0%, #1a3a6e 100%)`,
  `linear-gradient(135deg, #1A7F8E 0%, #0f5a67 100%)`,
  `linear-gradient(135deg, #7c3aed 0%, #4f1fa3 100%)`,
  `linear-gradient(135deg, #FF6B00 0%, #cc4400 100%)`,
  `linear-gradient(135deg, #059669 0%, #064e3b 100%)`,
  `linear-gradient(135deg, #b45309 0%, #78350f 100%)`,
];

export default function CoursesPage() {
  const { currentUser } = useAuthStore();
  const [, setLocation] = useLocation();
  const [courses, setCourses] = useState<any[]>([]);
  const [filter, setFilter] = useState<"All" | "Full Year" | "Subject Specific">("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCourses().then((c) => { setCourses(c); setLoading(false); });
  }, []);

  const filtered = filter === "All" ? courses : courses.filter((c) => c.category === filter);
  const enrolled = currentUser?.enrolledCourses ?? [];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: NAVY, fontFamily: "Inter, sans-serif" }}>Courses</h1>
        <p className="text-sm text-muted-foreground mt-1">Structured UPSC preparation courses with weekly mentor-gated reviews</p>
      </div>

      <div className="flex gap-2">
        {(["All", "Full Year", "Subject Specific"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)} data-testid={`button-filter-${f.toLowerCase().replace(/\s/g, "-")}`}
            className="px-4 py-1.5 rounded-lg text-sm font-medium transition-all border"
            style={filter === f
              ? { background: NAVY, color: "white", borderColor: NAVY }
              : { background: "white", color: "#374151", borderColor: "#e5e7eb" }}>
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-72 rounded-2xl" />)}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((course, i) => {
            const isEnrolled = enrolled.includes(course.id);
            return (
              <div key={course.id} data-testid={`card-course-${course.id}`}
                className="bg-white rounded-2xl border border-border overflow-hidden hover:shadow-md transition-all cursor-pointer group"
                onClick={() => setLocation(`/courses/${course.id}`)}>
                <div className="h-32 flex items-end p-4 relative" style={{ background: gradients[i % gradients.length] }}>
                  {course.isFeatured && (
                    <span className="absolute top-3 right-3 text-xs px-2 py-0.5 rounded-full font-semibold"
                      style={{ background: GOLD, color: NAVY }}>Featured</span>
                  )}
                  <div>
                    <span className="text-xs px-2 py-0.5 rounded-full text-white/80 bg-white/15 font-medium">{course.category}</span>
                    <p className="text-white font-bold text-sm mt-1.5 leading-tight line-clamp-2 pr-2" style={{ fontFamily: "Inter, sans-serif" }}>
                      {course.title}
                    </p>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-xs text-muted-foreground mb-3 line-clamp-2 leading-relaxed">{course.description}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                    <span className="flex items-center gap-1"><Star className="w-3 h-3" fill={GOLD} stroke={GOLD} />{course.rating}</span>
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" />{(course.enrolledStudents / 1000).toFixed(1)}k enrolled</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{course.duration}</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-4">
                    {course.subjects.slice(0, 3).map((s: string) => (
                      <span key={s} className="text-xs px-2 py-0.5 rounded-md bg-muted text-muted-foreground">{s}</span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm" style={{ color: NAVY, fontFamily: "Inter, sans-serif" }}>
                      ₹{course.price.toLocaleString("en-IN")}
                    </span>
                    <button data-testid={`button-${isEnrolled ? "continue" : "enroll"}-${course.id}`}
                      className="text-xs px-4 py-1.5 rounded-lg font-semibold flex items-center gap-1 transition-opacity hover:opacity-90"
                      style={isEnrolled ? { background: `${TEAL}15`, color: TEAL } : { background: SAFFRON, color: "white" }}>
                      {isEnrolled ? "Continue" : "Enroll"} <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
