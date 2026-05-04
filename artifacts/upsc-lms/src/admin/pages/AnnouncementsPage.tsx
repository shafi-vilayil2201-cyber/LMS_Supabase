import { useEffect, useState } from "react";
import { getAnnouncements } from "../../services/db";
import { Bell, Plus, ToggleLeft, ToggleRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

const NAVY = "#0A1628";
const SAFFRON = "#FF6B00";

const typeColors: Record<string, { bg: string; text: string }> = {
  Important: { bg: "#fef2f2", text: "#dc2626" },
  Event: { bg: "#eff6ff", text: "#2563eb" },
  Info: { bg: `${SAFFRON}15`, text: SAFFRON },
};

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => { getAnnouncements().then((a) => { setAnnouncements(a); setLoading(false); }); }, []);

  function toggleActive(id: string) {
    setAnnouncements((prev) => prev.map((a) => a.id === id ? { ...a, isActive: !a.isActive } : a));
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: NAVY, fontFamily: "Inter, sans-serif" }}>Announcements</h1>
          <p className="text-sm text-muted-foreground mt-1">Broadcast platform-wide messages to all students</p>
        </div>
        <button data-testid="button-new-announcement"
          onClick={() => toast({ title: "New announcement", description: "Form coming soon." })}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-semibold text-sm"
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
                        {" · Expires: "}{new Date(ann.expiresAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                      </p>
                    </div>
                  </div>
                  <button onClick={() => toggleActive(ann.id)} data-testid={`button-toggle-${ann.id}`}
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
    </div>
  );
}
