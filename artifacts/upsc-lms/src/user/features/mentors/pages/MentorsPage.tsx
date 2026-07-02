import { useEffect, useState } from "react";
import { getUsers, bookSession } from "@/shared/services/db";
import { Star, Users, Video, MessageSquare, ChevronRight, Filter, Calendar as CalendarIcon, Clock } from "lucide-react";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { useToast } from "@/shared/hooks/use-toast";
import { useAuthStore } from "@/user/features/auth/store/authStore";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/shared/components/ui/dialog";

const NAVY = "#0A1628";
const SAFFRON = "#009E2C";
const GOLD = "#009E2C";
const TEAL = "#1A7F8E";

const subjectFilters = ["All", "History", "Polity", "Geography", "Economy", "Ethics", "Environment", "Security"];

export default function MentorsPage() {
  const [mentors, setMentors] = useState<any[]>([]);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  const { currentUser } = useAuthStore();
  const [bookingMentor, setBookingMentor] = useState<any | null>(null);
  const [bookingSubject, setBookingSubject] = useState("");
  const [bookingType, setBookingType] = useState("Weekly Review");
  const [bookingSlot, setBookingSlot] = useState("");
  const [bookingDate, setBookingDate] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    getUsers().then((users) => {
      const approved = users.filter((u: any) => u.role === "mentor" && u.approvalStatus === "approved");
      setMentors(approved);
      setLoading(false);
    });
  }, []);

  const filtered = filter === "All" ? mentors : mentors.filter((m) => m.expertise?.some((e: string) => e.includes(filter)));

  function handleBook(mentor: any) {
    setBookingMentor(mentor);
    if (mentor.expertise && mentor.expertise.length > 0) {
      setBookingSubject(mentor.expertise[0]);
    } else {
      setBookingSubject("General Guidance");
    }
    setBookingSlot("");
    setBookingDate("");
  }

  function convertTimeTo24h(timeStr: string) {
    if (!timeStr) return "10:00";
    const [time, modifier] = timeStr.split(" ");
    let [hours, minutes] = time.split(":");
    if (hours === "12") {
      hours = "00";
    }
    if (modifier === "PM") {
      hours = (parseInt(hours, 10) + 12).toString();
    }
    return `${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}`;
  }

  async function submitBooking(e: React.FormEvent) {
    e.preventDefault();
    if (!bookingMentor || !currentUser) return;
    if (!bookingSubject || !bookingDate || !bookingSlot) {
      toast({ title: "Validation error", description: "Please fill in all booking options.", variant: "destructive" });
      return;
    }

    setBookingLoading(true);
    try {
      const slotTime = bookingSlot.includes("-") ? bookingSlot.split("-")[1] : bookingSlot;
      const scheduledAt = new Date(`${bookingDate}T${convertTimeTo24h(slotTime)}:00Z`).toISOString();
      const session = {
        mentorId: bookingMentor.id,
        studentId: currentUser.id,
        type: bookingType,
        subject: bookingSubject,
        scheduledAt,
        durationMins: bookingType === "1-on-1 Clarification" ? 30 : 60,
        status: "Booked",
        meetLink: `https://meet.igen.com/session-${Math.random().toString(36).substring(2, 9)}`,
      };
      await bookSession(session);
      toast({ title: "Session Booked!", description: `Successfully booked ${bookingType} with ${bookingMentor.name}` });
      setBookingMentor(null);
      setBookingSlot("");
      setBookingDate("");
    } catch (err: any) {
      toast({ title: "Booking failed", description: err.message || "Database write error", variant: "destructive" });
    } finally {
      setBookingLoading(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: NAVY, fontFamily: "Inter, sans-serif" }}>Expert Mentors</h1>
        <p className="text-sm text-muted-foreground mt-1">Hand-picked IAS officers, professors, and subject experts. All super-admin approved.</p>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        {subjectFilters.map((f) => (
          <button key={f} onClick={() => setFilter(f)} data-testid={`button-filter-${f.toLowerCase()}`}
            className="px-3 py-1.5 rounded-lg text-xs font-medium border transition-all"
            style={filter === f ? { background: NAVY, color: "white", borderColor: NAVY } : { background: "white", color: "#374151", borderColor: "#e5e7eb" }}>
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 gap-5">{Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-56 rounded-2xl" />)}</div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-5">
          {filtered.map((mentor) => (
            <div key={mentor.id} data-testid={`card-mentor-${mentor.id}`}
              className="bg-white rounded-2xl border border-border p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold text-white flex-shrink-0"
                  style={{ background: NAVY }}>{mentor.name.charAt(0)}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm" style={{ color: NAVY }}>{mentor.name}</p>
                  <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{mentor.city}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="w-3 h-3" fill={i < Math.floor(mentor.rating ?? 0) ? GOLD : "none"} stroke={GOLD} />
                    ))}
                    <span className="text-xs text-muted-foreground ml-1">{mentor.rating} ({mentor.totalReviews})</span>
                  </div>
                </div>
              </div>

              {mentor.bio && (
                <p className="text-xs text-muted-foreground leading-relaxed mb-4 line-clamp-2">{mentor.bio}</p>
              )}

              <div className="flex flex-wrap gap-1.5 mb-4">
                {(mentor.expertise ?? []).slice(0, 4).map((e: string) => (
                  <span key={e} className="text-xs px-2 py-0.5 rounded-md font-medium"
                    style={{ background: `${TEAL}15`, color: TEAL }}>{e}</span>
                ))}
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-border text-xs text-muted-foreground mb-4">
                <span className="flex items-center gap-1"><Video className="w-3.5 h-3.5" />{mentor.totalSessions} sessions</span>
                <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{mentor.studentsGuided} students</span>
              </div>

              <div className="flex gap-2">
                <button onClick={() => handleBook(mentor)} data-testid={`button-book-${mentor.id}`}
                  className="flex-1 py-2 rounded-xl text-white text-xs font-semibold transition-opacity hover:opacity-90"
                  style={{ background: SAFFRON }}>
                  Book Session
                </button>
                <button data-testid={`button-profile-${mentor.id}`}
                  className="px-3 py-2 rounded-xl text-xs font-semibold border border-border hover:bg-muted transition-colors flex items-center gap-1"
                  style={{ color: NAVY }}>
                  Profile <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-2 text-center py-16 text-muted-foreground">
              <MessageSquare className="w-8 h-8 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No mentors found for this subject.</p>
            </div>
          )}
        </div>
      )}

      {/* Booking Dialog */}
      <Dialog open={!!bookingMentor} onOpenChange={(open) => !open && setBookingMentor(null)}>
        <DialogContent className="max-w-md bg-white rounded-2xl p-6 border border-border">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold" style={{ color: NAVY }}>
              Book Session with {bookingMentor?.name}
            </DialogTitle>
            <p className="text-xs text-muted-foreground">Select subject, slot and date to confirm your slot.</p>
          </DialogHeader>
          
          <form onSubmit={submitBooking} className="space-y-4 mt-2">
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: NAVY }}>Select Subject</label>
              <select
                value={bookingSubject}
                onChange={(e) => setBookingSubject(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background text-foreground"
                required
              >
                {(bookingMentor?.expertise || []).map((exp: string) => (
                  <option key={exp} value={exp} className="text-foreground">{exp}</option>
                ))}
                <option value="General Guidance" className="text-foreground">General Guidance</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: NAVY }}>Session Type</label>
              <select
                value={bookingType}
                onChange={(e) => setBookingType(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background text-foreground"
                required
              >
                <option value="Weekly Review" className="text-foreground">Weekly Review (60 mins)</option>
                <option value="1-on-1 Clarification" className="text-foreground">1-on-1 Clarification (30 mins)</option>
                <option value="Group Discussion" className="text-foreground">Group Discussion (60 mins)</option>
                <option value="Mock Interview" className="text-foreground">Mock Interview (60 mins)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: NAVY }}>Select Date</label>
              <input
                type="date"
                value={bookingDate}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => setBookingDate(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background text-foreground"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: NAVY }}>Available Time Slots</label>
              {bookingMentor?.availability && bookingMentor.availability.length > 0 ? (
                <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto p-1 border border-border/50 rounded-xl">
                  {bookingMentor.availability.map((s: string) => {
                    const [day, time] = s.split("-");
                    const isSelected = bookingSlot === s;
                    let matchesDay = true;
                    if (bookingDate) {
                      const dateObj = new Date(bookingDate);
                      const dayName = dateObj.toLocaleDateString("en-US", { weekday: "long" });
                      matchesDay = dayName.toLowerCase() === day.toLowerCase();
                    }
                    
                    return (
                      <button
                        type="button"
                        key={s}
                        onClick={() => setBookingSlot(s)}
                        className={`text-xs p-2 rounded-lg border text-center transition-all flex flex-col items-center justify-center ${
                          isSelected 
                            ? "bg-green-500 text-white border-green-500 font-semibold" 
                            : !matchesDay && bookingDate 
                              ? "bg-muted/40 text-muted-foreground/60 border-border/40 cursor-not-allowed"
                              : "bg-background text-foreground border-border hover:bg-muted/50"
                        }`}
                      >
                        <span className="font-semibold">{time}</span>
                        <span className="text-[10px] opacity-80">{day.slice(0, 3)}</span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground text-center py-4 bg-muted/30 rounded-xl border border-dashed border-border">
                  No availability slots configured. Please contact the mentor.
                </p>
              )}
            </div>

            <DialogFooter className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setBookingMentor(null)}
                className="px-4 py-2 border border-border rounded-xl text-xs font-semibold hover:bg-muted transition-colors text-muted-foreground"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={bookingLoading}
                className="px-5 py-2 text-white text-xs font-semibold rounded-xl transition-opacity hover:opacity-90 disabled:opacity-60"
                style={{ background: SAFFRON }}
              >
                {bookingLoading ? "Booking..." : "Confirm Booking"}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
