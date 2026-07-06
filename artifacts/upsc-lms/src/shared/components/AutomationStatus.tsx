import { useAuthStore } from "@/user/features/auth/store/authStore";
import { MessageSquare, CheckCircle, AlertCircle, HelpCircle } from "lucide-react";

export default function AutomationStatus() {
  const { currentUser } = useAuthStore();

  if (!currentUser || currentUser.role !== "student") return null;

  const isLinked = !!currentUser.telegram_chat_id;
  const username = currentUser.telegram_username || "";
  const lastSyncStr = currentUser.lastLogin
    ? new Date(currentUser.lastLogin).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
    : "Just now";

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
        isLinked
          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
          : "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400"
      }`}
      title={isLinked ? `Synced with Telegram bot: @${username}` : "Telegram account connection pending"}
    >
      {isLinked ? (
        <>
          <CheckCircle className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
          <span className="hidden sm:inline">Bot Linked ({lastSyncStr})</span>
          <span className="sm:hidden">Linked</span>
        </>
      ) : (
        <>
          <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
          <span className="hidden sm:inline">Link Bot to Activate Path</span>
          <span className="sm:hidden">Bot Pending</span>
        </>
      )}
    </div>
  );
}
