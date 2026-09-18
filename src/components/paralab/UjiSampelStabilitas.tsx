import { useRef, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  BrainCircuit,
  Camera,
  CheckCircle2,
  ImagePlus,
  Loader2,
  Microscope,
  PlayCircle,
  Trash2,
  UserCheck,
} from "lucide-react";
import type { Batch, CitraStabilitasEntry, Project } from "@/lib/paralab/data";
import { actions } from "@/lib/paralab/store";
import { jadwalFotoDroplet } from "@/lib/paralab/pemantauan";
import { buatCitraManual } from "@/lib/paralab/timeframe";
import { analisaPiksel } from "@/lib/paralab/prediksi";
import { BATAS_CV } from "@/lib/paralab/kontrak";
import { BandProvenance, DaftarBatas } from "./BandProvenance";
import { Card, CardTitle, GhostButton, Pill, PrimaryButton } from "./ui";

type Props = {
  proyek: Project;
  batch: Batch;
  peneliti: string;
};

export function UjiSampelStabilitas({ proyek, batch, peneliti }: Props) {
  const [hari, setHari] = useState(0);
  const [dimulaiManual, setDimulaiManual] = useState(false);
  const [memproses, setMemproses] = useState(false);
  const [menganalisis, setMenganalisis] = useState(false);
  const [inputManual, setInputManual] = useState({
    homogenitas: "",
    estimasiDroplet: "",
    indeksPolidispersi: "",
    skorPemisahan: "",
    kesimpulan: "",
  });
  const fileRef = useRef<HTMLInputElement>(null);
  const jadwal = jadwalFotoDroplet(batch, Date.now());
  const entri = [...(batch.citraStabilitas ?? [])].sort((a, b) => a.hari - b.hari);
  const hariTerekam = new Set(entri.map((e) => e.hari));
  const aktif = dimulaiManual || Boolean(batch.ujiSampelDimulai) || batch.status === "pemantauan";
  const berikutnya = jadwal.find((t) => !hariTerekam.has(t.hari));
  const terakhir = entri[entri.length - 1];
  const prediksi = batch.prediksiStabilitas;

  function mulai() {
    setDimulaiManual(true);
    actions.simpanBatch(proyek.id, batch.nomor, (b) => ({
      ...b,
      status: "pemantauan",
      ujiSampelDimulai: b.ujiSampelDimulai ?? new Date().toISOString(),
    }));
    actions.catat(
      peneliti,
      proyek.judul,
      "Uji coba sampel",
      "Pemantauan stabilitas droplet batch " + batch.nomor + " dimulai",
    );
  }

  function hapus(id: string) {
    actions.simpanBatch(proyek.id, batch.nomor, (b) => ({
      ...b,
      citraStabilitas: (b.citraStabilitas ?? []).filter((e) => e.id !== id),
    }));
  }

  function tambah(file: File) {
    setDimulaiManual(true);
    setMemproses(true);
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const lebar = 420;
      const tinggi = Math.max(1, Math.round((img.height / img.width) * lebar));
      const canvas = document.createElement("canvas");
      canvas.width = lebar;
      canvas.height = tinggi;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        URL.revokeObjectURL(url);
        setMemproses(false);
        return;
      }
      ctx.drawImage(img, 0, 0, lebar, tinggi);
      const data = ctx.getImageData(0, 0, lebar, tinggi).data;
      const citra = analisaPiksel(data, lebar, tinggi);
      const entry: CitraStabilitasEntry = {
        id: String(Date.now()) + "-" + file.name,
        hari,
        waktu: new Date().toISOString(),
        namaFile: file.name,
        gambar: canvas.toDataURL("image/jpeg", 0.72),
        homogenitas: citra.homogenitas,
        estimasiDroplet: citra.estimasiDroplet,
        indeksPolidispersi: citra.indeksPolidispersi,
        skorPemisahan: citra.skorPemisahan,
        kesimpulan: citra.kesimpulan,
        distribusi: citra.distribusi,
        histogram: citra.histogram,
      };
      actions.simpanBatch(proyek.id, batch.nomor, (b) => ({
        ...b,
        status: "pemantauan",
        ujiSampelDimulai: b.ujiSampelDimulai ?? new Date().toISOString(),
        citraStabilitas: [...(b.citraStabilitas ?? []).filter((e) => e.hari !== hari), entry],
        observasi:
          (b.observasi ? b.observasi + " " : "") +
          "Foto droplet hari ke " +
          hari +
          " menunjukkan homogenitas " +
          citra.homogenitas +
          " persen, D50 estimasi " +
          citra.estimasiDroplet +
          " mikron, indikasi pemisahan " +
          citra.skorPemisahan +
          " dari 100.",
      }));
      actions.catat(
        peneliti,
        proyek.judul,
        "Foto droplet",
        "Citra stabilitas hari ke " + hari + " dianalisis untuk batch " + batch.nomor,
      );
      URL.revokeObjectURL(url);
      setMemproses(false);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      setMemproses(false);
    };
    img.src = url;
  }

  function simpanPengamatanManual() {
    const angka = [
      Number(inputManual.homogenitas),
      Number(inputManual.estimasiDroplet),
      Number(inputManual.indeksPolidispersi),
      Number(inputManual.skorPemisahan),
    ];
    if (!inputManual.kesimpulan.trim() || angka.some((nilai) => !Number.isFinite(nilai))) return;

    const entry = buatCitraManual({
      hari,
      waktu: new Date().toISOString(),
      homogenitas: angka[0]!,
      estimasiDroplet: angka[1]!,
      indeksPolidispersi: angka[2]!,
      skorPemisahan: angka[3]!,
      kesimpulan: inputManual.kesimpulan.trim(),
    });
    setDimulaiManual(true);
    actions.simpanBatch(proyek.id, batch.nomor, (b) => ({
      ...b,
      status: "pemantauan",
      ujiSampelDimulai: b.ujiSampelDimulai ?? new Date().toISOString(),
      citraStabilitas: [...(b.citraStabilitas ?? []).filter((e) => e.hari !== hari), entry],
    }));
    actions.catat(
      peneliti,
      proyek.judul,
      "Pengamatan manual",
      "Data timeframe hari ke " + hari + " diinput manual untuk batch " + batch.nomor,
    );
    setInputManual({
      homogenitas: "",
      estimasiDroplet: "",
      indeksPolidispersi: "",
      skorPemisahan: "",
      kesimpulan: "",
    });
  }

  function jalankanPrediksi() {
    if (!terakhir) return;
    setMenganalisis(true);
    window.setTimeout(() => {
      const bahanAktif = batch.bahan.filter((b) =>
        ["Vitamin", "Retinoid", "Asam Eksfolian", "Peptida", "Antioksidan"].includes(b.golongan),
      );
      const risikoPecah = Math.min(
        96,
        Math.max(4, Math.round(terakhir.skorPemisahan * 0.72 + terakhir.indeksPolidispersi * 16)),
      );
      const risikoWarna = Math.min(
        94,
        Math.max(5, Math.round(100 - terakhir.homogenitas + bahanAktif.length * 4)),
      );
      const risikoInteraksi = Math.min(92, 8 + bahanAktif.length * 9);
      const shelfLife = Math.max(
        3,
        Math.min(36, Math.round(30 - (risikoPecah + risikoWarna + risikoInteraksi) / 10)),
      );
      const minggu = Math.max(0, Math.round(hari / 7));
      const checkpoint = {
        minggu,
        ph: Number((5.4 - risikoWarna / 500).toFixed(2)),
        viskositasCp: Math.max(800, Math.round(6400 * (1 - risikoPecah / 180))),
        penampilan:
          risikoPecah >= 55 ? "phase_separation" : risikoWarna >= 45 ? "color_shift" : "uniform",
        sumber: "sensor" as const,
        dikonfirmasi: false,
        waktu: new Date().toISOString(),
      };
      actions.simpanBatch(proyek.id, batch.nomor, (b) => ({
        ...b,
        prediksiStabilitas: {
          dibuat: new Date().toISOString(),
          shelfLifeBulan: shelfLife,
          risikoPecah,
          risikoPerubahanWarna: risikoWarna,
          risikoInteraksiAktif: risikoInteraksi,
          ringkasan:
            risikoPecah >= 55
              ? "Emulsi menunjukkan risiko pemisahan fase dan memerlukan optimasi sistem emulsifier."
              : "Struktur emulsi diproyeksikan bertahan, dengan pemantauan warna dan viskositas tetap diperlukan.",
          mitigasi: [
            "Konfirmasi pH dan viskositas pada setiap titik waktu sebelum keputusan batch.",
            risikoPecah >= 40
              ? "Evaluasi rasio emulsifier, energi homogenisasi, dan urutan pendinginan."
              : "Pertahankan rasio emulsifier dan profil pendinginan batch ini.",
            risikoWarna >= 35
              ? "Kurangi paparan cahaya dan oksigen, lalu evaluasi antioksidan serta kelator."
              : "Pantau ΔE dan kondisi kemasan selama studi dipercepat.",
          ],
        },
        checkpoints: [...(b.checkpoints ?? []).filter((c) => c.minggu !== minggu), checkpoint],
      }));
      actions.catat(
        peneliti,
        proyek.judul,
        "Prediksi stabilitas",
        "Prediksi timeframe batch " +
          batch.nomor +
          " dibuat dan checkpoint minggu ke-" +
          minggu +
          " diusulkan",
      );
      setMenganalisis(false);
    }, 1800);
  }

  function konfirmasiCheckpoint(minggu: number) {
    actions.simpanBatch(proyek.id, batch.nomor, (b) => ({
      ...b,
      checkpoints: (b.checkpoints ?? []).map((c) =>
        c.minggu === minggu ? { ...c, dikonfirmasi: true, dikonfirmasiOleh: peneliti } : c,
      ),
    }));
  }

  return (
    <Card className="mt-5">
      <CardTitle
        title="Uji timeframe dan prediktif stabilitas"
        sub="Satu alur untuk gambar sampel, simulasi shelf life, interaksi bahan aktif, risiko emulsi, perubahan warna, dan checkpoint."
        right={
          <Pill variant={aktif ? "brand" : "netral"}>{aktif ? "berjalan" : "belum dimulai"}</Pill>
        }
      />

      <BandProvenance
        lapis="heuristik"
        tambahan="Analisis citra dan simulasi hanya mengusulkan checkpoint. Peneliti tetap wajib mengonfirmasi hasil pengamatan."
      />

      {!aktif ? (
        <div className="rounded-xl border border-border bg-secondary p-4">
          <p className="flex items-center gap-2 text-sm font-bold text-foreground">
            <Microscope className="size-4 text-brand" /> Mulai setelah sampel batch siap dipantau
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Sistem akan membuat jadwal foto hari 0, 3, 6, 9, 12, 15, 18, dan 21. Setiap foto akan
            menghasilkan grafik tren droplet, homogenitas, dan indikasi pemisahan fase.
          </p>
          <PrimaryButton className="mt-3" onClick={mulai}>
            <PlayCircle className="size-4" /> Mulai proses uji coba sampel
          </PrimaryButton>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {jadwal.map((t) => {
              const terekam = hariTerekam.has(t.hari);
              const due = !terekam && t.status !== "menunggu";
              return (
                <button
                  key={t.hari}
                  type="button"
                  onClick={() => setHari(t.hari)}
                  className={
                    "rounded-xl border p-3 text-left text-xs transition-colors " +
                    (hari === t.hari
                      ? "border-brand bg-brand-soft text-brand-ink"
                      : terekam
                        ? "border-success/50 bg-success-soft text-success"
                        : due
                          ? "border-warning/60 bg-warning-soft text-warning"
                          : "border-border bg-card text-muted-foreground hover:bg-secondary")
                  }
                >
                  <p className="flex items-center gap-1.5 font-bold">
                    {terekam ? (
                      <CheckCircle2 className="size-3.5" />
                    ) : (
                      <Camera className="size-3.5" />
                    )}{" "}
                    Hari ke {t.hari}
                  </p>
                  <p className="mt-0.5">{t.tanggal}</p>
                  <p className="mt-1">
                    {terekam ? "foto terekam" : due ? "perlu input foto" : "menunggu jadwal"}
                  </p>
                </button>
              );
            })}
          </div>

          <div className="rounded-xl border border-border bg-secondary/60 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-foreground">
                  Input foto droplet hari ke {hari}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Gunakan foto mikroskop perbesaran 400 kali dari sampel stabilitas. Satu hari
                  pengamatan menyimpan satu citra terakhir.
                </p>
              </div>
              <GhostButton onClick={() => fileRef.current?.click()}>
                <ImagePlus className="size-4" /> {memproses ? "Menganalisis" : "Unggah foto"}
              </GhostButton>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) tambah(file);
                e.target.value = "";
              }}
            />
            <div className="mt-4 border-t border-border pt-4">
              <p className="text-sm font-bold text-foreground">Atau input data pengamatan manual</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Gunakan opsi ini bila tidak ada foto. Semua metrik harus dicatat oleh peneliti.
              </p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {[
                  ["homogenitas", "Homogenitas (%)"],
                  ["estimasiDroplet", "D50 droplet (µm)"],
                  ["indeksPolidispersi", "Indeks polidispersi"],
                  ["skorPemisahan", "Skor pemisahan (0-100)"],
                ].map(([key, label]) => (
                  <label key={key} className="text-xs font-semibold text-muted-foreground">
                    {label}
                    <input
                      type="number"
                      step="any"
                      value={inputManual[key as keyof typeof inputManual]}
                      onChange={(e) => setInputManual((v) => ({ ...v, [key]: e.target.value }))}
                      className="mt-1 w-full rounded-lg border border-input bg-card px-2 py-1.5 text-sm text-foreground"
                    />
                  </label>
                ))}
              </div>
              <label className="mt-2 block text-xs font-semibold text-muted-foreground">
                Kesimpulan pengamatan
                <textarea
                  rows={2}
                  value={inputManual.kesimpulan}
                  onChange={(e) => setInputManual((v) => ({ ...v, kesimpulan: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-input bg-card px-2 py-1.5 text-sm text-foreground"
                />
              </label>
              <PrimaryButton className="mt-3" onClick={simpanPengamatanManual}>
                Simpan data manual hari ke {hari}
              </PrimaryButton>
            </div>
            {berikutnya && (
              <p className="mt-2 text-xs text-muted-foreground">
                Titik berikutnya yang belum lengkap: hari ke {berikutnya.hari},{" "}
                {berikutnya.instruksi}.
              </p>
            )}
          </div>

          {entri.length > 0 && (
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-xl border border-border p-4">
                <p className="text-sm font-bold text-foreground">Grafik tren stabilitas droplet</p>
                <div className="mt-3 h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={entri} margin={{ left: -18 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis
                        dataKey="hari"
                        tick={{ fontSize: 10 }}
                        label={{ value: "Hari", position: "insideBottom", offset: -4 }}
                      />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="estimasiDroplet"
                        name="D50 prediksi"
                        stroke="var(--chart-1)"
                        strokeWidth={2}
                      />
                      <Line
                        type="monotone"
                        dataKey="homogenitas"
                        name="Homogenitas"
                        stroke="var(--chart-3)"
                        strokeWidth={2}
                      />
                      <Line
                        type="monotone"
                        dataKey="skorPemisahan"
                        name="Pemisahan"
                        stroke="var(--chart-5)"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="rounded-xl border border-border p-4">
                <p className="text-sm font-bold text-foreground">
                  Distribusi droplet citra terakhir
                </p>
                {terakhir?.gambar && (
                  <div className="mt-3 grid gap-3 sm:grid-cols-[8rem_1fr]">
                    <img
                      src={terakhir.gambar}
                      alt={"Foto droplet hari ke " + terakhir.hari}
                      className="h-32 w-full rounded-lg border border-border object-cover"
                    />
                    <div className="h-32">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={terakhir.distribusi} margin={{ left: -18 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                          <XAxis dataKey="ukuran" tick={{ fontSize: 9 }} />
                          <YAxis tick={{ fontSize: 9 }} />
                          <Tooltip />
                          <Area
                            type="monotone"
                            dataKey="volume"
                            stroke="var(--chart-1)"
                            fill="var(--chart-1)"
                            fillOpacity={0.3}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
                <div className="mt-3 space-y-2">
                  {entri.map((e) => (
                    <div
                      key={e.id}
                      className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2 text-xs"
                    >
                      <span>
                        <span className="font-bold text-foreground">Hari {e.hari}</span>
                        <span className="ml-2 text-muted-foreground">
                          D50 {e.estimasiDroplet} mikron, homogenitas {e.homogenitas} persen
                        </span>
                      </span>
                      <button
                        onClick={() => hapus(e.id)}
                        className="text-muted-foreground hover:text-danger"
                        title="Hapus foto droplet"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="border-t border-border pt-4">
            <PrimaryButton onClick={jalankanPrediksi} disabled={!terakhir || menganalisis}>
              {menganalisis ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <BrainCircuit className="size-4" />
              )}
              {menganalisis
                ? "AI menganalisis citra, formula, dan timeframe"
                : "Mulai jalankan uji prediktif stabilitas"}
            </PrimaryButton>
            {menganalisis && (
              <div className="mt-3 h-1.5 overflow-hidden bg-secondary">
                <span className="block h-full w-2/3 animate-pulse bg-brand" />
              </div>
            )}
          </div>

          {prediksi && (
            <div className="space-y-4 border-t border-border pt-4">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <MiniPrediksi
                  label="Shelf life proyeksi"
                  nilai={prediksi.shelfLifeBulan + " bulan"}
                />
                <MiniPrediksi label="Risiko pecah emulsi" nilai={prediksi.risikoPecah + "%"} />
                <MiniPrediksi
                  label="Risiko perubahan warna"
                  nilai={prediksi.risikoPerubahanWarna + "%"}
                />
                <MiniPrediksi
                  label="Interaksi bahan aktif"
                  nilai={prediksi.risikoInteraksiAktif + "%"}
                />
              </div>
              <p className="text-sm text-foreground">{prediksi.ringkasan}</p>
              <ul className="list-disc space-y-1 pl-5 text-xs text-muted-foreground">
                {prediksi.mitigasi.map((m) => (
                  <li key={m}>{m}</li>
                ))}
              </ul>
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  Checkpoint stabilitas yang diusulkan
                </p>
                <div className="mt-2 overflow-x-auto">
                  <table className="table-clear w-full text-sm">
                    <thead>
                      <tr>
                        <th>Minggu</th>
                        <th>pH</th>
                        <th>Viskositas</th>
                        <th>Penampilan</th>
                        <th>Status</th>
                        <th>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(batch.checkpoints ?? []).map((c) => (
                        <tr key={c.minggu}>
                          <td>{c.minggu}</td>
                          <td>{c.ph}</td>
                          <td>{c.viskositasCp} cP</td>
                          <td>{c.penampilan.replaceAll("_", " ")}</td>
                          <td>{c.dikonfirmasi ? "Dikonfirmasi" : "Usulan AI"}</td>
                          <td>
                            {!c.dikonfirmasi && (
                              <GhostButton onClick={() => konfirmasiCheckpoint(c.minggu)}>
                                <UserCheck className="size-4" /> Konfirmasi
                              </GhostButton>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      <DaftarBatas judul="Batas analisis citra" batas={BATAS_CV} />
    </Card>
  );
}

function MiniPrediksi({ label, nilai }: { label: string; nilai: string }) {
  return (
    <div className="border border-border bg-secondary/50 p-3 text-center">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-lg font-semibold text-foreground">{nilai}</p>
    </div>
  );
}
