import { useEffect, useRef, useState } from "react";
import { SENSORS, type SensorDef } from "@/lib/paralab/data";

export type SensorReading = { id: string; nilai: number; status: "aman" | "waspada" | "bahaya" };
export type SensorFrame = { waktu: string; nilai: Record<string, number> };

function bulat(n: number, d: number) {
  return Number(n.toFixed(d));
}

function statusSensor(def: SensorDef, nilai: number): SensorReading["status"] {
  const [min, max] = def.aman;
  if (nilai < min || nilai > max) return "bahaya";
  const rentang = max - min;
  if (nilai < min + rentang * 0.08 || nilai > max - rentang * 0.08) return "waspada";
  return "aman";
}

function langkah(prev: number, def: SensorDef) {
  const tarik = (def.base - prev) * 0.12;
  const acak = (Math.random() - 0.5) * def.jitter;
  return bulat(prev + tarik + acak, def.desimal);
}

export function useSensors(riwayatMaks = 40) {
  const [readings, setReadings] = useState<SensorReading[]>(() =>
    SENSORS.map((s) => ({ id: s.id, nilai: s.base, status: statusSensor(s, s.base) })),
  );
  const [riwayat, setRiwayat] = useState<SensorFrame[]>([]);
  const nilaiRef = useRef<Record<string, number>>(Object.fromEntries(SENSORS.map((s) => [s.id, s.base])));

  useEffect(() => {
    const tick = () => {
      const next: Record<string, number> = {};
      for (const s of SENSORS) next[s.id] = langkah(nilaiRef.current[s.id] ?? s.base, s);
      nilaiRef.current = next;
      setReadings(SENSORS.map((s) => ({ id: s.id, nilai: next[s.id]!, status: statusSensor(s, next[s.id]!) })));
      setRiwayat((prev) => {
        const frame: SensorFrame = {
          waktu: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
          nilai: next,
        };
        return [...prev, frame].slice(-riwayatMaks);
      });
    };
    tick();
    const id = window.setInterval(tick, 2000);
    return () => window.clearInterval(id);
  }, [riwayatMaks]);

  return { readings, riwayat };
}

export function bacaSatuSensor(id: string) {
  const def = SENSORS.find((s) => s.id === id);
  if (!def) return null;
  return bulat(def.base + (Math.random() - 0.5) * def.jitter * 2, def.desimal);
}
