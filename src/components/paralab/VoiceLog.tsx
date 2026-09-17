import { useEffect, useRef, useState } from "react";
import { Check, Mic, MicOff, X } from "lucide-react";
import { strukturkanUcapan, type UcapanTerstruktur } from "@/lib/paralab/prediksi";

type Pengenal = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((e: { resultIndex: number; results: { length: number; [i: number]: { 0: { transcript: string }; isFinal: boolean } } }) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
};

function buatPengenal(): Pengenal | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: new () => Pengenal; webkitSpeechRecognition?: new () => Pengenal };
  const Kelas = w.SpeechRecognition ?? w.webkitSpeechRecognition;
  return Kelas ? new Kelas() : null;
}

export function VoiceLog({ onTerapkan }: { onTerapkan: (hasil: UcapanTerstruktur) => void }) {
  const [buka, setBuka] = useState(false);
  const [dengar, setDengar] = useState(false);
  const [teks, setTeks] = useState("");
  const [didukung, setDidukung] = useState(true);
  const ref = useRef<Pengenal | null>(null);

  useEffect(() => {
    const p = buatPengenal();
    if (!p) {
      setDidukung(false);
      return;
    }
    p.lang = "id-ID";
    p.continuous = true;
    p.interimResults = true;
    p.onresult = (e) => {
      let tambahan = "";
      for (let i = e.resultIndex; i < e.results.length; i += 1) {
        const r = e.results[i];
        if (r && r.isFinal) tambahan += r[0].transcript + ". ";
      }
      if (tambahan) setTeks((t) => (t + " " + tambahan).trim());
    };
    p.onerror = () => setDengar(false);
    p.onend = () => setDengar(false);
    ref.current = p;
    return () => {
      try {
        p.stop();
      } catch {
        /* pengenal sudah berhenti */
      }
    };
  }, []);

  function alihkan() {
    const p = ref.current;
    if (!p) return;
    if (dengar) {
      p.stop();
      setDengar(false);
      return;
    }
    try {
      p.start();
      setDengar(true);
    } catch {
      setDengar(false);
    }
  }

  const hasil = strukturkanUcapan(teks);
  const adaIsi = hasil.bahan.length + hasil.parameter.length + hasil.observasi.length > 0;

  return (
    <>
      <button
        onClick={() => setBuka((v) => !v)}
        title="Pencatatan suara bebas tangan"
        className="fixed bottom-6 right-6 z-30 flex size-14 items-center justify-center rounded-full brand-gradient text-primary-foreground shadow-lg print:hidden"
      >
        {buka ? <X className="size-6" /> : <Mic className="size-6" />}
      </button>

      {buka && (
        <div className="fixed bottom-24 right-6 z-30 w-[22rem] max-w-[calc(100vw-3rem)] rounded-2xl border border-border bg-card p-4 shadow-xl print:hidden">
          <p className="text-sm font-bold text-foreground">Pencatatan suara bebas tangan</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Ucapkan seperti biasa, contoh: tambah 2 persen niacinamide, larutan agak keruh, pH 5.8.
          </p>

          <button
            onClick={alihkan}
            disabled={!didukung}
            className={
              "mt-3 flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold disabled:opacity-50 " +
              (dengar ? "bg-danger-soft text-danger" : "brand-gradient text-primary-foreground")
            }
          >
            {dengar ? <MicOff className="size-4" /> : <Mic className="size-4" />}
            {dengar ? "Berhenti merekam" : didukung ? "Mulai bicara" : "Peramban tidak mendukung suara"}
          </button>

          <textarea
            value={teks}
            onChange={(e) => setTeks(e.target.value)}
            rows={3}
            placeholder={didukung ? "Transkrip langsung muncul di sini dan bisa dikoreksi cepat." : "Ketik catatan di sini untuk distrukturkan."}
            className="mt-3 w-full rounded-xl border border-input bg-card px-3 py-2 text-sm outline-none focus:border-brand"
          />

          {adaIsi && (
            <div className="mt-3 space-y-2 rounded-xl bg-secondary p-3 text-xs">
              {hasil.bahan.length > 0 && (
                <div>
                  <p className="font-bold text-foreground">Bahan terdeteksi</p>
                  <ul className="mt-1 space-y-0.5 text-muted-foreground">
                    {hasil.bahan.map((b, i) => (
                      <li key={i}>
                        {b.nama} {b.persen} persen {b.id ? "" : "(belum ada di basis data)"}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {hasil.parameter.length > 0 && (
                <div>
                  <p className="font-bold text-foreground">Parameter terdeteksi</p>
                  <ul className="mt-1 space-y-0.5 text-muted-foreground">
                    {hasil.parameter.map((p, i) => (
                      <li key={i}>
                        {p.label}: {p.nilai} {p.unit}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {hasil.observasi.length > 0 && (
                <div>
                  <p className="font-bold text-foreground">Observasi</p>
                  <ul className="mt-1 space-y-0.5 text-muted-foreground">
                    {hasil.observasi.map((o, i) => (
                      <li key={i}>{o}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          <div className="mt-3 flex gap-2">
            <button
              onClick={() => {
                onTerapkan(hasil);
                setTeks("");
              }}
              disabled={!adaIsi}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl brand-gradient px-3 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50"
            >
              <Check className="size-4" /> Masukkan ke jurnal
            </button>
            <button onClick={() => setTeks("")} className="rounded-xl border border-border px-3 py-2 text-sm font-semibold text-muted-foreground">
              Bersihkan
            </button>
          </div>
        </div>
      )}
    </>
  );
}
