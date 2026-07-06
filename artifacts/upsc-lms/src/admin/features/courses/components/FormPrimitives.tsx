import { Plus } from "lucide-react";
import { GREEN, NAVY } from "../constants";

// ─── Panel ───────────────────────────────────────────────────────────────────

export function Panel({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <div
          className="flex h-9 w-9 items-center justify-center rounded-xl"
          style={{ background: `${GREEN}14` }}
        >
          <Icon className="h-4 w-4" style={{ color: GREEN }} />
        </div>
        <h2 className="text-base font-bold" style={{ color: NAVY }}>
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}

// ─── Field ───────────────────────────────────────────────────────────────────

export function Field({
  label,
  name,
  placeholder,
  type = "text",
  required = true,
  min,
  max,
}: {
  label: string;
  name: string;
  placeholder?: string;
  type?: "text" | "number";
  required?: boolean;
  min?: number;
  max?: number;
}) {
  return (
    <label className="space-y-1.5 block">
      <span className="text-xs font-semibold text-slate-500">{label}</span>
      <input
        name={name}
        type={type}
        min={min}
        max={max}
        required={required}
        placeholder={placeholder}
        className="h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-[#009E2C] focus:ring-4 focus:ring-[#009E2C]/15"
      />
    </label>
  );
}

// ─── TextArea ────────────────────────────────────────────────────────────────

export function TextArea({
  label,
  name,
  placeholder,
  required = true,
}: {
  label: string;
  name: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="space-y-1.5 block">
      <span className="text-xs font-semibold text-slate-500">{label}</span>
      <textarea
        name={name}
        required={required}
        placeholder={placeholder}
        className="min-h-24 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-[#009E2C] focus:ring-4 focus:ring-[#009E2C]/15"
      />
    </label>
  );
}

// ─── SubmitButton ────────────────────────────────────────────────────────────

export function SubmitButton({
  children,
  disabled,
}: {
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="submit"
      disabled={disabled}
      className="inline-flex h-10 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
      style={{ background: GREEN }}
    >
      <Plus className="h-4 w-4" />
      {children}
    </button>
  );
}

// ─── SelectField ─────────────────────────────────────────────────────────────

export function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder = "Select…",
}: {
  label: string;
  value: number | string | null;
  onChange: (value: number | null) => void;
  options: { id: number; label: string }[];
  placeholder?: string;
}) {
  return (
    <label className="space-y-1.5 block">
      <span className="text-xs font-semibold text-slate-500">{label}</span>
      <select
        value={value ?? ""}
        onChange={(e) => onChange(Number(e.target.value) || null)}
        className="h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none"
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.id} value={opt.id}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}
