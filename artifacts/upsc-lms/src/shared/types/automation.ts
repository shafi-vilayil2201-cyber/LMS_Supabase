/**
 * Automation types for n8n Webhook integrations
 */

export type StudentEventType =
  | "onboarding_start"
  | "study_log"
  | "habit_completed"
  | "session_booking"
  | "telegram_link_sync";

export interface StudentEvent {
  eventType: StudentEventType;
  userId: string;
  telegramChatId: string | null;
  source: "website" | "telegram";
  timestamp: string;
}

export interface OnboardingPayload extends StudentEvent {
  eventType: "onboarding_start";
  metadata: {
    email: string;
    name: string;
    targetProgram?: string;
    yearsPreparing?: number;
    dailyRoutine?: string;
    bedtimeTarget?: string;
  };
}

export interface DailyTaskPayload extends StudentEvent {
  eventType: "study_log";
  text: string;
  metadata: {
    taskType: string;
    title: string;
    status: "completed" | "skipped";
    scoreDelta: number;
    durationMinutes?: number;
  };
}

export interface ProgressEventPayload extends StudentEvent {
  eventType: "habit_completed";
  metadata: {
    habitId: string;
    title: string;
    isCompleted: boolean;
    date: string;
    scoreDelta: number;
  };
}

export interface TelegramLinkPayload extends StudentEvent {
  eventType: "telegram_link_sync";
  metadata: {
    telegramUsername: string;
    linkedAt: string;
  };
}

export interface AutomationResult {
  success: boolean;
  eventId?: string;
  scoreDelta?: number;
  message?: string;
}
