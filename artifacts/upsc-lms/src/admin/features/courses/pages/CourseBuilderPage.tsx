import { useEffect, useState } from "react";
import { getCourses, createCourse, updateCourse, deleteCourse } from "@/shared/services/db";
import { BookOpen, Plus, Edit, Trash2, Star, Users } from "lucide-react";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { useToast } from "@/shared/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/shared/components/ui/dialog";

const NAVY = "#0A1628";
const SAFFRON = "#009E2C";
const GOLD = "#009E2C";

export default function CourseBuilderPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Form states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<any | null>(null);
  const [formTitle, setFormTitle] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formCategory, setFormCategory] = useState("Subject Specific");
  const [formPrice, setFormPrice] = useState("5000");
  const [formInstructor, setFormInstructor] = useState("Dr. Ramesh Kumar");
  const [formDurationWeeks, setFormDurationWeeks] = useState("8");
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => { getCourses().then((c) => { setCourses(c); setLoading(false); }); }, []);

  function openCreate() {
    setEditingCourse(null);
    setFormTitle("");
    setFormDesc("");
    setFormCategory("Subject Specific");
    setFormPrice("5000");
    setFormInstructor("Dr. Ramesh Kumar");
    setFormDurationWeeks("8");
    setModalOpen(true);
  }

  function openEdit(course: any) {
    setEditingCourse(course);
    setFormTitle(course.title);
    setFormDesc(course.description);
    setFormCategory(course.category);
    setFormPrice(course.price.toString());
    setFormInstructor(course.instructor);
    setFormDurationWeeks((course.durationWeeks || 8).toString());
    setModalOpen(true);
  }

  async function handleDelete(courseId: string, title: string) {
    if (!window.confirm(`Are you sure you want to permanently delete the course "${title}"?`)) return;
    try {
      await deleteCourse(courseId);
      toast({ title: "Course deleted", description: `${title} was removed successfully.` });
      const c = await getCourses();
      setCourses(c);
    } catch (err: any) {
      toast({ title: "Delete failed", description: err.message || "Database write error", variant: "destructive" });
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormLoading(true);
    try {
      const courseData = {
        title: formTitle,
        description: formDesc,
        category: formCategory,
        price: parseInt(formPrice, 10) || 0,
        instructor: formInstructor,
        durationWeeks: parseInt(formDurationWeeks, 10) || 8,
        duration: `${formDurationWeeks} weeks`,
        status: "active",
        rating: editingCourse ? editingCourse.rating : 4.8,
        enrolledStudents: editingCourse ? editingCourse.enrolledStudents : 0,
        type: formCategory === "Full Year" ? "FullYear" : "SubjectSpecific",
        tags: formCategory === "Full Year" ? ["GS1", "GS2", "Full Year"] : ["Subject Specific"],
        subjects: formCategory === "Full Year" ? ["History", "Polity"] : ["General Core"],
      };

      if (editingCourse) {
        await updateCourse(editingCourse.id, courseData);
        toast({ title: "Course updated!", description: `${formTitle} was updated successfully.` });
      } else {
        const newCourse = {
          id: "c_" + Math.random().toString(36).substring(2, 9),
          ...courseData,
          createdAt: new Date().toISOString()
        };
        await createCourse(newCourse);
        toast({ title: "Course created!", description: `${formTitle} was created successfully.` });
      }

      setModalOpen(false);
      const c = await getCourses();
      setCourses(c);
    } catch (err: any) {
      toast({ title: "Operation failed", description: err.message || "Database write error", variant: "destructive" });
    } finally {
      setFormLoading(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: NAVY, fontFamily: "Inter, sans-serif" }}>Course Builder</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage courses, weekly blocks, and curriculum structure</p>
        </div>
        <button data-testid="button-new-course"
          onClick={openCreate}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-semibold text-sm transition-opacity hover:opacity-90"
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
                <span className="flex items-center gap-1"><Users className="w-3 h-3" />{(course.enrolledStudents || 0).toLocaleString()}</span>
                <span className="font-semibold" style={{ color: NAVY }}>₹{(course.price || 0).toLocaleString("en-IN")}</span>
              </div>
              <div className="flex gap-2">
                <button data-testid={`button-edit-${course.id}`}
                  onClick={() => openEdit(course)}
                  className="flex-1 py-1.5 rounded-lg border border-border text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-muted transition-colors"
                  style={{ color: NAVY }}>
                  <Edit className="w-3.5 h-3.5" /> Edit
                </button>
                <button data-testid={`button-delete-${course.id}`}
                  onClick={() => handleDelete(course.id, course.title)}
                  className="px-3 py-1.5 rounded-lg border border-red-200 text-red-500 text-xs font-semibold hover:bg-red-50 transition-colors flex items-center gap-1">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Course Creation/Editing Dialog */}
      <Dialog open={modalOpen} onOpenChange={(open) => !open && setModalOpen(false)}>
        <DialogContent className="max-w-md bg-white rounded-2xl p-6 border border-border">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold" style={{ color: NAVY }}>
              {editingCourse ? "Edit Course" : "Create New Course"}
            </DialogTitle>
            <p className="text-xs text-muted-foreground">Add or modify course curriculum and pricing details.</p>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: NAVY }}>Course Title</label>
              <input
                type="text"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="e.g. History — Ancient, Medieval & Modern"
                required
                className="w-full px-3 py-2 text-sm rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background text-foreground"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: NAVY }}>Description</label>
              <textarea
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
                placeholder="Course outline and syllabus details..."
                rows={3}
                required
                className="w-full px-3 py-2 text-sm rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background text-foreground"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: NAVY }}>Category</label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background text-foreground"
                >
                  <option value="Subject Specific">Subject Specific</option>
                  <option value="Full Year">Full Year</option>
                  <option value="CSAT">CSAT</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: NAVY }}>Price (INR)</label>
                <input
                  type="number"
                  value={formPrice}
                  onChange={(e) => setFormPrice(e.target.value)}
                  placeholder="e.g. 5000"
                  required
                  className="w-full px-3 py-2 text-sm rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background text-foreground"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: NAVY }}>Instructor Name</label>
                <input
                  type="text"
                  value={formInstructor}
                  onChange={(e) => setFormInstructor(e.target.value)}
                  placeholder="e.g. Dr. Ramesh Kumar"
                  required
                  className="w-full px-3 py-2 text-sm rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background text-foreground"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: NAVY }}>Duration (Weeks)</label>
                <input
                  type="number"
                  value={formDurationWeeks}
                  onChange={(e) => setFormDurationWeeks(e.target.value)}
                  placeholder="e.g. 8"
                  required
                  className="w-full px-3 py-2 text-sm rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background text-foreground"
                />
              </div>
            </div>

            <DialogFooter className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 border border-border rounded-xl text-xs font-semibold hover:bg-muted transition-colors text-muted-foreground"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={formLoading}
                className="px-5 py-2 text-white text-xs font-semibold rounded-xl transition-opacity hover:opacity-90 disabled:opacity-60"
                style={{ background: SAFFRON }}
              >
                {formLoading ? "Saving..." : editingCourse ? "Save Changes" : "Create Course"}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
