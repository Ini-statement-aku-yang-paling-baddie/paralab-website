import { useRef, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Camera, FlaskRound, ImagePlus, Trash2 } from "lucide-react";
import { analisaPiksel, type AnalisaCitra } from "@/lib/paralab/prediksi";
import { GhostButton, PrimaryButton } from "./ui";

export const JENIS_UJI_CITRA = [
  "Penampilan visual sediaan",
  "Mikroskopi emulsi",
  "Uji centrifuge",
  "Uji freeze thaw",
  "Warna instrumental",
  "Uji pemisahan fase penyimpanan",
  "Uji busa cleanser",
  "Uji daya sebar",
] as const;

type Entri = {
  id: string;
  jenis: string;
  gambar: string;
  nama: string;
  citra: AnalisaCitra;
};

export function UjiCitraBatch({ nomor, onTemuan }: { nomor: number; onTemuan: (teks: string) => void }) {
  const [jenis, setJenis] = useState<string>(JENIS_UJI_CITRA[0]);
  const [entri, setEntri] = useState<Entri[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  function tambah(file: File) {
    const url = URL.createObjectURL(file);
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
      const citra = analisaPiksel(data, lebar, tinggi);
      setEntri((v) => [...v, { id: String(Date.now()) + file.name, jenis, gambar: url, nama: file.name, citra }]);
    };
    img.src = url;
  }

  function kirimTemuan() {
    const teks = entri
      .map(
        (e) =>
          "Uji berbasis citra " +
          e.jenis.toLowerCase() +
          " pada batch " +
          nomor +
          ": homogenitas " +
          e.citra.homogenitas +
          " persen, estimasi droplet " +
          e.citra.estimasiDroplet +
          " mikron, indeks polidispersi " +
          e.citra.indeksPolidispersi +
          ", indikasi pemisahan " +
          e.citra.skorPemisahan +
          " dari 100. " +
          e.citra.kesimpulan,
      )
      .join(" ");
    if (teks) onTemuan(teks);
  }

  return (
    <div className="mt-5 rounded-2xl border border-border bg-secondary/40 p-4">
      <p className="flex items-center gap-1.5 text-sm font-bold text-foreground">
        <Camera className="size-4 text-brand" /> Pengujian berbasis citra batch ke-{nomor}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        Unggah foto sampel, citra mikroskop, atau dokumentasi uji stabilitas. Sistem membaca tekstur dan sebaran kecerahan citra, lalu temuannya dapat dimasukkan langsung ke umpan balik penutupan praktikum.
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <select
          value={jenis}
          onChange={(e) => setJenis(e.target.value)}
          className="rounded-xl border border-input bg-card px-3 py-2 text-sm outline-none focus:border-brand"
        >
          {JENIS_UJI_CITRA.map((j) => (
            <option key={j} value={j}>
              {j}
            </option>
          ))}
        </select>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            const files = Array.from(e.target.files ?? []);
            for (const f of files) tambah(f);
            e.target.value = "";
          }}
        />
        <GhostButton onClick={() => fileRef.current?.click()}>
          <ImagePlus className="size-4" /> Unggah citra uji
        </GhostButton>
        {entri.length > 0 && (
          <PrimaryButton onClick={kirimTemuan}>
            <FlaskRound className="size-4" /> Masukkan temuan ke umpan balik
          </PrimaryButton>
        )}
      </div>

      <div className="mt-4 space-y-4">
        {entri.map((e) => (
          <div key={e.id} className="rounded-xl border border-border bg-card p-3">
            <div className="flex items-start gap-3">
              <img src={e.gambar} alt={"Citra uji " + e.jenis + " batch " + nomor} className="size-24 shrink-0 rounded-lg border border-border object-cover" />
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">{e.jenis}</p>
                    <p className="truncate text-xs text-muted-foreground">{e.nama}</p>
                  </div>
                  <button
                    onClick={() => setEntri((v) => v.filter((x) => x.id !== e.id))}
                    className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-danger"
                    title="Hapus citra"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <Mini label="Homogenitas" nilai={e.citra.homogenitas + " persen"} />
                  <Mini label="Estimasi droplet" nilai={e.citra.estimasiDroplet + " mikron"} />
                  <Mini label="Polidispersi" nilai={String(e.citra.indeksPolidispersi)} />
                  <Mini label="Pemisahan" nilai={e.citra.skorPemisahan + " dari 100"} />
                </div>
              </div>
            </div>

            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Distribusi ukuran droplet prediksi</p>
                <div className="mt-2 h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={e.citra.distribusi} margin={{ left: -18 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="ukuran" tick={{ fontSize: 9 }} />
                      <YAxis tick={{ fontSize: 9 }} />
                      <Tooltip formatter={(v: number) => v + " persen volume"} labelFormatter={(v) => v + " mikron"} />
                      <Area type="monotone" dataKey="volume" stroke="var(--chart-1)" fill="var(--chart-1)" fillOpacity={0.3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Histogram kecerahan citra</p>
                <div className="mt-2 h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={e.citra.histogram} margin={{ left: -18 }}>
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

            <p className="mt-2 flex gap-1.5 text-xs text-muted-foreground">
              <FlaskRound className="size-4 shrink-0 text-brand" /> {e.citra.kesimpulan}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function Mini({ label, nilai }: { label: string; nilai: string }) {
  return (
    <div className="rounded-lg bg-secondary p-2">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-bold text-foreground">{nilai}</p>
    </div>
  );
}
