import { useEffect, useState } from "react";
import { getCourses } from "../../services/db";
import { BookOpen, Plus, Edit, Trash2, Star, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

const NAVY = "#0A1628";
const SAFFRON = "#FF6B00";
const GOLD = "#F5A623";

export default function CourseBuilderPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => { getCourses().then((c) => { setCourses(c); setLoading(false); }); }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: NAVY, fontFamily: "Inter, sans-serif" }}>Course Builder</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage courses, weekly blocks, and curriculum structure</p>
        </div>
        <button data-testid="button-new-course"
          onClick={() => toast({ title: "Coming soon", description: "Course creation form is under development." })}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-semibold text-sm"
          style={{ background: SAFFRON }}>
          <Plus className="w-4 h-4" /> New Course
        </button>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 gap-4">{Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-44 rounded-2xl" />)}</div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {courses.map((course) => (
            <div key={course.id} data-testid={`card-course-${course.id}`}
              className="bg-white rounded-2xl border border-border p-5 hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${NAVY}15` }}>
                    <BookOpen className="w-4 h-4" style={{ color: NAVY }} />
                  </div>
                  <div>
                    <span className="text-xs font-medium text-muted-foreground">{course.category}</span>
                    <p className="font-bold text-sm leading-tight" style={{ color: NAVY }}>{course.title}</p>
                  </div>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-green-50 text-green-600 capitalize">{course.status}</span>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2 mb-4">{course.description}</p>
              <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
                <span className="flex items-center gap-1"><Star className="w-3 h-3" fill={GOLD} stroke={GOLD} />{course.rating}</span>
                <span className="flex items-center gap-1"><Users className="w-3 h-3" />{course.enrolledStudents.toLocaleString()}</span>
                <span className="font-semibold" style={{ color: NAVY }}>₹{course.price.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex gap-2">
                <button data-testid={`button-edit-${course.id}`}
                  onClick={() => toast({ title: "Edit mode", description: `Opening editor for: ${course.title}` })}
                  className="flex-1 py-1.5 rounded-lg border border-border text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-muted transition-colors"
                  style={{ color: NAVY }}>
                  <Edit className="w-3.5 h-3.5" /> Edit
                </button>
                <button data-testid={`button-delete-${course.id}`}
                  onClick={() => toast({ title: "Are you sure?", description: "This would remove the course permanently.", variant: "destructive" })}
                  className="px-3 py-1.5 rounded-lg border border-red-200 text-red-500 text-xs font-semibold hover:bg-red-50 transition-colors flex items-center gap-1">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
