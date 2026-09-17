import { useRef, useState } from "react";
import { FileSearch, Send, ShieldCheck, X } from "lucide-react";
import { ModelApiError, postJson } from "@/lib/paralab/api";

export type F1EvidenceCard = {
  source_id: string;
  hybrid_score?: number;
  outcome?: string;
  failure_mode?: string;
  journal_title?: string;
};

export type F1QueryResponse = {
  query: string;
  evidence_status: string;
  evidence: F1EvidenceCard[];
  answer: { summary: string; limitations: string } | null;
  requires_human_review?: boolean;
  limitations?: string[];
};

type Pesan = {
  peran: "ai" | "user";
  teks?: string;
  hasil?: F1QueryResponse;
  galat?: string;
};

const SARAN = [
  "Ringkas jurnal ini",
  "Bahan apa yang paling berisiko",
  "Bagaimana status halal dan BPOM",
  "Parameter mana yang belum terisi",
  "Berapa perkiraan HPP",
  "Apa rekomendasi untuk batch berikutnya",
];

type Props = {
  judul: string;
  batchNomor: number;
  onTutup: () => void;
};

export function DocCopilot({ judul, batchNomor, onTutup }: Props) {
  const [pesan, setPesan] = useState<Pesan[]>([
    {
      peran: "ai",
      teks:
        "Copilot ini menjawab dari korpus evidence, bukan dari isi jurnal lokal. " +
        "Konteks: " +
        judul +
        " batch " +
        batchNomor +
        ".",
    },
  ]);
  const [teks, setTeks] = useState("");
  const [memuat, setMemuat] = useState(false);
  const akhir = useRef<HTMLDivElement>(null);

  async function kirim(isi: string) {
    const bersih = isi.trim();
    if (bersih.length === 0 || memuat) return;

    setPesan((sebelumnya) => [...sebelumnya, { peran: "user", teks: bersih }]);
    setTeks("");
    setMemuat(true);

    try {
      const hasil = await postJson<F1QueryResponse>("/v1/f1/query", { query: bersih });
      setPesan((sebelumnya) => [...sebelumnya, { peran: "ai", hasil }]);
    } catch (cause) {
      const galat =
        cause instanceof ModelApiError
          ? cause.message
          : "Gateway model tidak dapat dihubungi.";
      setPesan((sebelumnya) => [...sebelumnya, { peran: "ai", galat }]);
    } finally {
      setMemuat(false);
      window.setTimeout(() => akhir.current?.scrollIntoView({ behavior: "smooth" }), 50);
    }
  }

  return (
    <aside className="fixed right-0 top-0 z-30 flex h-screen w-full max-w-sm flex-col border-l border-border bg-card shadow-xl print:hidden">
      <header className="flex items-center justify-between border-b border-border px-4 py-3">
        <div>
          <p className="text-sm font-bold text-foreground">AI Copilot Jurnal</p>
          <p className="text-xs text-muted-foreground">
            Menjawab dari korpus evidence F1 dengan sumber yang bisa diaudit
          </p>
        </div>
        <button
          onClick={onTutup}
          className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
          aria-label="Tutup copilot"
        >
          <X className="size-4" />
        </button>
      </header>

      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {pesan.map((m, i) => (
          <div key={i} className={m.peran === "user" ? "flex justify-end" : ""}>
            {m.peran === "user" && (
              <p className="max-w-[85%] rounded-2xl bg-primary px-3 py-2 text-sm text-primary-foreground">
                {m.teks}
              </p>
            )}

            {m.peran === "ai" && m.teks && (
              <p className="max-w-[92%] text-sm leading-6 text-foreground">{m.teks}</p>
            )}

            {m.peran === "ai" && m.galat && (
              <p className="rounded-xl border border-danger/40 bg-danger-soft px-3 py-2 text-sm text-danger">
                Gateway model menolak permintaan: {m.galat}
              </p>
            )}

            {m.peran === "ai" && m.hasil && <HasilF1 hasil={m.hasil} />}
          </div>
        ))}
        <div ref={akhir} />
      </div>

      <div className="flex flex-wrap gap-1.5 border-t border-border px-4 py-2">
        {SARAN.map((s) => (
          <button
            key={s}
            onClick={() => kirim(s)}
            className="rounded-full border border-border px-2.5 py-1 text-[11px] font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            {s}
          </button>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void kirim(teks);
        }}
        className="flex items-center gap-2 border-t border-border px-4 py-3"
      >
        <input
          value={teks}
          onChange={(e) => setTeks(e.target.value)}
          placeholder="Tanya tentang jurnal ini"
          className="h-10 flex-1 rounded-xl border border-input bg-card px-3 text-sm outline-none focus:border-brand"
        />
        <button
          type="submit"
          className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground"
          aria-label="Kirim"
        >
          <Send className="size-4" />
        </button>
      </form>
    </aside>
  );
}

function HasilF1({ hasil }: { hasil: F1QueryResponse }) {
  if (!hasil.answer) {
    return (
      <div className="max-w-[92%] space-y-1.5">
       {(hasil.limitations ?? ["Evidence tidak cukup untuk menjawab pertanyaan ini."]).map(
          (limitation) => (
            <p key={limitation} className="text-sm leading-6 text-muted-foreground">
              {limitation}
            </p>
          ),
        )}
      </div>
    );
  }

  return (
    <div className="max-w-[92%] space-y-2.5">
      <p className="text-sm leading-6 text-foreground">{hasil.answer.summary}</p>

      {hasil.evidence.length > 0 && (
        <div className="space-y-1.5">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
            <FileSearch className="size-3.5" /> Sumber evidence
          </p>
          {hasil.evidence.map((kartu) => (
            <div key={kartu.source_id} className="rounded-xl border border-border px-3 py-2 text-xs">
              <p className="font-mono font-semibold text-foreground">{kartu.source_id}</p>
              {(kartu.outcome ?? kartu.failure_mode) && (
                <p className="mt-0.5 text-muted-foreground">
                  {[kartu.outcome, kartu.failure_mode].filter(Boolean).join(" · ")}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
        <ShieldCheck className="mt-0.5 size-3.5 shrink-0" />
        {hasil.answer.limitations}
      </p>
    </div>
  );
}
