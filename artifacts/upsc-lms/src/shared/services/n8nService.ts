/**
 * n8n Integration Service
 * Manages webhook triggers and communications between the frontend LMS and the n8n automation layer.
 */

const N8N_WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL || "";

export interface WebhookEventPayload {
  eventType: string;
  userId: string;
  telegramChatId?: string;
  source: "website" | "telegram";
  text?: string;
  metadata?: Record<string, any>;
}

/**
 * Triggers a generic event webhook to n8n.
 */
export async function triggerN8nEvent(payload: WebhookEventPayload): Promise<{ success: boolean; data?: any; error?: string }> {
  if (!N8N_WEBHOOK_URL) {
    console.warn("n8n Integration: VITE_N8N_WEBHOOK_URL is not defined. Skipping webhook trigger.");
    return { success: false, error: "Webhook URL not configured" };
  }

  try {
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        event_type: payload.eventType,
        user_id: payload.userId,
        telegram_chat_id: payload.telegramChatId || null,
        source: payload.source,
        text: payload.text || "",
        metadata: payload.metadata || {},
        timestamp: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      throw new Error(`n8n webhook responded with status: ${response.status}`);
    }

    const responseData = await response.json();
    return { success: true, data: responseData };
  } catch (error: any) {
    console.error("n8n Webhook Error:", error);
    return { success: false, error: error.message || "Failed to call n8n webhook" };
  }
}

/**
 * Trigger onboarding session initialization when a user registers or starts onboarding.
 */
export async function triggerOnboardingStart(userId: string, email: string): Promise<boolean> {
  const res = await triggerN8nEvent({
    eventType: "onboarding_start",
    userId,
    source: "website",
    metadata: { email },
  });
  return res.success;
}

/**
 * Trigger task status updates (e.g. daily checklist saves, test attempts).
 */
export async function triggerTaskUpdate(
  userId: string,
  taskType: string,
  title: string,
  status: "completed" | "skipped",
  scoreDelta: number
): Promise<boolean> {
  const res = await triggerN8nEvent({
    eventType: "study_log",
    userId,
    source: "website",
    text: `Completed task: ${title}`,
    metadata: {
      taskType,
      title,
      status,
      scoreDelta,
    },
  });
  return res.success;
}
