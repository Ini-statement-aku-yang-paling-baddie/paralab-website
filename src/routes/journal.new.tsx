import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AlertTriangle, ArrowLeft, ArrowRight, Check, CircleHelp, Copy, FileText, Loader2, Plus, Sparkles, Trash2 } from "lucide-react";
import { AppShell } from "@/components/paralab/AppShell";
import { Card, CardTitle, Field, GhostButton, Pill, PrimaryButton, inputClass } from "@/components/paralab/ui";
import {
  BAHAN_LIBRARY,
  SENSORS,
  formatRupiah,
  hitungHpp,
  type Ingredient,
  type Project,
  type TargetParam,
} from "@/lib/paralab/data";
import { PARAM_GRUP, PARAM_LIBRARY, paramKeTarget } from "@/lib/paralab/catalog";
import { PanelSustain } from "@/components/paralab/PanelSustain";
import { BandProvenance, JejakRule } from "@/components/paralab/BandProvenance";
import { cekDomain } from "@/lib/paralab/f3";
import { DialogStok, StokPill } from "@/components/paralab/StokBahan";
import { PILIHAN_STANDAR, standarTerpilih, type PilihanStandar } from "@/lib/paralab/standar";
import {
  KATEGORI_OPSI,
  klaimUntukKategori,
  tipeKulitUntukKategori,
  paramUntukKategori,
  alasanRelevansi,
  formulaDariProyek,
  buatJurnalKosong,
  cariJurnalMirip,
  deteksiClash,
  kontribusiBiaya,
  prediksiParameter,
  ringkasKepatuhan,
  susunFormula,
  targetDefault,
  type Brief,
} from "@/lib/paralab/ai";
import { actions, useAppState } from "@/lib/paralab/store";
import logoDark from "@/assets/paralab-logo-dark.png";

