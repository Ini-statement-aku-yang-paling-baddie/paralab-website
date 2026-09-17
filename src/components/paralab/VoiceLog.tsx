import { useEffect, useRef, useState } from "react";
import { Check, Mic, MicOff, X } from "lucide-react";
import { ModelApiError, postJson } from "@/lib/paralab/api";
import {
  assertConfirmable,
  toF5Request,
  toUcapanTerstruktur,
  type F5Draft,
} from "@/lib/paralab/f5-adapter";
import type { UcapanTerstruktur } from "@/lib/paralab/prediksi";

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
  const w = window as unknown as {
    SpeechRecognition?: new () => Pengenal;
    webkitSpeechRecognition?: new () => Pengenal;
  };
  const Kelas = w.SpeechRecognition ?? w.webkitSpeechRecognition;
  return Kelas ? new Kelas() : null;
}

type Props = {
  /** Identitas trial diambil dari halaman jurnal, bukan dari audio atau transkrip. */
  selectedTrialId: string;
  onTerapkan: (hasil: UcapanTerstruktur) => void;
};

export function VoiceLog({ selectedTrialId, onTerapkan }: Props) {
  const [buka, setBuka] = useState(false);
  const [dengar, setDengar] = useState(false);
  const [teks, setTeks] = useState("");
  const [didukung, setDidukung] = useState(true);
  const [draft, setDraft] = useState<F5Draft | null>(null);
  const [memuat, setMemuat] = useState(false);
  const [galat, setGalat] = useState<string | null>(null);
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

  async function buatDraft() {
    const bersih = teks.trim();
    if (bersih.length === 0 || memuat) return;

    setMemuat(true);
    setGalat(null);
    setDraft(null);

    try {
      const hasil = await postJson<F5Draft>(
        "/v1/f5/transcribe-draft",
        toF5Request(selectedTrialId, bersih),
      );
      assertConfirmable(hasil);
      setDraft(hasil);
    } catch (cause) {
      setDraft(null);
      setGalat(
        cause instanceof ModelApiError
          ? cause.message
          : cause instanceof Error
            ? cause.message
            : "Gateway model tidak dapat dihubungi.",
      );
    } finally {
      setMemuat(false);
    }
  }

  function konfirmasi() {
    if (!draft) return;
    assertConfirmable(draft);
    onTerapkan(toUcapanTerstruktur(draft, teks.trim()));
    setDraft(null);
    setTeks("");
  }

  const parameter = Object.entries(draft?.proposed_checkpoint_patch.measurements ?? {});
  const observasi = Object.entries(draft?.proposed_checkpoint_patch.observations ?? {});

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
            Ucapkan seperti biasa, contoh: pH lima koma lima, sampel homogen.
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
            placeholder={didukung ? "Transkrip langsung muncul di sini dan bisa dikoreksi cepat." : "Ketik catatan di sini untuk dijadikan draft."}
            className="mt-3 w-full rounded-xl border border-input bg-card px-3 py-2 text-sm outline-none focus:border-brand"
          />

          <button
            onClick={() => void buatDraft()}
            disabled={teks.trim().length === 0 || memuat}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl brand-gradient px-3 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50"
          >
            <Check className="size-4" />
            {memuat ? "Membuat draft…" : "Buat draft"}
          </button>

          {galat && (
            <p className="mt-3 rounded-xl border border-danger/40 bg-danger-soft px-3 py-2 text-xs text-danger">
              {galat}
            </p>
          )}

          {draft && (
            <div className="mt-3 space-y-2 rounded-xl border border-border p-3">
              <p className="text-xs font-bold text-foreground">Draft untuk trial {draft.trial_id}</p>
              <p className="text-xs font-medium text-warning">
                Draft belum masuk ke jurnal. Periksa lalu konfirmasi.
              </p>

              {parameter.length > 0 && (
                <ul className="space-y-0.5 text-xs text-muted-foreground">
                  {parameter.map(([kunci, nilai]) => (
                    <li key={kunci}>
                      {kunci}: {nilai === null ? "kosong" : nilai}
                    </li>
                  ))}
                </ul>
              )}

              {observasi.length > 0 && (
                <ul className="space-y-0.5 text-xs text-muted-foreground">
                  {observasi.map(([kunci, nilai]) => (
                    <li key={kunci}>
                      {kunci}: {nilai === null ? "kosong" : nilai}
                    </li>
                  ))}
                </ul>
              )}

              <button
                onClick={konfirmasi}
                className="flex w-full items-center justify-center gap-1.5 rounded-xl brand-gradient px-3 py-2 text-sm font-semibold text-primary-foreground"
              >
                <Check className="size-4" /> Konfirmasi dan masukkan ke jurnal
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
}
