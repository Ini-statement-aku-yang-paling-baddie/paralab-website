import { useMemo, useRef, useState } from "react";
import { FileSearch, Send, ShieldCheck, X } from "lucide-react";
import { formatRupiah, hitungHpp, type Batch, type Project } from "@/lib/paralab/data";
import { PARAM_LIBRARY } from "@/lib/paralab/catalog";
import { deteksiClash, prediksiParameter, ringkasKepatuhan } from "@/lib/paralab/ai";
import { ModelApiError, postJson } from "@/lib/paralab/api";
import { BandProvenance } from "./BandProvenance";
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
  /** True bila jawaban berasal dari rule lokal karena gateway model tidak tersedia. */
  lokal?: boolean;
};

const SARAN = [
  "Ringkas jurnal ini",
  "Bahan apa yang paling berisiko",
  "Bagaimana status halal dan BPOM",
  "Parameter mana yang belum terisi",
  "Berapa perkiraan HPP",
  "Apa rekomendasi untuk batch berikutnya",
];

function jawab(proyek: Project, batch: Batch, tanya: string): string {
  const t = tanya.toLowerCase();
  const clash = deteksiClash(batch.bahan);
  const patuh = ringkasKepatuhan(batch.bahan);
  const hpp = hitungHpp(batch.bahan);
  const kosong = proyek.targets.filter((p) => {
    const h = batch.hasil.find((x) => x.paramId === p.id);
    return !h || h.nilai === null;
  });
  const diluar = proyek.targets.filter((p) => {
    const h = batch.hasil.find((x) => x.paramId === p.id);
    return h && h.nilai !== null && Math.abs(h.nilai - p.target) > p.toleransi;
  });

  if (t.includes("hpp") || t.includes("biaya") || t.includes("harga")) {
    const mahal = [...batch.bahan].sort(
      (a, b) => b.percent * b.hargaPerKg - a.percent * a.hargaPerKg,
    )[0];
    return (
      "Perkiraan harga pokok batch " +
      batch.nomor +
      " adalah " +
      formatRupiah(hpp.total) +
      " per kemasan 50 ml, terdiri dari bahan baku " +
      formatRupiah(hpp.per50ml) +
      ", kemasan " +
      formatRupiah(hpp.kemasan) +
      ", dan proses " +
      formatRupiah(hpp.produksi) +
      (mahal
        ? ". Penyumbang biaya terbesar adalah " +
          mahal.name +
          " pada kadar " +
          mahal.percent +
          " persen."
        : ".")
    );
  }

  if (t.includes("halal") || t.includes("bpom") || t.includes("regulasi")) {
    return (
      "Skrining rule prototipe versi " +
      patuh.ruleVersion +
      " menghasilkan status " +
      patuh.label +
      ". Ini bukan persetujuan BPOM atau halal. Bahan yang perlu verifikasi dokumen pemasok: " +
      (patuh.syubhat.length === 0 ? "tidak ada" : patuh.syubhat.map((b) => b.name).join(", ")) +
      ". Bahan melewati batas BPOM: " +
      (patuh.melanggar.length === 0 ? "tidak ada" : patuh.melanggar.map((b) => b.name).join(", ")) +
      "."
    );
  }

  if (
    t.includes("clash") ||
    t.includes("risiko") ||
    t.includes("interaksi") ||
    t.includes("berisiko")
  ) {
    if (clash.length === 0)
      return "Tidak ditemukan interaksi kritis antar bahan pada formula batch ini. Tetap pisahkan fase air dan minyak sesuai prosedur dan periksa pH kerja setiap aktif.";
    return (
      "Ada " +
      clash.length +
      " potensi interaksi. " +
      clash.map((c) => c.a + " dengan " + c.b + " tingkat " + c.tingkat + ", " + c.alasan).join(" ")
    );
  }

  if (t.includes("belum") || t.includes("kosong") || t.includes("parameter")) {
    if (kosong.length === 0)
      return (
        "Seluruh " +
        proyek.targets.length +
        " parameter sudah terisi. " +
        (diluar.length === 0
          ? "Semua nilai berada dalam jendela target."
          : "Namun " + diluar.map((p) => p.label).join(", ") + " masih di luar toleransi.")
      );
    return (
      "Parameter yang belum terisi: " +
      kosong
        .map(
          (p) =>
            p.label +
            " (" +
            (PARAM_LIBRARY.find((x) => x.id === p.id)?.metode ?? "metode internal") +
            ")",
        )
        .join("; ") +
      "."
    );
  }

  if (t.includes("rekomendasi") || t.includes("batch berikut") || t.includes("saran")) {
    if (diluar.length === 0 && kosong.length === 0)
      return "Data batch ini memenuhi target. Rekomendasi berikutnya adalah konfirmasi stabilitas 28 hari, uji panel sensori internal, dan verifikasi konsistensi saat kenaikan skala.";
    const daftar = diluar.map((p) => {
      const h = batch.hasil.find((x) => x.paramId === p.id)!;
      const arah = h.nilai! > p.target ? "di atas" : "di bawah";
      const aksi =
        p.id === "viskositas"
          ? h.nilai! > p.target
            ? "turunkan pengental struktural sekitar 0.5 persen"
            : "naikkan pengental struktural sekitar 1 persen"
          : p.id === "ph"
            ? h.nilai! > p.target
              ? "turunkan pH dengan larutan asam sitrat bertahap 0.05 persen"
              : "naikkan pH dengan trietanolamin 0.05 persen"
            : "sesuaikan bahan pendukung dan parameter proses terkait";
      return p.label + " " + arah + " target, " + aksi;
    });
    return (
      "Untuk batch berikutnya: " +
      daftar.join("; ") +
      (kosong.length > 0 ? "; lengkapi dulu data " + kosong.map((p) => p.label).join(", ") : "") +
      "."
    );
  }

  if (t.includes("prosedur") || t.includes("proses") || t.includes("cara")) {
    return "Prosedur batch ini: " + batch.prosedur.join("; ") + ".";
  }

  if (t.includes("bahan") || t.includes("formula") || t.includes("zat")) {
    return (
      "Formula batch " +
      batch.nomor +
      " terdiri dari " +
      batch.bahan.length +
      " bahan. Lima kadar terbesar: " +
      [...batch.bahan]
        .sort((a, b) => b.percent - a.percent)
        .slice(0, 5)
        .map((b) => b.name + " " + b.percent + " persen")
        .join(", ") +
      "."
    );
  }

  if (t.includes("prediksi") || t.includes("stabil")) {
    const pr = prediksiParameter(batch.bahan, proyek.targets);
    return (
      "Estimasi heuristik lokal untuk formula ini: " +
      pr
        .map(
          (p) =>
            p.label + " " + p.prediksi + " " + p.unit + " (keyakinan " + p.keyakinan + " persen)",
        )
        .join(", ") +
      "."
    );
  }

  return (
    "Jurnal " +
    proyek.judul +
    " batch " +
    batch.nomor +
    " berstatus " +
    batch.status +
    ", memakai " +
    batch.bahan.length +
    " bahan dengan " +
    proyek.targets.length +
    " parameter mutu. Skrining rule prototipe " +
    patuh.label +
    ", potensi interaksi " +
    clash.length +
    ", parameter belum terisi " +
    kosong.length +
    ", perkiraan HPP " +
    formatRupiah(hpp.total) +
    " per 50 ml."
  );
}

