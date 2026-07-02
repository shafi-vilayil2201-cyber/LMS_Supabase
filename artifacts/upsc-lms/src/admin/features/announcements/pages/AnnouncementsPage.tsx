import { useEffect, useState } from "react";
import { getAnnouncements, createAnnouncement, toggleAnnouncementActive } from "@/shared/services/db";
import { Bell, Plus, ToggleLeft, ToggleRight } from "lucide-react";
import { useToast } from "@/shared/hooks/use-toast";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/shared/components/ui/dialog";

const NAVY = "#0A1628";
const SAFFRON = "#009E2C";

const typeColors: Record<string, { bg: string; text: string }> = {
  Important: { bg: "#fef2f2", text: "#dc2626" },
  Event: { bg: "#eff6ff", text: "#2563eb" },
  Info: { bg: `${SAFFRON}15`, text: SAFFRON },
  Update: { bg: "#faf5ff", text: "#7c3aed" },
  Reminder: { bg: "#fff7ed", text: "#ea580c" },
};

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // New announcement form states
  const [modalOpen, setModalOpen] = useState(false);
  const [annTitle, setAnnTitle] = useState("");
  const [annContent, setAnnContent] = useState("");
  const [annType, setAnnType] = useState("Info");
  const [formLoading, setFormLoading] = useState(false);

  async function loadAnnouncements() {
    setLoading(true);
    try {
      const a = await getAnnouncements();
      setAnnouncements(a);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAnnouncements();
  }, []);

  async function toggleActive(id: string, currentStatus: boolean) {
    try {
      await toggleAnnouncementActive(id, !currentStatus);
      toast({ title: "Status updated!", description: "Announcement visibility has been changed." });
      await loadAnnouncements();
    } catch (err: any) {
      toast({ title: "Toggle failed", description: err.message || "Database write error", variant: "destructive" });
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormLoading(true);
    try {
      const newAnn = {
        id: "an_" + Math.random().toString(36).substring(2, 9),
        title: annTitle,
        content: annContent,
        type: annType,
        publishedAt: new Date().toISOString(),
        isActive: true
      };
      await createAnnouncement(newAnn);
      toast({ title: "Announcement published!", description: `"${annTitle}" is now live.` });
      setModalOpen(false);
      setAnnTitle("");
      setAnnContent("");
      setAnnType("Info");
      await loadAnnouncements();
    } catch (err: any) {
      toast({ title: "Failed to publish", description: err.message || "Database write error", variant: "destructive" });
    } finally {
      setFormLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: NAVY, fontFamily: "Inter, sans-serif" }}>Announcements</h1>
          <p className="text-sm text-muted-foreground mt-1">Broadcast platform-wide messages to all students</p>
        </div>
        <button data-testid="button-new-announcement"
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-semibold text-sm transition-opacity hover:opacity-90"
          style={{ background: SAFFRON }}>
          <Plus className="w-4 h-4" /> New Announcement
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">{Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}</div>
      ) : (
        <div className="space-y-3">
          {announcements.map((ann) => {
            const tc = typeColors[ann.type] ?? { bg: "#f3f4f6", text: "#374151" };
            return (
              <div key={ann.id} data-testid={`card-announcement-${ann.id}`}
                className={`bg-white rounded-2xl border border-border p-5 transition-opacity ${ann.isActive ? "" : "opacity-50"}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: `${NAVY}10` }}>
                      <Bell className="w-4 h-4" style={{ color: NAVY }} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: tc.bg, color: tc.text }}>{ann.type}</span>
                        {!ann.isActive && <span className="text-xs text-muted-foreground">(Hidden)</span>}
                      </div>
                      <p className="font-semibold text-sm" style={{ color: NAVY }}>{ann.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{ann.content}</p>
                      <p className="text-xs text-muted-foreground/60 mt-2">
                        {new Date(ann.publishedAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                        {ann.expiresAt && ` · Expires: ${new Date(ann.expiresAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}`}
                      </p>
                    </div>
                  </div>
                  <button onClick={() => toggleActive(ann.id, ann.isActive)} data-testid={`button-toggle-${ann.id}`}
                    className="flex-shrink-0 p-1 hover:opacity-70 transition-opacity">
                    {ann.isActive
                      ? <ToggleRight className="w-7 h-7" style={{ color: SAFFRON }} />
                      : <ToggleLeft className="w-7 h-7 text-muted-foreground" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* New Announcement Dialog */}
      <Dialog open={modalOpen} onOpenChange={(open) => !open && setModalOpen(false)}>
        <DialogContent className="max-w-md bg-white rounded-2xl p-6 border border-border">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold" style={{ color: NAVY }}>
              New Announcement
            </DialogTitle>
            <p className="text-xs text-muted-foreground">Broadcast a message to all student dashboards.</p>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: NAVY }}>Title</label>
              <input
                type="text"
                value={annTitle}
                onChange={(e) => setAnnTitle(e.target.value)}
                placeholder="e.g. Weekly Mock Test #12 Live"
                required
                className="w-full px-3 py-2 text-sm rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background text-foreground"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: NAVY }}>Content</label>
              <textarea
                value={annContent}
                onChange={(e) => setAnnContent(e.target.value)}
                placeholder="Write announcement details..."
                rows={3}
                required
                className="w-full px-3 py-2 text-sm rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background text-foreground"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: NAVY }}>Announcement Type</label>
              <select
                value={annType}
                onChange={(e) => setAnnType(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background text-foreground"
              >
                <option value="Info">Info</option>
                <option value="Important">Important</option>
                <option value="Event">Event</option>
                <option value="Update">Update</option>
                <option value="Reminder">Reminder</option>
              </select>
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
                {formLoading ? "Publishing..." : "Publish Announcement"}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
