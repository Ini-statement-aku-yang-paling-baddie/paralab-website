/**
 * Kebijakan akses prototipe dibuat kecil dan eksplisit agar jalur tamu mudah
 * dipahami. Peran riset memiliki akses workspace yang sama sampai ada backend
 * autentikasi dan otorisasi nyata.
 */
export function bolehAksesRuangKerja(peran: string | undefined, path: string): boolean {
  return peran !== "Pengamat" || path === "/dashboard";
}

/** Mencegah redirect login mengarah ke URL eksternal atau kembali ke login. */
export function tujuanSetelahMasuk(next: string | undefined): string {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next === "/login") {
    return "/dashboard";
  }
  return next;
}
