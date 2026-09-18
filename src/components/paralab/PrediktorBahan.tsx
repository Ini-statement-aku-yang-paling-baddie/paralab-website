import { useRef, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Camera, FlaskRound, Sparkles } from "lucide-react";
import {
  analisaPiksel,
  prediksiSifatBahan,
  type AnalisaCitra,
  type HasilPrediktor,
} from "@/lib/paralab/prediksi";
import { GhostButton, PrimaryButton, inputClass } from "./ui";

const CONTOH = [
  { nama: "Bakuchiol", smiles: "CC(C)=CCCC(C)(C=C)c1ccc(O)cc1" },
  { nama: "Niacinamide", smiles: "NC(=O)c1cccnc1" },
  { nama: "Minyak atsiri sereh wangi", smiles: "CC(C)=CCCC(C)CC=O" },
];

export function PrediktorBahan() {
  const [nama, setNama] = useState("");
  const [smiles, setSmiles] = useState("");
  const [kemurnian, setKemurnian] = useState(98);
  const [hasil, setHasil] = useState<HasilPrediktor | null>(null);

  const [gambar, setGambar] = useState<string | null>(null);
  const [citra, setCitra] = useState<AnalisaCitra | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function jalankan() {
    setHasil(prediksiSifatBahan({ nama, smiles, kemurnian }));
  }

  function pilihGambar(file: File) {
    const url = URL.createObjectURL(file);
    setGambar(url);
    const img = new Image();
    img.onload = () => {
      const lebar = 180;
      const tinggi = Math.max(1, Math.round((img.height / img.width) * lebar));
      const canvas = document.createElement("canvas");
      canvas.width = lebar;
      canvas.height = tinggi;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(img, 0, 0, lebar, tinggi);
      const data = ctx.getImageData(0, 0, lebar, tinggi).data;
      setCitra(analisaPiksel(data, lebar, tinggi));
    };
    img.src = url;
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-[1fr_1.4fr_auto] sm:items-end">
        <label className="block">
          <span className="text-sm font-semibold text-foreground">Nama bahan baru</span>
          <input
            className={inputClass + " mt-1.5"}
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            placeholder="Contoh: ekstrak minyak atsiri nilam"
          />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-foreground">
            Struktur molekul format SMILES
          </span>
          <input
            className={inputClass + " mt-1.5 font-mono text-xs"}
            value={smiles}
            onChange={(e) => setSmiles(e.target.value)}
            placeholder="CC(C)=CCCC(C)(C=C)c1ccc(O)cc1"
          />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-foreground">Kemurnian</span>
          <input
            type="number"
            min={50}
            max={100}
            className={inputClass + " mt-1.5"}
            value={kemurnian}
            onChange={(e) => setKemurnian(Number(e.target.value))}
          />
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <PrimaryButton onClick={jalankan}>
          <Sparkles className="size-4" /> Prediksi properti bahan
        </PrimaryButton>
        {CONTOH.map((c) => (
          <GhostButton
            key={c.nama}
            onClick={() => {
              setNama(c.nama);
              setSmiles(c.smiles);
              setHasil(prediksiSifatBahan({ nama: c.nama, smiles: c.smiles, kemurnian }));
            }}
          >
            {c.nama}
          </GhostButton>
        ))}
      </div>

      {hasil && (
        <div className="space-y-5 border-t border-border pt-5">
          <p className="text-sm text-foreground">{hasil.ringkasan}</p>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {hasil.sifat.map((s) => (
              <div key={s.label} className="rounded-xl border border-border bg-card p-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {s.label}
                  </p>
                  <span
                    className={
                      "rounded-full px-2 py-0.5 text-[10px] font-bold " +
                      (s.tingkat === "bahaya"
                        ? "bg-danger-soft text-danger"
                        : s.tingkat === "waspada"
                          ? "bg-warning-soft text-warning"
                          : "bg-success-soft text-success")
                    }
                  >
                    {s.keyakinan} persen yakin
                  </span>
                </div>
                <p className="mt-1 text-xl font-bold tracking-tight text-foreground">
                  {s.nilai}{" "}
                  <span className="text-xs font-medium text-muted-foreground">{s.unit}</span>
                </p>
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-brand"
                    style={{ width: Math.max(3, Math.min(100, s.skala)) + "%" }}
                  />
                </div>
                <p className="mt-1.5 text-xs text-muted-foreground">{s.catatan}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <div>
              <p className="text-sm font-bold text-foreground">Profil kelayakan formulasi</p>
              <div className="mt-2 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={hasil.radar}>
                    <PolarGrid stroke="var(--border)" />
                    <PolarAngleAxis dataKey="sumbu" tick={{ fontSize: 10 }} />
                    <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 9 }} />
                    <Radar
                      dataKey="nilai"
                      stroke="var(--chart-1)"
                      fill="var(--chart-1)"
                      fillOpacity={0.35}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">
                Prediksi kelarutan pada pelarut kosmetik
              </p>
              <div className="mt-2 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={hasil.kelarutanKurva} margin={{ left: -16 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis
                      dataKey="pelarut"
                      tick={{ fontSize: 9 }}
                      interval={0}
                      angle={-18}
                      textAnchor="end"
                      height={58}
                    />
                    <YAxis tick={{ fontSize: 10 }} domain={[0, 100]} />
                    <Tooltip formatter={(v: number) => v + " skor"} />
                    <Bar dataKey="kelarutan" fill="var(--chart-2)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div>
            <p className="text-sm font-bold text-foreground">
              Bahan basis data dengan profil paling mirip
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {hasil.miripDengan.map((m) => (
                <span
                  key={m.nama}
                  className="rounded-full bg-secondary px-3 py-1 text-xs text-secondary-foreground"
                >
                  {m.nama} · {m.golongan} · {m.kemiripan} persen
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="border-t border-border pt-5">
        <p className="flex items-center gap-1.5 text-sm font-bold text-foreground">
          <Camera className="size-4 text-brand" /> Analisis citra sampel dan mikroskopi
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Unggah foto sampel atau citra mikroskop emulsi. Sistem membaca tekstur dan sebaran
          kecerahan citra untuk memperkirakan homogenitas, ukuran droplet, dan tanda awal pemisahan
          fase.
        </p>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) pilihGambar(f);
          }}
        />
        <div className="mt-3 flex flex-wrap gap-2">
          <GhostButton onClick={() => fileRef.current?.click()}>
            <Camera className="size-4" /> Unggah citra sampel
          </GhostButton>
          {citra && (
            <GhostButton
              onClick={() => {
                setCitra(null);
                setGambar(null);
              }}
            >
              Hapus citra
            </GhostButton>
          )}
        </div>

        {gambar && (
          <div className="mt-4 grid gap-4 lg:grid-cols-[220px_1fr]">
            <img
              src={gambar}
              alt="Citra sampel formula yang diunggah untuk analisis mikrostruktur"
              className="h-52 w-full rounded-xl border border-border object-cover"
            />
            {citra && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <Mini label="Homogenitas" nilai={citra.homogenitas + " persen"} />
                  <Mini label="Estimasi droplet" nilai={citra.estimasiDroplet + " mikron"} />
                  <Mini label="Indeks polidispersi" nilai={String(citra.indeksPolidispersi)} />
                  <Mini label="Indikasi pemisahan" nilai={citra.skorPemisahan + " dari 100"} />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                      Distribusi ukuran droplet prediksi
                    </p>
                    <div className="mt-2 h-40">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={citra.distribusi} margin={{ left: -18 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                          <XAxis dataKey="ukuran" tick={{ fontSize: 9 }} />
                          <YAxis tick={{ fontSize: 9 }} />
                          <Tooltip
                            formatter={(v: number) => v + " persen volume"}
                            labelFormatter={(v) => v + " mikron"}
                          />
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
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                      Histogram kecerahan citra
                    </p>
                    <div className="mt-2 h-40">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={citra.histogram} margin={{ left: -18 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                          <XAxis dataKey="bin" tick={{ fontSize: 8 }} interval={1} />
                          <YAxis tick={{ fontSize: 9 }} />
                          <Tooltip />
                          <Bar dataKey="jumlah" fill="var(--chart-3)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
                <p className="flex gap-1.5 text-xs text-muted-foreground">
                  <FlaskRound className="size-4 shrink-0 text-brand" /> {citra.kesimpulan}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Mini({ label, nilai }: { label: string; nilai: string }) {
  return (
    <div className="rounded-xl bg-secondary p-2.5">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-bold text-foreground">{nilai}</p>
    </div>
  );
}
