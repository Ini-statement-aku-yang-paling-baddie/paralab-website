import type { ReactNode } from "react";
import { Cpu, Gavel, Radio, ShieldQuestion, UserCheck } from "lucide-react";
import { LAPIS, type LapisKlaim } from "@/lib/paralab/kontrak";

const IKON: Record<LapisKlaim, typeof Cpu> = {
  rule: Gavel,
  sensor: Radio,
  prediksi: Cpu,
  manusia: UserCheck,
  heuristik: ShieldQuestion,
};

const NADA: Record<LapisKlaim, string> = {
  rule: "border-l-[var(--chart-3)] bg-secondary/60",
  sensor: "border-l-[var(--chart-1)] bg-secondary/60",
  prediksi: "border-l-warning bg-warning-soft/50",
  manusia: "border-l-success bg-success-soft/40",
  heuristik: "border-l-warning bg-warning-soft/50",
};

/**
 * Penanda asal sebuah angka.
 *
 * Architecture v5 §13 poin 6 menuntut setiap layar memisahkan evidence, rule
 * deterministik, prediksi synthetic-demo, dan keputusan manusia. Komponen ini
 * adalah cara website memenuhi tuntutan itu: ia menempel pada kartu yang
 * menampilkan angka, dan menyebutkan dari mana angka tersebut berasal.
 */
export function BandProvenance({
  lapis,
  tambahan,
  children,
}: {
  lapis: LapisKlaim;
  tambahan?: string;
  children?: ReactNode;
}) {
  const Ikon = IKON[lapis];
  const def = LAPIS[lapis];

  return (
    <div className={"mb-3 border-l-2 px-3 py-2 " + NADA[lapis]}>
      <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-foreground">
        <Ikon className="size-3.5" aria-hidden="true" />
        {def.label}
      </p>
      <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
        {def.teks}
        {tambahan ? " " + tambahan : ""}
      </p>
      {children}
    </div>
  );
}

/** Daftar batas yang ikut ditampilkan bersama keluaran model. */
export function DaftarBatas({ judul, batas }: { judul: string; batas: string[] }) {
  if (batas.length === 0) return null;
  return (
    <div className="mt-3 border-t border-border pt-3">
      <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">{judul}</p>
      <ul className="mt-1.5 list-disc space-y-1 pl-4 text-[11px] leading-relaxed text-muted-foreground">
        {batas.map((b, i) => (
          <li key={i}>{b}</li>
        ))}
      </ul>
    </div>
  );
}

/** Jejak rule: ID, versi, dan sumber, supaya keluaran F2 dapat diaudit. */
export function JejakRule({
  ruleId,
  ruleVersion,
  sourceId,
}: {
  ruleId: string;
  ruleVersion: string;
  sourceId: string;
}) {
  return (
    <span className="font-mono text-[10px] text-muted-foreground">
      {ruleId} · v{ruleVersion} · {sourceId}
    </span>
  );
}
