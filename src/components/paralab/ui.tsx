import type { ReactNode } from "react";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={"surface-card p-5 " + className}>{children}</section>;
}

export function CardTitle({
  title,
  sub,
  right,
}: {
  title: string;
  sub?: string;
  right?: ReactNode;
}) {
  return (
    <div className="mb-4 flex items-start justify-between gap-3">
      <div>
        <h2 className="text-base font-bold tracking-tight text-foreground">{title}</h2>
        {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
      </div>
      {right}
    </div>
  );
}

const tone: Record<string, string> = {
  netral: "bg-secondary text-secondary-foreground",
  brand: "bg-brand-soft text-brand-ink",
  aman: "bg-success-soft text-success",
  waspada: "bg-warning-soft text-warning",
  bahaya: "bg-danger-soft text-danger",
};

export function Pill({
  children,
  variant = "netral",
}: {
  children: ReactNode;
  variant?: keyof typeof tone;
}) {
  return (
    <span
      className={
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold " +
        tone[variant]
      }
    >
      {children}
    </span>
  );
}

export function StatStrip({ children }: { children: ReactNode }) {
  return (
    <div
      className={
        "grid border border-border bg-card sm:grid-cols-2 xl:grid-cols-4 " +
        "[&>*:nth-child(n+2)]:border-t " +
        "sm:[&>*:nth-child(-n+2)]:border-t-0 sm:[&>*:nth-child(2n)]:border-l " +
        "xl:[&>*:nth-child(n+2)]:border-l xl:[&>*:nth-child(n+2)]:border-t-0"
      }
    >
      {children}
    </div>
  );
}

export function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="px-5 py-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <div className="mt-1 flex items-baseline gap-2">
        <strong className="font-display text-2xl font-semibold text-foreground">{value}</strong>
        {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
      </div>
    </div>
  );
}

export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-foreground">{label}</span>
      {hint && <span className="mt-0.5 block text-xs text-muted-foreground">{hint}</span>}
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

export const inputClass =
  "w-full rounded-xl border border-input bg-card px-3 py-2 text-sm text-foreground outline-none transition-shadow placeholder:text-muted-foreground focus:ring-2 focus:ring-ring";

export function PrimaryButton({
  children,
  onClick,
  type = "button",
  disabled,
  className = "",
}: {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={
        "brand-gradient inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 " +
        className
      }
    >
      {children}
    </button>
  );
}

export function GhostButton({
  children,
  onClick,
  className = "",
}: {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-3.5 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-secondary " +
        className
      }
    >
      {children}
    </button>
  );
}
