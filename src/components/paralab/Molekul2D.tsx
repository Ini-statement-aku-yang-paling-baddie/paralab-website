import { useEffect, useState } from "react";
import type { Ingredient } from "@/lib/paralab/data";

function sumber(b: Ingredient, urutan: number) {
  const basis = "https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/";
  const ekor = "/PNG?record_type=2d&image_size=320x320";
  const kandidat = [b.cas, b.inci.split(",")[0]!.trim(), b.name];
  const q = kandidat[urutan];
  if (!q) return null;
  return basis + encodeURIComponent(q) + ekor;
}

export function Molekul2D({ bahan, tinggi = 180 }: { bahan: Ingredient; tinggi?: number }) {
  const [urutan, setUrutan] = useState(0);
  useEffect(() => setUrutan(0), [bahan.id]);
  const src = sumber(bahan, urutan);

  return (
    <figure className="rounded-xl border border-border bg-card p-3">
      <div className="flex items-center justify-center rounded-lg bg-secondary" style={{ height: tinggi }}>
        {src ? (
          <img
            key={bahan.id + urutan}
            src={src}
            alt={"Struktur 2D molekul " + bahan.name}
            loading="lazy"
            style={{ maxHeight: tinggi - 12 }}
            className="w-auto object-contain mix-blend-multiply"
            onError={() => setUrutan((u) => u + 1)}
          />
        ) : (
          <div className="px-3 text-center">
            <p className="text-sm font-bold text-foreground">{bahan.rumus}</p>
            <p className="mt-1 text-xs text-muted-foreground">Struktur 2D belum tersedia pada basis data publik untuk bahan campuran ini.</p>
          </div>
        )}
      </div>
      <figcaption className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
        {bahan.name} · rumus {bahan.rumus} · bobot molekul {bahan.bm} g/mol · CAS {bahan.cas}. Gambar struktur bersumber dari basis data publik PubChem.
      </figcaption>
    </figure>
  );
}
