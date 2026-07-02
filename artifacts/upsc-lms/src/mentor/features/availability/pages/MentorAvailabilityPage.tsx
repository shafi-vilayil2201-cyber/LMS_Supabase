import { useEffect, useState } from "react";
import { useToast } from "@/shared/hooks/use-toast";
import { Clock, CheckCircle, Save } from "lucide-react";
import { useAuthStore } from "@/user/features/auth/store/authStore";
import { saveMentorAvailability } from "@/shared/services/db";

const NAVY = "#0A1628";
const SAFFRON = "#009E2C";

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const slots = ["9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM", "6:00 PM", "7:00 PM"];

export default function MentorAvailabilityPage() {
  const { toast } = useToast();
  const { currentUser, refreshUser } = useAuthStore();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (currentUser?.availability) {
      setSelected(new Set(currentUser.availability));
    }
  }, [currentUser]);

  function toggle(slot: string) {
    setSelected((prev) => { const next = new Set(prev); if (next.has(slot)) next.delete(slot); else next.add(slot); return next; });
  }

  async function handleSave() {
    if (!currentUser?.id) return;
    setSaving(true);
    try {
      await saveMentorAvailability(currentUser.id, Array.from(selected));
      await refreshUser();
      toast({ title: "Availability saved!", description: `${selected.size} time slots marked as available.` });
    } catch (err: any) {
      toast({ title: "Save failed", description: err.message || "Database write error", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: NAVY, fontFamily: "Inter, sans-serif" }}>My Availability</h1>
          <p className="text-sm text-muted-foreground mt-1">Set your available time slots so students can book sessions</p>
        </div>
        <button onClick={handleSave} disabled={saving} data-testid="button-save-availability"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-semibold text-sm transition-opacity disabled:opacity-60"
          style={{ background: SAFFRON }}>
          <Save className="w-4 h-4" /> {saving ? "Saving..." : "Save Schedule"}
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-border p-6">
        <div className="flex items-center justify-between mb-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5"><div className="w-3.5 h-3.5 rounded border border-border" /> Not available</span>
          <span className="flex items-center gap-1.5"><div className="w-3.5 h-3.5 rounded" style={{ background: SAFFRON }} /> Available</span>
          <span className="font-medium" style={{ color: NAVY }}>{selected.size} slots selected</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full" data-testid="table-availability">
            <thead>
              <tr>
                <th className="text-left px-2 py-2 text-xs font-semibold text-muted-foreground w-24">Time</th>
                {days.map((d) => <th key={d} className="px-2 py-2 text-center text-xs font-semibold text-muted-foreground">{d.slice(0, 3)}</th>)}
              </tr>
            </thead>
            <tbody>
              {slots.map((slot) => (
                <tr key={slot} className="border-t border-border/50">
                  <td className="px-2 py-2 text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />{slot}
                  </td>
                  {days.map((day) => {
                    const key = `${day}-${slot}`;
                    const active = selected.has(key);
                    return (
                      <td key={day} className="px-2 py-2 text-center">
                        <button onClick={() => toggle(key)} data-testid={`slot-${day}-${slot.replace(/\s|:/g, "-")}`}
                          className="w-8 h-8 rounded-lg mx-auto flex items-center justify-center transition-all border"
                          style={active ? { background: SAFFRON, borderColor: SAFFRON } : { background: "#f8f9fa", borderColor: "#e5e7eb" }}>
                          {active && <CheckCircle className="w-4 h-4 text-white" />}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
