import { StudentEvent, AutomationResult } from "../types/automation";

const N8N_BASE_URL = import.meta.env.VITE_N8N_BASE_URL || "";

// Map endpoint config keys to concrete environment variables
const ENDPOINTS: Record<string, string> = {
  onboarding: import.meta.env.VITE_N8N_ONBOARDING_WEBHOOK || "",
  student_event: import.meta.env.VITE_N8N_STUDENT_EVENT_WEBHOOK || "",
  daily_task: import.meta.env.VITE_N8N_DAILY_TASK_WEBHOOK || "",
  progress: import.meta.env.VITE_N8N_PROGRESS_WEBHOOK || "",
  telegram_link: import.meta.env.VITE_N8N_TELEGRAM_LINK_WEBHOOK || "",
};

/**
 * Post an event payload to a configured n8n webhook endpoint with timeout and retry support.
 */
export async function postToN8n(
  endpointKey: "onboarding" | "student_event" | "daily_task" | "progress" | "telegram_link",
  payload: Partial<StudentEvent> & Record<string, any>,
  retries = 3
): Promise<AutomationResult> {
  const path = ENDPOINTS[endpointKey];
  if (!path) {
    console.warn(`n8nClient: Webhook path for "${endpointKey}" is not defined. Skipping payload submit.`);
    return { success: false, message: `Endpoint for ${endpointKey} not configured` };
  }

  // Construct final URL - check if it's absolute or requires base URL prepending
  const url = path.startsWith("http") ? path : `${N8N_BASE_URL.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;

  for (let attempt = 1; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout limit

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...payload,
          timestamp: payload.timestamp || new Date().toISOString(),
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        // Retry on 5xx server errors, fail early on client errors (4xx)
        if (response.status >= 500 && attempt < retries) {
          console.warn(`n8nClient: Server returned ${response.status} (attempt ${attempt}/${retries}). Retrying...`);
          await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
          continue;
        }
        throw new Error(`Server responded with HTTP status ${response.status}`);
      }

      const resData = await response.json();
      return {
        success: true,
        eventId: resData.eventId || resData.id || undefined,
        scoreDelta: resData.scoreDelta || undefined,
        message: resData.message || "Event synced successfully",
      };
    } catch (err: any) {
      clearTimeout(timeoutId);
      const isTimeout = err.name === "AbortError";
      const errorMsg = isTimeout ? "Request timed out after 6 seconds" : err.message || "Network request failed";

      if (attempt === retries) {
        console.error(`n8nClient: Failed posting to ${endpointKey} after ${retries} attempts:`, errorMsg);
        return { success: false, message: errorMsg };
      }

      // Exponential backoff wait before retrying
      await new Promise((resolve) => setTimeout(resolve, 500 * Math.pow(2, attempt)));
    }
  }

  return { success: false, message: "Unknown error occurred" };
}
