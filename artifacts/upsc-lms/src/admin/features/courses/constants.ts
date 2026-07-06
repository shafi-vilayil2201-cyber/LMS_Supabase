// ─── Design Tokens ───────────────────────────────────────────────────────────

export const NAVY = "#0A1628";
export const GREEN = "#009E2C";
export const TEAL = "#1A7F8E";

// ─── Form Helpers ────────────────────────────────────────────────────────────

export function getNumber(formData: FormData, key: string): number {
  return Number(formData.get(key) || 0);
}

export function getString(formData: FormData, key: string): string {
  return String(formData.get(key) || "").trim();
}

export function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Request failed.";
}
