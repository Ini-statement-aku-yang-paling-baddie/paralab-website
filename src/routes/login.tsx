import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { Logo } from "@/components/paralab/AppShell";
import { Field, PrimaryButton, inputClass } from "@/components/paralab/ui";
import { RESEARCHERS } from "@/lib/paralab/data";
import { actions } from "@/lib/paralab/store";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Masuk Peneliti | paralab.ai" },
      { name: "description", content: "Masuk ke ruang kerja riset formulasi paralab.ai untuk melanjutkan jurnal praktikum dan memantau laboratorium." },
      { property: "og:title", content: "Masuk Peneliti | paralab.ai" },
      { property: "og:description", content: "Akses dashboard riset, monitoring sensor laboratorium, dan jurnal praktikum elektronik." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [nama, setNama] = useState(RESEARCHERS[0]!);
  const [peran, setPeran] = useState("RnD Formulator");

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="brand-gradient grid-lab relative hidden flex-col justify-between p-10 lg:flex">
        <Logo light />
        <div>
          <h2 className="max-w-md text-3xl font-bold leading-tight">
            Satu ruang kerja untuk formula, sensor, dan jurnal praktikum.
          </h2>
          <p className="mt-3 max-w-md text-sm opacity-90">
            Setiap parameter penelitian terhubung langsung ke sensor laboratorium, sehingga hasil uji tercatat objektif dari batch pertama sampai serah terima ke divisi terkait.
          </p>
        </div>
        <p className="text-xs opacity-75">Prototipe riset internal untuk tim R&amp;D Paragon</p>
      </div>

      <div className="flex items-center justify-center px-6 py-14">
        <div className="w-full max-w-sm">
          <div className="lg:hidden">
            <Logo />
          </div>
          <h1 className="mt-6 text-2xl font-bold tracking-tight text-foreground">Masuk sebagai peneliti</h1>
          <p className="mt-1 text-sm text-muted-foreground">Pilih identitas peneliti untuk membuka ruang kerja riset.</p>

          <form
            className="mt-7 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              actions.login(nama, peran);
              navigate({ to: "/dashboard" });
            }}
          >
            <Field label="Nama peneliti">
              <select className={inputClass} value={nama} onChange={(e) => setNama(e.target.value)}>
                {RESEARCHERS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Peran">
              <select className={inputClass} value={peran} onChange={(e) => setPeran(e.target.value)}>
                {["RnD Formulator", "Team Lead RnD", "Analis Laboratorium", "Regulatory Specialist"].map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Kata sandi">
              <input className={inputClass} type="password" defaultValue="paralab2026" />
            </Field>
            <PrimaryButton type="submit" className="w-full">
              Masuk ke dashboard <ArrowRight className="size-4" />
            </PrimaryButton>
          </form>
        </div>
      </div>
    </div>
  );
}
