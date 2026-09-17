import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  AlertTriangle,
  ArrowUpRight,
  Check,
  CheckCircle2,
  Download,
  FileText,
  FlaskConical,
  Radio,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import { AppShell } from "@/components/paralab/AppShell";
import {
  Card,
  CardTitle,
  Pill,
  PrimaryButton,
  GhostButton,
  Stat,
  StatStrip,
  inputClass,
} from "@/components/paralab/ui";
import { SENSORS, formatRupiah, hitungHpp } from "@/lib/paralab/data";
import { PARAM_LIBRARY } from "@/lib/paralab/catalog";
import { deteksiClash, evaluasiBatch, ringkasKepatuhan } from "@/lib/paralab/ai";
import { actions, useAppState, useProject } from "@/lib/paralab/store";
import { bacaSatuSensor } from "@/hooks/use-sensors";
import { PanelPemantauan } from "@/components/paralab/PanelPemantauan";
import { UjiSampelStabilitas } from "@/components/paralab/UjiSampelStabilitas";
import { PanelCheckpoint } from "@/components/paralab/PanelCheckpoint";
import { PanelSentinel } from "@/components/paralab/PanelSentinel";
import { BandProvenance, JejakRule } from "@/components/paralab/BandProvenance";
import { unduhScaleUpBrief } from "@/lib/paralab/scaleup";

type Search = { batch?: number | undefined };

export const Route = createFileRoute("/journal/$id")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    batch: s["batch"] ? Number(s["batch"]) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Jurnal Praktikum Penelitian | paralab.ai" },
      {
        name: "description",
        content:
          "Isi jurnal praktikum, ambil nilai dari sensor laboratorium, tutup batch, dan dapatkan evaluasi AI untuk batch berikutnya.",
      },
      { property: "og:title", content: "Jurnal Praktikum Penelitian | paralab.ai" },
      {
        property: "og:description",
        content: "Electronic lab notebook dengan evaluasi batch otomatis.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: JurnalDetail,
});