export const Route = createFileRoute("/journal/new")({
  head: () => ({
    meta: [
      { title: "Tambah Jurnal Penelitian Baru | paralab.ai" },
      { name: "description", content: "Masukkan brief produk, dapatkan usulan formula AI lengkap dengan HPP, status halal, dan potensi clash, lalu ubah sesuai kebutuhan." },
      { property: "og:title", content: "Tambah Jurnal Penelitian Baru | paralab.ai" },
      { property: "og:description", content: "Alur dari brief produk menjadi jurnal praktikum kosong yang siap diuji di laboratorium." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: JurnalBaruPage,
});

const LANGKAH = ["Brief penelitian", "Simpan formula AI", "Tetapkan parameter", "Tinjau dan setujui"];

function JurnalBaruPage() {
  const navigate = useNavigate();
  const { user } = useAppState();
  const [langkah, setLangkah] = useState(0);

  const [brief, setBrief] = useState<Brief>(() => {
    const awal = KATEGORI_OPSI[0]!;
    return {
      judul: "",
      kategori: awal,
      targetKulit: tipeKulitUntukKategori(awal)[0]!,
      klaim: [klaimUntukKategori(awal)[0]!],
      catatan: "",
    };
  });

  const [bahan, setBahan] = useState<Ingredient[]>([]);
  const [targets, setTargets] = useState<TargetParam[]>(() => targetDefault(KATEGORI_OPSI[0]!));
  const [bahanBaru, setBahanBaru] = useState(BAHAN_LIBRARY[1]!.id);
  const [paramBaru, setParamBaru] = useState(PARAM_LIBRARY[0]!.id);
  const [standar, setStandar] = useState<PilihanStandar>("nasional");
  const [stokDibuka, setStokDibuka] = useState<string | null>(null);
  const [menganalisis, setMenganalisis] = useState(false);

  const klaimOpsi = useMemo(() => klaimUntukKategori(brief.kategori), [brief.kategori]);
  const kulitOpsi = useMemo(() => tipeKulitUntukKategori(brief.kategori), [brief.kategori]);
  const paramSaran = useMemo(() => paramUntukKategori(brief.kategori), [brief.kategori]);

  function gantiKategori(nama: string) {
    const klaimBaru = klaimUntukKategori(nama);
    const kulitBaru = tipeKulitUntukKategori(nama);
    setBrief((b) => {
      const tersisa = b.klaim.filter((x) => klaimBaru.includes(x));
      return {
        ...b,
        kategori: nama,
        klaim: tersisa.length > 0 ? tersisa : [klaimBaru[0]!],
        targetKulit: kulitBaru.includes(b.targetKulit) ? b.targetKulit : kulitBaru[0]!,
      };
    });
    setTargets(targetDefault(nama));
  }

  const mirip = useMemo(() => cariJurnalMirip(brief.judul, brief.kategori), [brief.judul, brief.kategori]);
  const clashes = useMemo(() => deteksiClash(bahan), [bahan]);
  const kepatuhan = useMemo(() => ringkasKepatuhan(bahan), [bahan]);
  const prediksi = useMemo(() => prediksiParameter(bahan, targets), [bahan, targets]);
  const hpp = useMemo(() => hitungHpp(bahan), [bahan]);
  const domainDraf = useMemo(() => cekDomain(brief.kategori, bahan), [brief.kategori, bahan]);
  const biaya = useMemo(() => kontribusiBiaya(bahan), [bahan]);

  const totalPersen = bahan.reduce((t, b) => t + b.percent, 0);

  function generate() {
    setBahan(susunFormula(brief));
    setLangkah(1);
    setMenganalisis(false);
  }

  function salinFormula(sumber: Project) {
    const formula = formulaDariProyek(sumber);
    if (formula.length === 0) return;
    setBahan(formula);
    setTargets(sumber.targets.map((t) => ({ ...t })));
    setBrief((b) => ({ ...b, kategori: sumber.kategori }));
    setLangkah(1);
    setMenganalisis(false);
  }

  function ubahPersen(id: string, nilai: number) {
    setBahan((prev) => prev.map((b) => (b.id === id ? { ...b, percent: nilai } : b)));
  }

  function hapusBahan(id: string) {
    setBahan((prev) => prev.filter((b) => b.id !== id));
  }

  function tambahBahan() {
    const src = BAHAN_LIBRARY.find((b) => b.id === bahanBaru);
    if (!src || bahan.some((b) => b.id === src.id)) return;
    setBahan((prev) => [...prev, { ...src }]);
  }

  function tambahTarget() {
    const def = PARAM_LIBRARY.find((x) => x.id === paramBaru);
    if (!def || targets.some((t) => t.id === def.id)) return;
    setTargets((prev) => [...prev, paramKeTarget(def)]);
  }

  function simpanParameter() {
    setMenganalisis(true);
    window.setTimeout(() => {
      setMenganalisis(false);
      setLangkah(3);
    }, 1600);
  }

  function simpanJurnal(bukaEditor = false) {
    const id = "prj-" + Math.random().toString(36).slice(2, 8);
    const proyek: Project = {
      id,
      judul: brief.judul || "Penelitian Tanpa Judul",
      peneliti: user?.nama ?? "Peneliti Tamu",
      tim: "Tim RnD",
      kategori: brief.kategori,
      status: "Sedang Berjalan",
      update: new Date().toISOString(),
      brief: brief.catatan || "Penelitian " + brief.kategori.toLowerCase() + " untuk kulit " + brief.targetKulit.toLowerCase() + ".",
      targets,
      standar,
      batches: [buatJurnalKosong(brief, bahan, targets, 1)],
    };
    actions.tambahProyek(proyek);
    navigate({ to: bukaEditor ? "/doc/$id" : "/journal/$id", params: { id }, search: { batch: 1 } });
  }

  return (
    <AppShell judul="Tambah Jurnal Baru" deskripsi="Dari brief produk sampai jurnal praktikum kosong yang siap diuji di laboratorium.">
      <ol className="mb-5 flex flex-wrap gap-2">
        {LANGKAH.map((l, i) => (
          <li
            key={l}
            className={
              "flex items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-semibold " +
              (i === langkah ? "border-brand bg-brand-soft text-brand-ink" : i < langkah ? "border-border bg-card text-success" : "border-border bg-card text-muted-foreground")
            }
          >
            <span className="flex size-5 items-center justify-center rounded-full bg-background text-xs">{i < langkah ? <Check className="size-3" /> : i + 1}</span>
            {l}
          </li>
        ))}
      </ol>

      {langkah === 0 && (
        <div className="grid gap-5 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardTitle title="Brief penelitian" sub="Isi kebutuhan produk yang ingin dikembangkan." />
            <div className="space-y-4">
              <Field label="Judul penelitian">
                <input className={inputClass} placeholder="Contoh: Face wash oil control untuk pria aktif" value={brief.judul} onChange={(e) => setBrief({ ...brief, judul: e.target.value })} />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Kategori produk">
                  <select
                    className={inputClass}
                    value={brief.kategori}
                    onChange={(e) => gantiKategori(e.target.value)}
                  >
                    {KATEGORI_OPSI.map((k) => (
                      <option key={k}>{k}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Tipe kulit sasaran" hint="Pilihan menyesuaikan kategori produk">
                  <select className={inputClass} value={brief.targetKulit} onChange={(e) => setBrief({ ...brief, targetKulit: e.target.value })}>
                    {kulitOpsi.map((k) => (
                      <option key={k}>{k}</option>
                    ))}
                  </select>
                </Field>
              </div>
              <Field label="Klaim yang diinginkan" hint="Klaim yang ditampilkan relevan dengan kategori yang dipilih">
                <div className="flex flex-wrap gap-2">
                  {klaimOpsi.map((k) => {
                    const aktif = brief.klaim.includes(k);
                    return (
                      <button
                        key={k}
                        type="button"
                        onClick={() => setBrief({ ...brief, klaim: aktif ? brief.klaim.filter((x) => x !== k) : [...brief.klaim, k] })}
                        className={
                          "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors " +
                          (aktif ? "border-brand bg-brand-soft text-brand-ink" : "border-border bg-card text-muted-foreground hover:bg-secondary")
                        }
                      >
                        {k}
                      </button>
                    );
                  })}
                </div>
              </Field>
              <Field label="Standar pengujian kosmetik" hint="Pilihan ini menentukan acuan metode pada template laporan praktikum">
                <div className="grid gap-2 sm:grid-cols-3">
                  {PILIHAN_STANDAR.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setStandar(p.id)}
                      className={
                        "rounded-xl border p-3 text-left transition-colors " +
                        (standar === p.id ? "border-brand bg-brand-soft" : "border-border bg-card hover:bg-secondary")
                      }
                    >
                      <p className="text-sm font-bold text-foreground">{p.label}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{p.teks}</p>
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {standarTerpilih(standar).length} standar dipakai, antara lain {standarTerpilih(standar).slice(0, 4).map((s) => s.kode).join(", ")}.
                </p>
              </Field>
              <Field label="Catatan tambahan" hint="Segmen pasar, kendala produksi, atau permintaan khusus">
                <textarea className={inputClass + " min-h-24"} value={brief.catatan} onChange={(e) => setBrief({ ...brief, catatan: e.target.value })} />
              </Field>
              <PrimaryButton onClick={generate} disabled={brief.judul.trim().length < 4}>
                <Sparkles className="size-4" /> Hasilkan usulan formula
              </PrimaryButton>
            </div>
          </Card>

          <Card>
            <CardTitle title="Penelitian serupa" sub="AI mencocokkan judul dengan arsip jurnal organisasi." />
            {brief.judul.trim().length < 4 && <p className="text-sm text-muted-foreground">Ketik judul penelitian untuk melihat arsip yang relevan.</p>}
            <div className="max-h-[520px] space-y-3 overflow-y-auto pr-1">
              {mirip.map(({ proyek, skor }) => {
                const jumlah = formulaDariProyek(proyek).length;
                return (
                  <div key={proyek.id} className="rounded-xl border border-border p-3">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-bold text-foreground">{proyek.judul}</p>
                      <Pill variant={proyek.status === "Sedang Berjalan" && skor > 70 ? "waspada" : "brand"}>{skor}%</Pill>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {proyek.peneliti} · {proyek.kategori} · {proyek.status}
                    </p>
                    <p className="mt-2 text-xs text-foreground">{alasanRelevansi(proyek)}</p>
                    {proyek.status === "Sedang Berjalan" && skor > 70 && (
                      <p className="mt-2 rounded-lg bg-warning-soft px-2.5 py-1.5 text-xs font-semibold text-warning">
                        Proyek ini masih berjalan dan sangat mirip, sebaiknya koordinasi dengan {proyek.tim}.
                      </p>
                    )}
                    <button
                      type="button"
                      disabled={jumlah === 0}
                      onClick={() => salinFormula(proyek)}
                      className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs font-semibold text-brand transition-colors hover:bg-brand-soft disabled:opacity-50"
                    >
                      <Copy className="size-3.5" /> {jumlah === 0 ? "Formula belum tersedia" : "Salin formula " + jumlah + " bahan"}
                    </button>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}

      {langkah >= 1 && (
        <div className="space-y-5">
          <div className="grid gap-5 xl:grid-cols-3">
            <Card className="xl:col-span-2">
              <CardTitle
                title="Formula usulan AI"
                sub={"Total " + totalPersen.toFixed(2) + " persen. Ubah kadar, tambah, atau hapus zat sesuai penilaian peneliti."}
                right={<Pill variant={Math.abs(totalPersen - 100) < 0.5 ? "aman" : "waspada"}>{Math.abs(totalPersen - 100) < 0.5 ? "Seimbang" : "Perlu penyesuaian"}</Pill>}
              />
              <div className="overflow-x-auto">
                <table className="table-clear w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                      <th className="py-2 pr-3">Bahan</th>
                      <th className="py-2 pr-3">Fungsi</th>
                      <th className="py-2 pr-3">Fase</th>
                      <th className="py-2 pr-3">Kadar</th>
                      <th className="py-2 pr-3">Kepatuhan</th>
                      <th className="py-2" />
                    </tr>
                  </thead>
                  <tbody>
                    {bahan.map((b) => (
                      <tr key={b.id} className="border-b border-border/70">
                        <td className="py-2.5 pr-3">
                          <p className="font-semibold text-foreground">{b.name}</p>
                          <p className="text-xs text-muted-foreground">{b.inci}</p>
                          <p className="text-[11px] text-muted-foreground">
                            CAS {b.cas} · {b.rumus} · pH kerja {b.phKerja[0]} sampai {b.phKerja[1]} · lazim {b.dosis[0]} sampai {b.dosis[1]} persen
                          </p>
                          <StokPill bahanId={b.id} persen={b.percent} onClick={() => setStokDibuka(b.id)} />
                        </td>
                        <td className="py-2.5 pr-3 text-xs text-muted-foreground">
                          <p>{b.fungsi}</p>
                          <p className="mt-1 text-[11px]">{b.inkompatibel}</p>
                        </td>
                        <td className="py-2.5 pr-3 text-xs">{b.phase}</td>

                        <td className="py-2.5 pr-3">
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            className="w-20 rounded-lg border border-input bg-card px-2 py-1 text-sm"
                            value={b.percent}
                            onChange={(e) => ubahPersen(b.id, Number(e.target.value))}
                          />
                        </td>
                        <td className="py-2.5 pr-3">
                          <div className="flex flex-wrap gap-1">
                            <Pill variant={b.halal === "halal" ? "aman" : b.halal === "syubhat" ? "waspada" : "bahaya"}>{b.halal}</Pill>
                            {b.bpom === "dibatasi" && <Pill variant="waspada">batas BPOM</Pill>}
                          </div>
                        </td>
                        <td className="py-2.5 text-right">
                          <button onClick={() => hapusBahan(b.id)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-danger-soft hover:text-danger">
                            <Trash2 className="size-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <select className={inputClass + " max-w-80"} value={bahanBaru} onChange={(e) => setBahanBaru(e.target.value)}>

                  {[...new Set(BAHAN_LIBRARY.map((b) => b.golongan))].map((g) => (
                    <optgroup key={g} label={g}>
                      {BAHAN_LIBRARY.filter((b) => b.golongan === g).map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name} ({b.inci})
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>

                <GhostButton onClick={tambahBahan}>
                  <Plus className="size-4" /> Tambah zat
                </GhostButton>
              </div>
            </Card>

            <div className="space-y-5">
              <PanelSustain bahan={bahan} />

              <Card>
                <CardTitle title="Perkiraan HPP" sub="Estimasi per kemasan 50 ml" />
                <p className="text-3xl font-bold tracking-tight text-foreground">{formatRupiah(hpp.total)}</p>
                <dl className="mt-3 space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Bahan baku</dt>
                    <dd className="font-semibold">{formatRupiah(hpp.per50ml)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Kemasan</dt>
                    <dd className="font-semibold">{formatRupiah(hpp.kemasan)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Proses produksi</dt>
                    <dd className="font-semibold">{formatRupiah(hpp.produksi)}</dd>
                  </div>
                </dl>
              </Card>

              <Card>
                <CardTitle
                  title="Skrining halal dan batas kadar"
                  sub={"Rule prototipe versi " + kepatuhan.ruleVersion + ", bukan persetujuan BPOM atau MUI"}
                />
                <Pill
                  variant={
                    kepatuhan.status === "clear_for_current_screening"
                      ? "aman"
                      : kepatuhan.status === "blocked"
                        ? "bahaya"
                        : "waspada"
                  }
                >
                  {kepatuhan.label}
                </Pill>
                <ul className="mt-3 space-y-2 text-xs text-muted-foreground">
                  {kepatuhan.syubhat.map((b) => (
                    <li key={b.id}>
                      <span className="font-semibold text-foreground">{b.name}</span> {b.catatanHalal}
                    </li>
                  ))}
                  {kepatuhan.melanggar.map((b) => (
                    <li key={b.id} className="text-danger">
                      Kadar {b.name} melewati batas BPOM. {b.batasBpom}
                    </li>
                  ))}
                  {kepatuhan.pelanggaran.map((p) => (
                    <li key={p.ruleId} className="text-danger">
                      Kadar {p.bahan.name} {p.bahan.percent}% melewati batas prototipe {p.maks}%.{" "}
                      <span className="font-mono text-[10px] text-muted-foreground">
                        {p.ruleId} · v{p.ruleVersion} · {p.sourceId}
                      </span>
                    </li>
                  ))}
                  {kepatuhan.takDikenal.map((b) => (
                    <li key={b.id} className="text-warning">
                      {b.name} belum dapat dipetakan ke INCI atau CAS kanonis, tinjauan manusia wajib.
                    </li>
                  ))}
                  {kepatuhan.status === "clear_for_current_screening" && (
                    <li>
                      Tidak ada rule prototipe yang aktif pada formula ini. Ini bukan pernyataan halal,
                      aman, atau lolos registrasi.
                    </li>
                  )}
                </ul>
              </Card>
            </div>
          </div>

          {langkah >= 3 && <div className="grid gap-5 lg:grid-cols-3">
            <Card>
              <CardTitle title="Pre-check kompatibilitas" sub="Pemeriksaan sisi klien sebelum F2 dijalankan server" />
              <BandProvenance lapis="rule" />
              {clashes.length === 0 ? (
                <p className="rounded-xl border border-border px-3 py-3 text-sm text-muted-foreground">
                  Tidak ada rule pre-check yang aktif pada kombinasi ini. Ini bukan pernyataan formula aman.
                </p>
              ) : (
                <ul className="space-y-2">
                  {clashes.map((c) => (
                    <li key={c.ruleId} className="rounded-xl border border-border p-3">
                      <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
                        <AlertTriangle className={c.severity === "blocked" ? "size-4 text-danger" : "size-4 text-warning"} />
                        {c.a} dan {c.b}
                        <span className="ml-auto text-[10px] font-bold uppercase text-muted-foreground">{c.severity}</span>
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">{c.alasan}</p>
                      <p className="mt-1.5">
                        <JejakRule ruleId={c.ruleId} ruleVersion={c.ruleVersion} sourceId={c.sourceId} />
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            <Card>
              <CardTitle title="F3 Stability Sentinel" sub="Status deteksi dini risiko untuk formula ini" />
              <BandProvenance lapis="prediksi" />
              <div className="border-l-2 border-l-warning bg-warning-soft/40 p-3">
                <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <CircleHelp className="size-4 text-warning" /> Abstain pada tahap draf
                </p>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                  F3 membutuhkan baseline minggu 0 dan minimal satu checkpoint landmark yang sudah
                  dikonfirmasi peneliti. Draf formula saja tidak cukup, jadi tidak ada forecast risiko
                  yang diterbitkan di layar ini.
                </p>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  {domainDraf.didukung
                    ? "Domain formula didukung. Setelah jurnal dibuat dan checkpoint direkam, panel F3 di halaman jurnal dapat dijalankan."
                    : domainDraf.alasan}
                </p>
              </div>
            </Card>

            <Card>
              <CardTitle title="Kontribusi biaya bahan" sub="Enam bahan termahal per kemasan" />
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={biaya} layout="vertical" barSize={12}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" />
                  <XAxis type="number" tick={{ fontSize: 10 }} />
                  <YAxis type="category" dataKey="nama" width={110} tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="biaya" fill="var(--chart-1)" radius={[0, 4, 4, 0]} name="Rupiah" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>}

          {langkah >= 2 && <Card>
            <CardTitle
              title="Parameter produk yang diinginkan"
              sub="Setiap parameter terhubung ke sensor laboratorium dan menjadi kriteria kelulusan batch."
              right={
                <span className="flex items-center gap-2">
                  <select className={inputClass + " max-w-60"} value={paramBaru} onChange={(e) => setParamBaru(e.target.value)}>
                    <optgroup label={"Disarankan untuk " + brief.kategori}>
                      {PARAM_LIBRARY.filter((x) => paramSaran.includes(x.id)).map((x) => (
                        <option key={"saran-" + x.id} value={x.id}>
                          {x.label}
                        </option>
                      ))}
                    </optgroup>
                    {PARAM_GRUP.map((g) => (
                      <optgroup key={g} label={g}>
                        {PARAM_LIBRARY.filter((x) => x.grup === g).map((x) => (
                          <option key={x.id} value={x.id}>
                            {x.label}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                  <GhostButton onClick={tambahTarget}>
                    <Plus className="size-4" /> Tambah parameter
                  </GhostButton>
                </span>
              }
            />
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {targets.map((t, idx) => {
                const p = prediksi.find((x) => x.paramId === t.id);
                return (
                  <div key={t.id} className="rounded-xl border border-border p-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold text-foreground">{t.label}</p>
                      <button
                        onClick={() => setTargets((prev) => prev.filter((_, i) => i !== idx))}
                        className="rounded-lg p-1 text-muted-foreground hover:bg-danger-soft hover:text-danger"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <input
                        type="number"
                        step="0.1"
                        className="w-20 rounded-lg border border-input bg-card px-2 py-1 text-sm"
                        value={t.target}
                        onChange={(e) => setTargets((prev) => prev.map((x, i) => (i === idx ? { ...x, target: Number(e.target.value) } : x)))}
                      />
                      <span className="text-sm font-semibold text-muted-foreground">&plusmn;</span>
                      <input
                        type="number"
                        step="0.1"
                        className="w-16 rounded-lg border border-input bg-card px-2 py-1 text-sm"
                        value={t.toleransi}
                        onChange={(e) => setTargets((prev) => prev.map((x, i) => (i === idx ? { ...x, toleransi: Number(e.target.value) } : x)))}
                      />
                      <span className="text-xs text-muted-foreground">{t.unit}</span>
                    </div>
                    {p && (
                      <p className="mt-2 text-xs">
                        <span className="text-muted-foreground">Estimasi kasar </span>
                        <span className={p.lolos ? "font-semibold text-success" : "font-semibold text-warning"}>
                          {p.prediksi} {p.unit}
                        </span>
                        <span className="text-muted-foreground"> · heuristik penyusunan target, bukan keluaran F3</span>
                      </p>
                    )}
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      {SENSORS.find((s) => s.id === t.sensor)?.label ?? PARAM_LIBRARY.find((x) => x.id === t.id)?.metode ?? "Uji laboratorium"}
                    </p>
                  </div>
                );
              })}
            </div>
            {langkah === 2 && (
              <div className="mt-4 border-t border-border pt-4">
                <PrimaryButton onClick={simpanParameter} disabled={targets.length === 0 || menganalisis}>
                  {menganalisis ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
                  {menganalisis ? "AI menganalisis formula dan parameter" : "Simpan parameter dan jalankan analisis"}
                </PrimaryButton>
                {menganalisis && (
                  <div className="mt-3 h-1.5 overflow-hidden bg-secondary">
                    <span className="block h-full w-2/3 animate-pulse bg-brand" />
                  </div>
                )}
              </div>
            )}
          </Card>}

          <div className="flex flex-wrap items-center justify-between gap-3">
            <GhostButton onClick={() => setLangkah(0)}>
              <ArrowLeft className="size-4" /> Kembali ke brief
            </GhostButton>
            {langkah === 1 ? (
              <PrimaryButton onClick={() => setLangkah(2)} disabled={Math.abs(totalPersen - 100) >= 0.5}>
                <Check className="size-4" /> Simpan formula
              </PrimaryButton>
            ) : langkah === 2 ? (
              <span className="text-xs text-muted-foreground">Simpan parameter untuk membuka prediktif pre-check kompatibilitas.</span>
            ) : (
              <PrimaryButton onClick={() => simpanJurnal()}>
                <Check className="size-4" /> Simpan jurnal praktikum batch 1
              </PrimaryButton>
            )}
          </div>

          {langkah === 3 && (
            <div className="space-y-5">
              <Card>
                <CardTitle title="Pratinjau jurnal praktikum kosong" sub="AI menyiapkan kerangka, peneliti tetap wajib menguji ulang formula di laboratorium." />
                <PratinjauJurnal brief={brief} bahan={bahan} targets={targets} />
              </Card>
              <Card>
                <CardTitle title="Pratinjau dokumen jurnal" sub="Tata letak mengikuti format jurnal praktikum dengan ruang kerja R&D kosmetik yang lebih lengkap." />
                <PratinjauDokumen brief={brief} bahan={bahan} targets={targets} />
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
                  <p className="flex items-center gap-2 text-xs text-muted-foreground">
                    <FileText className="size-4 text-brand" /> Editor teks tersedia setelah jurnal disimpan.
                  </p>
                  <PrimaryButton onClick={() => simpanJurnal(true)}>
                    Simpan dan buka teks editor <ArrowRight className="size-4" />
                  </PrimaryButton>
                </div>
              </Card>
            </div>
          )}
        </div>
      )}
      {stokDibuka && (() => {
        const b = bahan.find((x) => x.id === stokDibuka);
        return b ? <DialogStok bahan={b} onTutup={() => setStokDibuka(null)} /> : null;
      })()}
    </AppShell>
  );
}

function PratinjauDokumen({ brief, bahan, targets }: { brief: Brief; bahan: Ingredient[]; targets: TargetParam[] }) {
  const batch = useMemo(() => buatJurnalKosong(brief, bahan, targets, 1), [brief, bahan, targets]);
  return (
    <div className="mx-auto max-h-[620px] max-w-[720px] overflow-hidden border border-border bg-card px-8 py-10 shadow-sm sm:px-14">
      <img src={logoDark} alt="paralab.ai, Electronic Lab Notebook Vinara R&D" className="mb-5 h-12 w-auto max-w-[210px] object-contain object-left" />
      <p className="text-right text-xs leading-5 text-foreground">Tanggal praktikum: {new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })}<br />Peneliti: Peneliti aktif</p>
      <div className="my-7 text-center">
        <p className="text-xs font-bold uppercase text-muted-foreground">Modul R&D Formulasi Kosmetik</p>
        <h3 className="mt-1 text-base font-bold uppercase text-foreground">{brief.judul || "Judul penelitian"}</h3>
      </div>
      <div className="space-y-5 text-xs leading-5 text-foreground">
        <section className="grid grid-cols-[2.25rem_1fr] gap-2"><strong>I.</strong><div><strong>TUJUAN PERCOBAAN</strong><ul className="mt-1 list-disc pl-5">{batch.tujuan.map((t) => <li key={t}>{t}</li>)}</ul></div></section>
        <section className="grid grid-cols-[2.25rem_1fr] gap-2"><strong>II.</strong><div><strong>TEORI DASAR DAN HIPOTESIS</strong><p className="mt-1">{batch.hipotesis}</p></div></section>
        <section className="grid grid-cols-[2.25rem_1fr] gap-2"><strong>III.</strong><div><strong>ALAT DAN BAHAN</strong><p className="mt-1">Formula terdiri dari {bahan.length} bahan dan {targets.length} parameter mutu kritis.</p></div></section>
        <section className="grid grid-cols-[2.25rem_1fr] gap-2"><strong>IV.</strong><div><strong>DIAGRAM ALIR PERCOBAAN DAN DATA PENGAMATAN</strong><div className="mt-2 grid h-28 grid-cols-2 border border-border"><div className="border-r border-border p-2">Diagram alir proses</div><div className="p-2">Data sensor dan observasi</div></div></div></section>
        <p className="text-center text-[10px] text-muted-foreground">Pratinjau dipotong. Dokumen lengkap memuat formula, data kimia bahan, mutu, stabilitas, mikrobiologi, pembahasan, dan pengesahan.</p>
      </div>
    </div>
  );
}

function PratinjauJurnal({ brief, bahan, targets }: { brief: Brief; bahan: Ingredient[]; targets: TargetParam[] }) {
  const batch = useMemo(() => buatJurnalKosong(brief, bahan, targets, 1), [brief, bahan, targets]);
  return (
    <div className="space-y-4 text-sm">
      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Tujuan penelitian</p>
        <ul className="mt-1.5 list-disc space-y-1 pl-5 text-foreground">
          {batch.tujuan.map((t, i) => (
            <li key={i}>{t}</li>
          ))}
        </ul>
      </div>
      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Hipotesis</p>
        <p className="mt-1.5 text-foreground">{batch.hipotesis}</p>
      </div>
      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Prosedur kerja</p>
        <ol className="mt-1.5 list-decimal space-y-1 pl-5 text-foreground">
          {batch.prosedur.map((t, i) => (
            <li key={i}>{t}</li>
          ))}
        </ol>
      </div>
      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Tabel hasil uji</p>
        <p className="mt-1.5 text-muted-foreground">
          {targets.length} baris kosong menunggu pembacaan sensor: {targets.map((t) => t.label).join(", ")}.
        </p>
      </div>
    </div>
  );
}
