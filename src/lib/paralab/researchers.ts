import dina from "@/assets/researcher-dina.jpg";
import farhan from "@/assets/researcher-farhan.jpg";
import intan from "@/assets/researcher-intan.jpg";
import nadia from "@/assets/researcher-nadia.jpg";
import raka from "@/assets/researcher-raka.jpg";
import samuel from "@/assets/researcher-samuel.jpg";

const FOTO_PENELITI: Record<string, string> = {
  "Dina Aprilia": dina,
  "Farhan Maulana": farhan,
  "Intan Rahmawati": intan,
  "Nadia Puspita": nadia,
  "Raka Wijaya": raka,
  "Samuel Kevin": samuel,
};

export function fotoPeneliti(nama: string) {
  return FOTO_PENELITI[nama];
}