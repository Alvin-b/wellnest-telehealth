import { ChevronLeft, Star } from "lucide-react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { initials, type Doctor } from "@/lib/tele/data";
import { useTele } from "@/lib/tele/store";

export function Btn({ variant = "primary", className, ...p }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "soft" | "outline" | "accent" | "ghost" }) {
  const v = {
    primary: "bg-gradient-primary text-primary-foreground shadow-card",
    soft: "bg-primary-soft text-primary",
    outline: "border border-border bg-card text-foreground",
    accent: "bg-accent text-accent-foreground",
    ghost: "text-primary",
  }[variant];
  return <button {...p} className={cn("inline-flex h-12 items-center justify-center gap-2 rounded-2xl px-5 text-sm font-bold transition active:scale-[0.98] disabled:opacity-50", v, className)} />;
}

export function Header({ title, right, onBack }: { title: string; right?: ReactNode; onBack?: () => void }) {
  const { back } = useTele();
  return (
    <div className="flex items-center gap-3 px-5 pb-3 pt-2">
      <button onClick={onBack ?? back} aria-label="Back" className="grid h-10 w-10 place-items-center rounded-full bg-card shadow-card">
        <ChevronLeft className="h-5 w-5" />
      </button>
      <h1 className="flex-1 text-lg font-bold">{title}</h1>
      {right}
    </div>
  );
}

export function Avatar({ doctor, size = 56 }: { doctor: Pick<Doctor, "name" | "photo">; size?: number }) {
  return doctor.photo ? (
    <img src={doctor.photo} alt={doctor.name} width={size} height={size} loading="lazy" className="shrink-0 rounded-2xl object-cover" style={{ width: size, height: size }} />
  ) : (
    <div className="grid shrink-0 place-items-center rounded-2xl bg-primary-soft font-display font-bold text-primary" style={{ width: size, height: size, fontSize: size / 3 }}>
      {initials(doctor.name)}
    </div>
  );
}

export function Stars({ value, onChange, size = 14 }: { value: number; onChange?: (n: number) => void; size?: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" disabled={!onChange} onClick={() => onChange?.(n)} aria-label={`${n} stars`}>
          <Star style={{ width: size, height: size }} className={n <= Math.round(value) ? "fill-accent text-accent" : "text-border"} />
        </button>
      ))}
    </div>
  );
}

export function Card({ className, children, onClick }: { className?: string; children: ReactNode; onClick?: () => void }) {
  const C = onClick ? "button" : "div";
  return <C onClick={onClick} className={cn("w-full rounded-3xl bg-card p-4 text-left shadow-card", className)}>{children}</C>;
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-semibold text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

export const inputCls = "h-12 w-full rounded-2xl border border-input bg-card px-4 text-sm outline-none focus:border-ring";
