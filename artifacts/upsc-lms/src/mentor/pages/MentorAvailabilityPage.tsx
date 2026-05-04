import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Clock, CheckCircle, Save } from "lucide-react";

const NAVY = "#0A1628";
const SAFFRON = "#FF6B00";

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const slots = ["9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM", "6:00 PM", "7:00 PM"];

export default function MentorAvailabilityPage() {
  const { toast } = useToast();
  const [selected, setSelected] = useState<Set<string>>(new Set(["Monday-10:00 AM", "Monday-4:00 PM", "Wednesday-10:00 AM", "Saturday-10:00 AM", "Saturday-11:00 AM"]));

  function toggle(slot: string) {
    setSelected((prev) => { const next = new Set(prev); if (next.has(slot)) next.delete(slot); else next.add(slot); return next; });
  }

  function handleSave() {
    toast({ title: "Availability saved!", description: `${selected.size} time slots marked as available.` });
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: NAVY, fontFamily: "Inter, sans-serif" }}>My Availability</h1>
          <p className="text-sm text-muted-foreground mt-1">Set your available time slots so students can book sessions</p>
        </div>
        <button onClick={handleSave} data-testid="button-save-availability"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-semibold text-sm"
          style={{ background: SAFFRON }}>
          <Save className="w-4 h-4" /> Save Schedule
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
