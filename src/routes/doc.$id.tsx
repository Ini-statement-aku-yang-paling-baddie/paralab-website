import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Cloud,
  Highlighter,
  Italic,
  List,
  ListOrdered,
  Printer,
  Radio,
  Redo2,
  Strikethrough,
  Table,
  Underline,
  Undo2,
  PlayCircle,
} from "lucide-react";
import { Logo } from "@/components/paralab/AppShell";
import { DocCopilot } from "@/components/paralab/DocCopilot";
import { VoiceLog } from "@/components/paralab/VoiceLog";
import { UjiCitraBatch } from "@/components/paralab/UjiCitraBatch";
import { buatDokumenHtml, hitungKata } from "@/lib/paralab/dokumen";
import { actions, hydrate, useAppState, useProject } from "@/lib/paralab/store";
import { bacaSatuSensor } from "@/hooks/use-sensors";
import { evaluasiBatch } from "@/lib/paralab/ai";
import { Bot, CheckCircle2, ClipboardList, Lightbulb } from "lucide-react";

type Search = { batch?: number | undefined };

export const Route = createFileRoute("/doc/$id")({
  validateSearch: (s: Record<string, unknown>): Search => ({ batch: s["batch"] ? Number(s["batch"]) : undefined }),
  head: () => ({
    meta: [
      { title: "Editor Jurnal Praktikum | paralab.ai" },
      { name: "description", content: "Editor dokumen jurnal praktikum laboratorium dengan penyuntingan bebas, tabel hasil uji, dan pengambilan nilai sensor." },
      { property: "og:title", content: "Editor Jurnal Praktikum | paralab.ai" },
      { property: "og:description", content: "Menulis jurnal praktikum layaknya dokumen kerja, tersimpan otomatis." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DokumenEditor,
});

function DokumenEditor() {
  const { id } = Route.useParams();
  const search = Route.useSearch();
  const proyek = useProject(id);
  const { user } = useAppState();
  const nomor = search.batch ?? 1;
  const batch = proyek?.batches.find((b) => b.nomor === nomor) ?? proyek?.batches[0];

  const ref = useRef<HTMLDivElement>(null);
  const siap = useRef(false);
  const [status, setStatus] = useState("Semua perubahan tersimpan");
  const [kata, setKata] = useState(0);
  const [termuat, setTermuat] = useState(false);
  const [copilot, setCopilot] = useState(false);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    hydrate();
    setTermuat(true);
  }, []);

  useEffect(() => {
    if (!proyek || !batch || !ref.current || siap.current) return;
    const html = batch.dokumen ?? buatDokumenHtml(proyek, batch);
    ref.current.innerHTML = html;
    setKata(hitungKata(html));
    setFeedback(batch.feedback ?? "");
    siap.current = true;
  }, [proyek, batch]);


  const simpan = useCallback(() => {
    if (!proyek || !batch || !ref.current) return;
    const html = ref.current.innerHTML;
    actions.simpanBatch(proyek.id, batch.nomor, (b) => ({ ...b, dokumen: html, dokumenDiubah: new Date().toISOString() }));
    setKata(hitungKata(html));
    setStatus("Semua perubahan tersimpan");
  }, [proyek, batch]);

  useEffect(() => {
    if (!siap.current) return;
    if (status !== "Menyimpan") return;
    const t = window.setTimeout(simpan, 700);
    return () => window.clearTimeout(t);
  }, [status, simpan, kata]);

  if (!proyek || !batch) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-secondary p-6">
        <div className="surface-card p-6 text-center">
          <p className="text-sm text-muted-foreground">
            {termuat ? "Dokumen jurnal tidak ditemukan pada perangkat ini." : "Memuat dokumen jurnal"}
          </p>
          <Link to="/dashboard" className="mt-3 inline-block text-sm font-semibold text-brand">
            Kembali ke dashboard
          </Link>
        </div>
      </div>
    );
  }


  function perintah(cmd: string, nilai?: string) {
    ref.current?.focus();
    document.execCommand(cmd, false, nilai);
    setStatus("Menyimpan");
  }

  function sisip(html: string) {
    ref.current?.focus();
    document.execCommand("insertHTML", false, html);
    setStatus("Menyimpan");
  }

  function sisipTabelHasil() {
    const baris = proyek!.targets
      .map((t) => "<tr><td>" + t.label + "</td><td>" + t.target + " ± " + t.toleransi + " " + t.unit + "</td><td></td><td></td></tr>")
      .join("");
    sisip("<table><thead><tr><th>Parameter</th><th>Target</th><th>Hasil</th><th>Catatan</th></tr></thead><tbody>" + baris + "</tbody></table><p></p>");
  }

  function sisipSensor() {
    const waktu = new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
    const isi = proyek!.targets
      .map((t) => {
        const nilai = bacaSatuSensor(t.sensor);
        return "<li>" + t.label + ": " + (nilai === null ? "diisi manual" : nilai + " " + t.unit) + "</li>";
      })
      .join("");
    sisip("<p><strong>Pembacaan sensor pukul " + waktu + "</strong></p><ul>" + isi + "</ul><p></p>");
    actions.catat(user?.nama ?? proyek!.peneliti, proyek!.judul, "Pembacaan sensor", "Nilai sensor disisipkan ke dokumen jurnal batch " + batch!.nomor);
  }

  function selesaikanBatch() {
    simpan();
    const ev = evaluasiBatch({ ...batch!, feedback }, proyek!.targets, feedback);
    actions.simpanBatch(proyek!.id, batch!.nomor, (b) => ({ ...b, feedback, status: "dievaluasi", evaluasi: ev }));
    actions.catat(user?.nama ?? proyek!.peneliti, proyek!.judul, "Batch selesai", "Praktikum batch " + batch!.nomor + " ditutup dengan skor kesesuaian " + ev.skorKesesuaian);
  }

  function buatBatchBerikut() {
    const ev = batch!.evaluasi;
    if (!ev) return;
    const nomorBaru = proyek!.batches.length + 1;
    const bahanBaru = batch!.bahan.map((b) => {
      const ubah = ev.perubahanFormula.find((p) => p.bahan === b.name);
      return ubah ? { ...b, percent: ubah.ke } : { ...b };
    });
    actions.tambahBatch(proyek!.id, {
      nomor: nomorBaru,
      status: "draft",
      dibuat: new Date().toISOString(),
      tujuan: ev.rancanganBerikutnya.tujuan,
      hipotesis: ev.rancanganBerikutnya.hipotesis,
      prosedur: batch!.prosedur,
      bahan: bahanBaru,
      hasil: proyek!.targets.map((t) => ({ paramId: t.id, nilai: null, sumber: "sensor" as const })),
      observasi: "",
      feedback: "",
    });
    actions.catat(user?.nama ?? proyek!.peneliti, proyek!.judul, "Batch baru", "Rancangan batch " + nomorBaru + " dibuat dari evaluasi batch " + batch!.nomor);
    window.location.assign("/doc/" + proyek!.id + "?batch=" + nomorBaru);
  }

  function mulaiUjiSampel() {
    simpan();
    actions.simpanBatch(proyek!.id, batch!.nomor, (b) => ({
      ...b,
      status: "pemantauan",
      ujiSampelDimulai: b.ujiSampelDimulai ?? new Date().toISOString(),
    }));
    actions.catat(user?.nama ?? proyek!.peneliti, proyek!.judul, "Uji coba sampel", "Pemantauan stabilitas droplet batch " + batch!.nomor + " dimulai dari editor jurnal");
    window.location.assign("/journal/" + proyek!.id + "?batch=" + batch!.nomor);
  }

  const ev = batch.evaluasi;

  const tombol =
    "flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground";

  return (
    <div className="min-h-screen bg-secondary">
      <header className="sticky top-0 z-20 border-b border-border bg-card">
        <div className="flex flex-wrap items-center gap-3 px-4 py-3">
          <Link to="/journal/$id" params={{ id: proyek.id }} search={{ batch: batch.nomor }}>
            <Logo compact />
          </Link>
          <div className="min-w-0">
            <p className="truncate text-base font-bold text-foreground">Jurnal Praktikum {proyek.judul}</p>
            <p className="text-xs text-muted-foreground">
              Batch {batch.nomor} · {proyek.kategori} · {proyek.targets.length} parameter uji
            </p>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Cloud className="size-3.5" /> {status}
            </span>
            <button onClick={() => window.print()} className="flex items-center gap-1.5 rounded-xl border border-border px-3 py-1.5 text-sm font-semibold text-foreground hover:bg-secondary">
              <Printer className="size-4" /> Cetak
            </button>
            <button
              onClick={() => setCopilot((v) => !v)}
              title="AI Copilot jurnal"
              className="flex items-center gap-1.5 rounded-xl brand-gradient px-3 py-1.5 text-sm font-semibold text-primary-foreground shadow-sm"
            >
              <Bot className="size-4" /> AI Copilot
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1 border-t border-border px-4 py-1.5">
          <button className={tombol} onClick={() => perintah("undo")} title="Urungkan">
            <Undo2 className="size-4" />
          </button>
          <button className={tombol} onClick={() => perintah("redo")} title="Ulangi">
            <Redo2 className="size-4" />
          </button>
          <span className="mx-1 h-5 w-px bg-border" />
          <select
            className="rounded-lg border border-input bg-card px-2 py-1 text-sm"
            defaultValue="p"
            onChange={(e) => perintah("formatBlock", e.target.value)}
          >
            <option value="p">Teks biasa</option>
            <option value="h1">Judul 1</option>
            <option value="h2">Judul 2</option>
            <option value="h3">Judul 3</option>
            <option value="blockquote">Kutipan</option>
          </select>
          <span className="mx-1 h-5 w-px bg-border" />
          <button className={tombol} onClick={() => perintah("bold")} title="Tebal">
            <Bold className="size-4" />
          </button>
          <button className={tombol} onClick={() => perintah("italic")} title="Miring">
            <Italic className="size-4" />
          </button>
          <button className={tombol} onClick={() => perintah("underline")} title="Garis bawah">
            <Underline className="size-4" />
          </button>
          <button className={tombol} onClick={() => perintah("strikeThrough")} title="Coret">
            <Strikethrough className="size-4" />
          </button>
          <button className={tombol} onClick={() => perintah("hiliteColor", "#fde68a")} title="Sorot">
            <Highlighter className="size-4" />
          </button>
          <span className="mx-1 h-5 w-px bg-border" />
          <button className={tombol} onClick={() => perintah("insertUnorderedList")} title="Daftar titik">
            <List className="size-4" />
          </button>
          <button className={tombol} onClick={() => perintah("insertOrderedList")} title="Daftar angka">
            <ListOrdered className="size-4" />
          </button>
          <button className={tombol} onClick={() => perintah("justifyLeft")} title="Rata kiri">
            <AlignLeft className="size-4" />
          </button>
          <button className={tombol} onClick={() => perintah("justifyCenter")} title="Rata tengah">
            <AlignCenter className="size-4" />
          </button>
          <button className={tombol} onClick={() => perintah("justifyRight")} title="Rata kanan">
            <AlignRight className="size-4" />
          </button>
          <span className="mx-1 h-5 w-px bg-border" />
          <button
            onClick={sisipTabelHasil}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            <Table className="size-4" /> Tabel hasil uji
          </button>
          <button
            onClick={sisipSensor}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            <Radio className="size-4" /> Sisipkan nilai sensor
          </button>
          <span className="ml-auto text-xs text-muted-foreground">{kata} kata</span>
        </div>
      </header>

      <main className="flex flex-col items-center gap-6 px-4 py-8 print:p-0">
        <div
          ref={ref}
          contentEditable
          suppressContentEditableWarning
          spellCheck={false}
          onInput={() => setStatus("Menyimpan")}
          onBlur={simpan}
          className="doc-page min-h-[1056px] w-full max-w-[816px] border border-border bg-card px-8 py-12 text-[14px] leading-6 text-foreground shadow-sm outline-none sm:px-16 sm:py-20 print:min-h-0 print:border-0 print:shadow-none"
        />

        <section className="w-full max-w-[816px] rounded-2xl border border-border bg-card p-6 print:hidden">
          <div className="flex items-center gap-2">
            <ClipboardList className="size-5 text-brand" />
            <h2 className="text-base font-bold text-foreground">Penutupan praktikum batch ke-{batch.nomor}</h2>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Tuliskan hasil pengamatan dan kendala pada batch ini. Analisis akan membaca laporan praktikum beserta catatan Anda, lalu menyusun rekomendasi untuk batch berikutnya.
          </p>

          <UjiCitraBatch
            nomor={batch.nomor}
            onTemuan={(t) => setFeedback((v) => (v.trim() ? v.trim() + " " + t : t))}
          />

          <label className="mt-4 block text-sm font-semibold text-foreground" htmlFor="feedback-batch">
            Umpan balik peneliti
          </label>
          <textarea
            id="feedback-batch"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            rows={4}
            placeholder="Contoh: tekstur terlalu encer setelah 24 jam dan terasa sedikit lengket saat diaplikasikan."
            className="mt-1.5 w-full rounded-xl border border-input bg-card px-3 py-2 text-sm outline-none focus:border-brand"
          />

          <button
            onClick={selesaikanBatch}
            className="mt-3 flex items-center gap-2 rounded-xl brand-gradient px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm"
          >
            <CheckCircle2 className="size-4" /> Selesaikan praktikum batch ke-{batch.nomor}
          </button>

          {ev && (
            <div className="mt-6 space-y-4 border-t border-border pt-5">
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-brand-soft px-3 py-1 text-xs font-bold text-brand">Skor kesesuaian {ev.skorKesesuaian}</span>
                <p className="text-sm text-foreground">{ev.ringkasan}</p>
              </div>

              <div>
                <p className="text-sm font-bold text-foreground">Kekurangan yang terdeteksi</p>
                <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                  {ev.kekurangan.length === 0 ? <li>Tidak ada temuan kritis pada batch ini.</li> : ev.kekurangan.map((k, i) => <li key={i}>{k}</li>)}
                </ul>
              </div>

              <div>
                <p className="flex items-center gap-1.5 text-sm font-bold text-foreground">
                  <Lightbulb className="size-4 text-warning" /> Rekomendasi batch berikutnya
                </p>
                <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                  {ev.rekomendasi.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>

              {ev.perubahanFormula.length > 0 && (
                <div>
                  <p className="text-sm font-bold text-foreground">Usulan penyesuaian formula</p>
                  <table className="table-clear mt-1 w-full text-left text-sm">
                    <thead>
                      <tr className="text-xs uppercase text-muted-foreground">
                        <th className="py-1">Bahan</th>
                        <th className="py-1">Dari</th>
                        <th className="py-1">Menjadi</th>
                        <th className="py-1">Alasan</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ev.perubahanFormula.map((p, i) => (
                        <tr key={i} className="border-t border-border">
                          <td className="py-1.5 font-medium text-foreground">{p.bahan}</td>
                          <td className="py-1.5 text-muted-foreground">{p.dari} persen</td>
                          <td className="py-1.5 font-semibold text-brand">{p.ke} persen</td>
                          <td className="py-1.5 text-muted-foreground">{p.alasan}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div>
                <p className="text-sm font-bold text-foreground">Rancangan batch {proyek.batches.length + 1}</p>
                <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                  {ev.rancanganBerikutnya.tujuan.map((t, i) => (
                    <li key={i}>{t}</li>
                  ))}
                </ul>
                <p className="mt-1.5 text-sm text-muted-foreground">Hipotesis: {ev.rancanganBerikutnya.hipotesis}</p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={mulaiUjiSampel}
                  className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-brand hover:bg-brand-soft"
                >
                  <PlayCircle className="size-4" /> Mulai proses uji coba sampel
                </button>
                <button
                  onClick={buatBatchBerikut}
                  className="rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-brand hover:bg-brand-soft"
                >
                  Buat jurnal praktikum batch {proyek.batches.length + 1}
                </button>
              </div>
            </div>
          )}
        </section>
      </main>

      <VoiceLog
        selectedTrialId={proyek.id + "-batch-" + batch.nomor}
        onTerapkan={(h) => {
          const waktu = new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
          const baris: string[] = [];
          for (const b of h.bahan) baris.push("<li>Bahan: " + b.nama + " " + b.persen + " persen</li>");
          for (const p of h.parameter) baris.push("<li>" + p.label + ": " + p.nilai + " " + p.unit + "</li>");
          for (const o of h.observasi) baris.push("<li>Observasi: " + o + "</li>");
          sisip("<p><strong>Catatan suara pukul " + waktu + "</strong></p><ul>" + baris.join("") + "</ul><p></p>");
          if (h.observasi.length > 0) {
            actions.simpanBatch(proyek.id, batch.nomor, (b) => ({
              ...b,
              observasi: (b.observasi ? b.observasi + " " : "") + h.observasi.join(". ") + ".",
            }));
          }
          actions.catat(user?.nama ?? proyek.peneliti, proyek.judul, "Catatan suara", h.mentah.slice(0, 160));
        }}
      />

      {copilot && (
        <DocCopilot proyek={proyek} batch={batch} onTutup={() => setCopilot(false)} />
      )}
    </div>
  );
}
