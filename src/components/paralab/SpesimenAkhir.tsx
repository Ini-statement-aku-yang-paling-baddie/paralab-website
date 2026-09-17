import { useRef } from "react";
import { ImagePlus, Trash2 } from "lucide-react";
import type { GambarSpesimen } from "@/lib/paralab/data";
import { GhostButton } from "./ui";

export function SpesimenAkhir({
  value,
  onChange,
}: {
  value: GambarSpesimen | undefined;
  onChange: (value?: GambarSpesimen) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);

  function baca(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") return;
      onChange({ namaFile: file.name, gambar: reader.result, waktu: new Date().toISOString() });
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="mt-4 border border-border bg-secondary/40 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-foreground">Spesimen akhir batch</p>
          <p className="mt-0.5 text-xs text-muted-foreground">Dokumentasikan kondisi fisik sampel saat jurnal praktikum ditutup.</p>
        </div>
        <GhostButton onClick={() => fileRef.current?.click()}>
          <ImagePlus className="size-4" /> {value ? "Ganti gambar" : "Tambah gambar spesimen akhir"}
        </GhostButton>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) baca(file);
          event.target.value = "";
        }}
      />
      {value && (
        <div className="mt-4 grid gap-3 sm:grid-cols-[10rem_1fr]">
          <img src={value.gambar} alt="Spesimen akhir batch" className="h-32 w-full border border-border object-cover" />
          <div className="flex min-w-0 items-start justify-between gap-3">
            <div>
              <p className="break-all text-sm font-semibold text-foreground">{value.namaFile}</p>
              <p className="mt-1 text-xs text-muted-foreground">Tersimpan bersama feedback peneliti.</p>
            </div>
            <GhostButton onClick={() => onChange(undefined)}>
              <Trash2 className="size-4" /> Hapus
            </GhostButton>
          </div>
        </div>
      )}
    </div>
  );
}