/**
 * Kebijakan akses prototipe dibuat kecil dan eksplisit agar jalur tamu mudah
 * dipahami. Pengamat dapat melihat dashboard dan monitoring lab; peran riset
 * memiliki akses workspace penuh sampai ada otorisasi backend nyata.
 */
export function bolehAksesRuangKerja(peran: string | undefined, path: string): boolean {
  if (peran !== "Pengamat") return true;
  return path === "/dashboard" || path === "/iot";
}

/** Mencegah redirect login mengarah ke URL eksternal atau kembali ke login. */
export function tujuanSetelahMasuk(next: string | undefined): string {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next === "/login") {
    return "/dashboard";
  }
  return next;
}