export function DocCopilot({
  proyek,
  batch,
  onTutup,
}: {
  proyek: Project;
  batch: Batch;
  onTutup: () => void;
}) {
  const awal = useMemo<Pesan[]>(
    () => [
      {
        peran: "ai",
        teks:
          "Saya copilot yang dilatih pada isi jurnal praktikum " +
          proyek.judul +
          " batch " +
          batch.nomor +
          ". Tanyakan formula, kepatuhan, parameter uji, biaya, atau rekomendasi batch berikutnya.",
      },
    ],
    [proyek.judul, batch.nomor],
  );
  const [pesan, setPesan] = useState<Pesan[]>(awal);
  const [teks, setTeks] = useState("");
  const [memuat, setMemuat] = useState(false);
  const akhir = useRef<HTMLDivElement>(null);

  async function kirim(isi: string) {
    const bersih = isi.trim();
    if (bersih.length === 0 || memuat) return;

    setPesan((p) => [...p, { peran: "user", teks: bersih }]);
    setTeks("");
    setMemuat(true);

    try {
      const hasil = await postJson<F1QueryResponse>("/v1/f1/query", { query: bersih });
      setPesan((p) => [...p, { peran: "ai", hasil }]);
    } catch (error) {
      if (error instanceof TypeError) {
        // Fallback hanya untuk kegagalan transport saat gateway tidak dapat dijangkau.
        setPesan((p) => [...p, { peran: "ai", teks: jawab(proyek, batch, bersih), lokal: true }]);
      } else {
        const alasan =
          error instanceof ModelApiError
            ? error.message
            : "Terjadi kegagalan tak terduga; tidak ada jawaban lokal yang diterbitkan.";
        setPesan((p) => [
          ...p,
          { peran: "ai", teks: "F1 tidak menerbitkan jawaban. Alasan server: " + alasan },
        ]);
      }
    } finally {
      setMemuat(false);
      window.setTimeout(() => akhir.current?.scrollIntoView?.({ behavior: "smooth" }), 50);
    }
  }

  return (
    <aside className="fixed right-0 top-0 z-30 flex h-screen w-full max-w-sm flex-col border-l border-border bg-card shadow-xl print:hidden">
      <header className="flex items-center justify-between border-b border-border px-4 py-3">
        <div>
          <p className="text-sm font-bold text-foreground">AI Copilot Jurnal</p>
          <p className="text-xs text-muted-foreground">
            Dilatih dari batch {batch.nomor} pada dokumen ini
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

            {m.peran === "ai" && m.hasil && <HasilF1 hasil={m.hasil} />}

            {m.peran === "ai" && !m.hasil && m.teks && (
              <div className="max-w-[92%] space-y-1.5">
                {m.lokal && (
                  <BandProvenance
                    lapis="heuristik"
                    tambahan="Gateway model tidak tersedia; jawaban berikut berasal dari heuristik lokal."
                  />
                )}
                <p className="text-sm leading-6 text-foreground">{m.teks}</p>
              </div>
            )}
          </div>
        ))}
        {memuat && <p className="text-xs text-muted-foreground">Mencari evidence…</p>}
        <div ref={akhir} />
      </div>

      <div className="flex flex-wrap gap-1.5 border-t border-border px-4 py-2">
        {SARAN.map((s) => (
          <button
            key={s}
            onClick={() => void kirim(s)}
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
  const limitations = [
    ...(hasil.answer ? [hasil.answer.limitations] : []),
    ...(hasil.limitations ?? []),
  ];

  return (
    <div className="max-w-[92%] space-y-2.5">
      {hasil.answer ? (
        <p className="text-sm leading-6 text-foreground">{hasil.answer.summary}</p>
      ) : (
        <p className="text-sm leading-6 text-muted-foreground">
          Evidence tidak cukup; ringkasan tidak diterbitkan oleh server.
        </p>
      )}

      {hasil.evidence.length > 0 && (
        <div className="space-y-1.5">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
            <FileSearch className="size-3.5" /> Sumber evidence
          </p>
          {hasil.evidence.map((kartu) => (
            <div
              key={kartu.source_id}
              className="rounded-xl border border-border px-3 py-2 text-xs"
            >
              <p className="font-mono font-semibold text-foreground">{kartu.source_id}</p>
              {kartu.journal_title && (
                <p className="mt-0.5 text-muted-foreground">{kartu.journal_title}</p>
              )}
              {(kartu.outcome ?? kartu.failure_mode) && (
                <p className="mt-0.5 text-muted-foreground">
                  {[kartu.outcome, kartu.failure_mode].filter(Boolean).join(" · ")}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {limitations.length > 0 ? (
        limitations.map((limitation) => (
          <p key={limitation} className="flex items-start gap-1.5 text-xs text-muted-foreground">
            <ShieldCheck className="mt-0.5 size-3.5 shrink-0" />
            {limitation}
          </p>
        ))
      ) : (
        <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
          <ShieldCheck className="mt-0.5 size-3.5 shrink-0" />
          Tidak ada limitation tambahan dari server.
        </p>
      )}
    </div>
  );
}