function JurnalDetail() {
  const { id } = Route.useParams();
  const search = Route.useSearch();
  const navigate = useNavigate();
  const proyek = useProject(id);
  const { user } = useAppState();
  const [aktif, setAktif] = useState(search.batch ?? 1);
  // Usulan sensor yang belum dikonfirmasi peneliti. Nilai di sini belum masuk jurnal.
  const [usulanSensor, setUsulanSensor] = useState<Record<string, number>>({});

  if (!proyek) {
    return (
      <AppShell
        judul="Jurnal tidak ditemukan"
        deskripsi="Penelitian yang Anda cari tidak tersedia pada perangkat ini."
      >
        <Card>
          <Link to="/dashboard" className="text-sm font-semibold text-brand">
            Kembali ke dashboard
          </Link>
        </Card>
      </AppShell>
    );
  }

  const batch = proyek.batches.find((b) => b.nomor === aktif) ?? proyek.batches[0]!;
  const nama = user?.nama ?? proyek.peneliti;

  const hpp = hitungHpp(batch.bahan);
  const kepatuhan = ringkasKepatuhan(batch.bahan);
  const clashes = deteksiClash(batch.bahan);

  const terisi = batch.hasil.filter((h) => h.nilai !== null).length;
  const lengkap = terisi === proyek.targets.length && proyek.targets.length > 0;

  const perbandingan = proyek.targets.map((t) => {
    const h = batch.hasil.find((x) => x.paramId === t.id);
    return { nama: t.label, target: t.target, hasil: h?.nilai ?? 0 };
  });

  const lolos = proyek.targets.filter((t) => {
    const h = batch.hasil.find((x) => x.paramId === t.id);
    return h?.nilai != null && Math.abs(h.nilai - t.target) <= t.toleransi;
  }).length;

  /**
   * Sensor hanya MENGUSULKAN nilai. Aturan #5 arsitektur melarang sistem menulis
   * hasil uji tanpa konfirmasi manusia, jadi pembacaan ditahan di state lokal
   * sampai peneliti menekan Konfirmasi.
   */
  function usulkanDariSensor(paramId: string, sensorId: string) {
    const nilai = bacaSatuSensor(sensorId);
    if (nilai === null) return;
    setUsulanSensor((u) => ({ ...u, [paramId]: nilai }));
  }

  function tolakUsulan(paramId: string) {
    setUsulanSensor((u) => {
      const salinan = { ...u };
      delete salinan[paramId];
      return salinan;
    });
  }

  function konfirmasiUsulan(paramId: string, sensorId: string) {
    const nilai = usulanSensor[paramId];
    if (nilai === undefined) return;
    actions.simpanBatch(proyek!.id, batch.nomor, (b) => ({
      ...b,
      status: b.status === "draft" ? "berjalan" : b.status,
      hasil: b.hasil.map((h) =>
        h.paramId === paramId
          ? { ...h, nilai, sumber: "sensor", waktu: new Date().toISOString() }
          : h,
      ),
    }));
    actions.catat(
      nama,
      proyek!.judul,
      "Pembacaan sensor dikonfirmasi",
      "Peneliti mengesahkan nilai " + nilai + " dari sensor untuk batch " + batch.nomor,
      sensorId,
    );
    tolakUsulan(paramId);
  }

  function isiManual(paramId: string, nilai: number) {
    actions.simpanBatch(proyek!.id, batch.nomor, (b) => ({
      ...b,
      status: b.status === "draft" ? "berjalan" : b.status,
      hasil: b.hasil.map((h) =>
        h.paramId === paramId
          ? { ...h, nilai, sumber: "manual", waktu: new Date().toISOString() }
          : h,
      ),
    }));
  }

  function selesaikanBatch() {
    const evaluasi = evaluasiBatch(batch, proyek!.targets, batch.feedback);
    actions.simpanBatch(proyek!.id, batch.nomor, (b) => ({ ...b, status: "dievaluasi", evaluasi }));
    actions.catat(
      nama,
      proyek!.judul,
      "Batch selesai",
      "RnD batch " +
        batch.nomor +
        " ditutup dengan skor kesesuaian " +
        evaluasi.skorKesesuaian +
        " persen",
    );
  }

  function buatBatchBerikut() {
    const ev = batch.evaluasi!;
    const nomor = proyek!.batches.length + 1;
    actions.tambahBatch(proyek!.id, {
      nomor,
      status: "draft",
      dibuat: new Date().toISOString(),
      tujuan: ev.rancanganBerikutnya.tujuan,
      hipotesis: ev.rancanganBerikutnya.hipotesis,
      prosedur: batch.prosedur,
      bahan: batch.bahan.map((b) => {
        const ubah = ev.perubahanFormula.find((p) => p.bahan === b.name);
        return ubah ? { ...b, percent: ubah.ke } : b;
      }),
      hasil: proyek!.targets.map((t) => ({
        paramId: t.id,
        nilai: null,
        sumber: "sensor" as const,
      })),
      observasi: "",
      feedback: "",
    });
    actions.catat(
      nama,
      proyek!.judul,
      "Batch baru",
      "Rancangan evaluasi batch " + nomor + " dibuat dari rekomendasi AI",
    );
    setAktif(nomor);
  }

  return (
    <AppShell judul={proyek.judul} deskripsi={proyek.brief}>
      <PanelPemantauan proyek={proyek} batch={batch} />
      <div className="mb-5 flex flex-wrap items-center gap-2">
        {proyek.batches.map((b) => (
          <button
            key={b.nomor}
            onClick={() => {
              setAktif(b.nomor);
              navigate({
                to: "/journal/$id",
                params: { id: proyek.id },
                search: { batch: b.nomor },
              });
            }}
            className={
              "rounded-xl border px-3.5 py-2 text-sm font-semibold transition-colors " +
              (b.nomor === batch.nomor
                ? "border-brand bg-brand-soft text-brand-ink"
                : "border-border bg-card text-muted-foreground hover:bg-secondary")
            }
          >
            Batch {b.nomor}
            <span className="ml-2 text-[11px] font-medium uppercase">{b.status}</span>
          </button>
        ))}
        <span className="ml-auto flex items-center gap-2">
          <Link to="/doc/$id" params={{ id: proyek.id }} search={{ batch: batch.nomor }}>
            <PrimaryButton>
              <FileText className="size-4" /> Buka editor dokumen
            </PrimaryButton>
          </Link>
          <Link to="/handoff/$id" params={{ id: proyek.id }}>
            <GhostButton>
              <Send className="size-4" /> Kirim ke divisi
            </GhostButton>
          </Link>
        </span>
      </div>

      <StatStrip>
        <Stat
          label="Parameter terisi"
          value={terisi + " dari " + proyek.targets.length}
          hint="Sumber utama pembacaan sensor"
        />
        <Stat label="Parameter lolos" value={String(lolos)} hint="Berada dalam rentang toleransi" />
        <Stat label="Perkiraan HPP" value={formatRupiah(hpp.total)} hint="Per kemasan 50 ml" />
        <Stat
          label="Skrining rule"
          value={kepatuhan.label}
          hint={"Rule prototipe v" + kepatuhan.ruleVersion + ", bukan approval"}
        />
      </StatStrip>

      <div className="mt-5 grid gap-5 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardTitle
            title={"Jurnal praktikum batch " + batch.nomor}
            sub="Kerangka dibuat AI, pengujian tetap dilakukan peneliti."
          />
          <div className="space-y-4 text-sm">
            <section>
              <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                Tujuan penelitian
              </p>
              <ul className="mt-1.5 list-disc space-y-1 pl-5">
                {batch.tujuan.map((t, i) => (
                  <li key={i}>{t}</li>
                ))}
              </ul>
            </section>
            <section>
              <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                Hipotesis
              </p>
              <p className="mt-1.5">{batch.hipotesis}</p>
            </section>
            <section>
              <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                Prosedur kerja
              </p>
              <ol className="mt-1.5 list-decimal space-y-1 pl-5">
                {batch.prosedur.map((t, i) => (
                  <li key={i}>{t}</li>
                ))}
              </ol>
            </section>
            <section>
              <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                Observasi peneliti
              </p>
              <textarea
                className={inputClass + " mt-1.5 min-h-24"}
                placeholder="Catat warna, aroma, tekstur, dan kejadian penting selama proses."
                value={batch.observasi}
                onChange={(e) =>
                  actions.simpanBatch(proyek.id, batch.nomor, (b) => ({
                    ...b,
                    observasi: e.target.value,
                  }))
                }
              />
            </section>
          </div>
        </Card>

        <div className="space-y-5">
          <Card>
            <CardTitle
              title="Formula batch"
              sub={batch.bahan.length + " bahan aktif dan pendukung"}
            />
            <ul className="space-y-2 text-sm">
              {batch.bahan.map((b) => (
                <li
                  key={b.id}
                  className="flex items-center justify-between gap-2 border-b border-border/70 pb-2"
                >
                  <span>
                    <span className="font-semibold text-foreground">{b.name}</span>
                    <span className="block text-xs text-muted-foreground">{b.fungsi}</span>
                  </span>
                  <span className="flex items-center gap-2">
                    <Pill
                      variant={
                        b.halal === "halal" ? "aman" : b.halal === "syubhat" ? "waspada" : "bahaya"
                      }
                    >
                      {b.halal}
                    </Pill>
                    <span className="w-14 text-right font-semibold">{b.percent}%</span>
                  </span>
                </li>
              ))}
            </ul>
          </Card>

          <Card>
            <CardTitle
              title="Pre-check kompatibilitas"
              sub="Pemeriksaan cepat sisi klien sebelum F2 dijalankan server"
            />
            <BandProvenance lapis="rule" />
            {clashes.length === 0 ? (
              <p className="flex items-center gap-2 text-sm font-medium text-foreground">
                <CheckCircle2 className="size-4 text-muted-foreground" /> Tidak ada rule pre-check
                yang aktif. Ini bukan pernyataan formula aman.
              </p>
            ) : (
              <ul className="space-y-2 text-xs">
                {clashes.map((c) => (
                  <li key={c.ruleId} className="rounded-xl border border-border p-2.5">
                    <p className="flex items-center gap-1.5 text-sm font-semibold">
                      <AlertTriangle
                        className={
                          c.severity === "blocked" ? "size-4 text-danger" : "size-4 text-warning"
                        }
                      />
                      {c.a} dan {c.b}
                      <span className="ml-auto text-[10px] font-bold uppercase text-muted-foreground">
                        {c.severity}
                      </span>
                    </p>
                    <p className="mt-1 text-muted-foreground">{c.alasan}</p>
                    <p className="mt-1.5">
                      <JejakRule
                        ruleId={c.ruleId}
                        ruleVersion={c.ruleVersion}
                        sourceId={c.sourceId}
                      />
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>

      <Card className="mt-5">
        <CardTitle
          title="Tabel hasil uji"
          sub="Sensor mengusulkan, peneliti mengonfirmasi. Nilai baru masuk jurnal setelah dikonfirmasi."
        />
        <BandProvenance lapis="sensor" />
        <div className="overflow-x-auto">
          <table className="table-clear w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="py-2 pr-3">Parameter</th>
                <th className="py-2 pr-3">Target</th>
                <th className="py-2 pr-3">Hasil</th>
                <th className="py-2 pr-3">Sumber</th>
                <th className="py-2 pr-3">Status</th>
                <th className="py-2" />
              </tr>
            </thead>
            <tbody>
              {proyek.targets.map((t) => {
                const h = batch.hasil.find((x) => x.paramId === t.id);
                const nilai = h?.nilai ?? null;
                const ok = nilai !== null && Math.abs(nilai - t.target) <= t.toleransi;
                const usulan = usulanSensor[t.id];
                return (
                  <tr key={t.id} className="border-b border-border/70">
                    <td className="py-2.5 pr-3">
                      <p className="font-semibold text-foreground">{t.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {SENSORS.find((s) => s.id === t.sensor)?.label ??
                          PARAM_LIBRARY.find((x) => x.id === t.id)?.metode ??
                          "Uji laboratorium"}
                      </p>
                    </td>
                    <td className="py-2.5 pr-3 text-muted-foreground">
                      {t.target} ± {t.toleransi} {t.unit}
                    </td>
                    <td className="py-2.5 pr-3">
                      <input
                        type="number"
                        step="0.1"
                        className="w-24 rounded-lg border border-input bg-card px-2 py-1 text-sm"
                        value={nilai ?? ""}
                        placeholder="kosong"
                        onChange={(e) => isiManual(t.id, Number(e.target.value))}
                      />
                    </td>
                    <td className="py-2.5 pr-3 text-xs text-muted-foreground">
                      {nilai === null ? "belum diisi" : h?.sumber}
                    </td>
                    <td className="py-2.5 pr-3">
                      {usulan !== undefined ? (
                        <Pill variant="waspada">usulan sensor {usulan}</Pill>
                      ) : nilai === null ? (
                        <Pill>menunggu</Pill>
                      ) : ok ? (
                        <Pill variant="aman">sesuai</Pill>
                      ) : (
                        <Pill variant="waspada">di luar toleransi</Pill>
                      )}
                    </td>
                    <td className="py-2.5 text-right">
                      {t.sensor === "manual" ? (
                        <span className="text-xs text-muted-foreground">
                          Isi manual dari alat uji
                        </span>
                      ) : usulan !== undefined ? (
                        <span className="inline-flex gap-2">
                          <GhostButton onClick={() => konfirmasiUsulan(t.id, t.sensor)}>
                            <Check className="size-3.5" /> Konfirmasi
                          </GhostButton>
                          <GhostButton onClick={() => tolakUsulan(t.id)}>
                            <X className="size-3.5" />
                          </GhostButton>
                        </span>
                      ) : (
                        <GhostButton onClick={() => usulkanDariSensor(t.id, t.sensor)}>
                          <Radio className="size-3.5" /> Usulkan dari sensor
                        </GhostButton>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="mt-5">
        <Card>
          <CardTitle title="Target dibanding hasil" sub="Pembacaan parameter batch ini" />
          <BandProvenance
            lapis="manusia"
            tambahan="Hanya menampilkan nilai yang sudah dikonfirmasi."
          />
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={perbandingan}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
              <XAxis
                dataKey="nama"
                tick={{ fontSize: 10 }}
                interval={0}
                angle={-12}
                height={50}
                textAnchor="end"
              />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="target" fill="var(--chart-3)" radius={[4, 4, 0, 0]} name="Target" />
              <Bar dataKey="hasil" fill="var(--chart-1)" radius={[4, 4, 0, 0]} name="Hasil uji" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <PanelCheckpoint proyek={proyek} batch={batch} peneliti={nama} />

      <PanelSentinel proyek={proyek} batch={batch} peneliti={nama} />

      <UjiSampelStabilitas proyek={proyek} batch={batch} peneliti={nama} />

      <Card className="mt-5">
        <CardTitle
          title={"Penutupan RnD batch " + batch.nomor}
          sub="Tambahkan masukan peneliti agar analisis AI lebih tajam."
          right={
            <Pill variant={batch.status === "dievaluasi" ? "aman" : "brand"}>{batch.status}</Pill>
          }
        />
        <textarea
          className={inputClass + " min-h-20"}
          placeholder="Masukan peneliti, misalnya tekstur terlalu berat atau aroma kurang stabil setelah dua minggu."
          value={batch.feedback}
          onChange={(e) =>
            actions.simpanBatch(proyek.id, batch.nomor, (b) => ({ ...b, feedback: e.target.value }))
          }
        />
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <PrimaryButton
            onClick={selesaikanBatch}
            disabled={!lengkap || batch.status === "dievaluasi"}
          >
            <FlaskConical className="size-4" /> RnD batch {batch.nomor} selesai
          </PrimaryButton>
          {!lengkap && (
            <span className="text-xs text-muted-foreground">
              Lengkapi seluruh parameter hasil uji sebelum menutup batch.
            </span>
          )}
        </div>
      </Card>

      {batch.evaluasi && (
        <Card className="mt-5">
          <CardTitle
            title="Evaluasi AI dan rancangan batch berikutnya"
            sub={
              "Skor kesesuaian " + batch.evaluasi.skorKesesuaian + " persen terhadap standar output"
            }
            right={
              <span className="flex items-center gap-1.5 text-xs font-semibold text-brand">
                <Sparkles className="size-4" /> Dianalisis dari jurnal dan masukan peneliti
              </span>
            }
          />
          <p className="text-sm text-foreground">{batch.evaluasi.ringkasan}</p>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                Kekurangan
              </p>
              <ul className="mt-1.5 list-disc space-y-1 pl-5 text-sm">
                {batch.evaluasi.kekurangan.map((k, i) => (
                  <li key={i}>{k}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                Rekomendasi
              </p>
              <ul className="mt-1.5 list-disc space-y-1 pl-5 text-sm">
                {batch.evaluasi.rekomendasi.map((k, i) => (
                  <li key={i}>{k}</li>
                ))}
              </ul>
            </div>
          </div>
          {batch.evaluasi.perubahanFormula.length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                Usulan perubahan formula
              </p>
              <ul className="mt-1.5 space-y-1.5 text-sm">
                {batch.evaluasi.perubahanFormula.map((p, i) => (
                  <li key={i} className="rounded-xl border border-border px-3 py-2">
                    <span className="font-semibold">{p.bahan}</span> dari {p.dari}% menjadi {p.ke}%.{" "}
                    {p.alasan}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="mt-4 rounded-xl bg-brand-soft p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-brand-ink">
              Rancangan penelitian batch {batch.nomor + 1}
            </p>
            <p className="mt-1.5 text-sm text-foreground">
              {batch.evaluasi.rancanganBerikutnya.hipotesis}
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-foreground">
              {batch.evaluasi.rancanganBerikutnya.tujuan.map((t, i) => (
                <li key={i}>{t}</li>
              ))}
            </ul>
            <p className="mt-2 text-xs text-muted-foreground">
              Fokus uji: {batch.evaluasi.rancanganBerikutnya.fokusUji.join(", ")}
            </p>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            {batch.evaluasi.skorKesesuaian < 70 && proyek.batches.length === batch.nomor && (
              <PrimaryButton onClick={buatBatchBerikut}>
                <ArrowUpRight className="size-4" /> Belum sesuai standar, buat jurnal batch{" "}
                {batch.nomor + 1}
              </PrimaryButton>
            )}
            {batch.evaluasi.skorKesesuaian >= 70 && (
              <>
                <Link to="/doc/$id" params={{ id: proyek.id }} search={{ batch: batch.nomor }}>
                  <PrimaryButton>
                    <FileText className="size-4" /> Buka laporan praktikum final
                  </PrimaryButton>
                </Link>
                <GhostButton onClick={() => unduhScaleUpBrief(proyek, batch)}>
                  <Download className="size-4" /> Download Scale Up Risk Brief
                </GhostButton>
                <Link to="/handoff/$id" params={{ id: proyek.id }}>
                  <GhostButton>
                    <Send className="size-4" /> Kirim ke divisi terkait
                  </GhostButton>
                </Link>
              </>
            )}
            {batch.evaluasi.skorKesesuaian >= 70 && proyek.batches.length === batch.nomor && (
              <GhostButton onClick={buatBatchBerikut}>
                <ArrowUpRight className="size-4" /> Tetap buat batch penyempurnaan
              </GhostButton>
            )}
          </div>
        </Card>
      )}
    </AppShell>
  );
}
