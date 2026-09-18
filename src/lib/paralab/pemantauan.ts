import type { Batch, Project } from "./data";

const HARI = 86400000;

export type TitikFoto = {
  hari: number;
  tanggal: string;
  status: "selesai" | "hari ini" | "menunggu";
  instruksi: string;
};

export function jadwalFotoDroplet(batch: Batch, sekarang: number): TitikFoto[] {
  const mulai = new Date(batch.dibuat).getTime();
  const titik: TitikFoto[] = [];
  for (let hari = 0; hari <= 21; hari += 3) {
    const waktu = mulai + hari * HARI;
    const selisih = Math.floor((sekarang - waktu) / HARI);
    const status: TitikFoto["status"] =
      selisih >= 1 ? "selesai" : selisih >= 0 ? "hari ini" : "menunggu";
    titik.push({
      hari,
      tanggal: new Date(waktu).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      status,
      instruksi:
        hari === 0
          ? "Foto sampel droplet awal pada perbesaran 400 kali sebagai acuan nol"
          : "Foto sampel droplet perbesaran 400 kali, bandingkan D50 dengan hari nol, catat tanda krim atau koalesens",
    });
  }
  return titik;
}

export type StatusPemantauan = {
  terhenti: boolean;
  hariDiam: number;
  tahap: "penyusunan" | "pengujian" | "pemantauan stabilitas" | "siap serah terima" | "selesai";
  pesan: string;
  tugas: string[];
  fotoTertunda: TitikFoto[];
};

export function statusPemantauan(
  proyek: Project,
  batch: Batch,
  sekarang: number,
): StatusPemantauan {
  const hariDiam = Math.max(0, Math.floor((sekarang - new Date(proyek.update).getTime()) / HARI));
  const kosong = proyek.targets.filter((t) => {
    const h = batch.hasil.find((x) => x.paramId === t.id);
    return h?.nilai == null;
  });
  const skor = batch.evaluasi?.skorKesesuaian ?? 0;
  const jadwal = jadwalFotoDroplet(batch, sekarang);
  const hariTerekam = new Set((batch.citraStabilitas ?? []).map((e) => e.hari));
  const fotoTertunda = jadwal.filter((t) => t.status !== "menunggu" && !hariTerekam.has(t.hari));

  const tugas: string[] = [];
  if (kosong.length > 0)
    tugas.push(
      "Lengkapi " +
        kosong.length +
        " parameter uji yang masih kosong: " +
        kosong
          .slice(0, 4)
          .map((t) => t.label)
          .join(", "),
    );
  if (!batch.observasi.trim()) tugas.push("Tuliskan observasi proses batch " + batch.nomor);
  if (!batch.feedback.trim())
    tugas.push("Isi umpan balik peneliti sebelum menutup batch " + batch.nomor);
  if (batch.status === "pemantauan" && fotoTertunda.length > 0)
    tugas.push(
      "Unggah foto droplet hari ke " +
        fotoTertunda.map((t) => t.hari).join(", ") +
        " pada proses uji coba sampel",
    );
  if (!batch.evaluasi)
    tugas.push("Tekan selesaikan praktikum batch " + batch.nomor + " untuk mendapat evaluasi");
  if (batch.evaluasi && skor < 70)
    tugas.push("Skor kesesuaian baru " + skor + " persen, buat batch perbaikan berikutnya");
  if (batch.evaluasi && skor >= 70 && !proyek.dikirimKe)
    tugas.push("Susun laporan praktikum dan brief risiko naik skala, lalu kirim ke divisi terkait");

  let tahap: StatusPemantauan["tahap"] = "penyusunan";
  if (proyek.status === "Selesai") tahap = "selesai";
  else if (batch.status === "pemantauan") tahap = "pemantauan stabilitas";
  else if (skor >= 70) tahap = "siap serah terima";
  else if (kosong.length === 0 && batch.hasil.length > 0) tahap = "pemantauan stabilitas";
  else if (batch.hasil.some((h) => h.nilai != null)) tahap = "pengujian";

  const terhenti = hariDiam >= 7 && proyek.status !== "Selesai" && tugas.length > 0;

  const pesan = terhenti
    ? "Penelitian ini tidak diperbarui selama " +
      hariDiam +
      " hari. Selesaikan pekerjaan yang tertunda agar batch tidak kedaluwarsa."
    : tahap === "pemantauan stabilitas"
      ? "Batch berada pada tahap pemantauan sampel stabilitas. Ikuti jadwal foto droplet setiap tiga hari dan catat perubahan penampilan."
      : tahap === "siap serah terima"
        ? "Hasil batch sudah memenuhi standar. Susun laporan praktikum dan brief risiko naik skala untuk tim produksi."
        : "Penelitian berjalan normal, lanjutkan pengisian parameter uji.";

  return { terhenti, hariDiam, tahap, pesan, tugas, fotoTertunda };
}
