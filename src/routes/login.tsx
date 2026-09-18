import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Eye, FlaskConical } from "lucide-react";
import { Logo } from "@/components/paralab/AppShell";
import { Field, GhostButton, PrimaryButton, inputClass } from "@/components/paralab/ui";
import { RESEARCHERS } from "@/lib/paralab/data";
import { actions } from "@/lib/paralab/store";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Akses Ruang Kerja | paralab.ai" },
      {
        name: "description",
        content:
          "Pilih profil peneliti atau buka dashboard contoh paralab.ai untuk melihat alur riset formulasi.",
      },
      { property: "og:title", content: "Akses Ruang Kerja | paralab.ai" },
      {
        property: "og:description",
        content: "Akses dashboard riset, monitoring sensor laboratorium, dan jurnal praktikum elektronik.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LoginPage,
});

export function LoginPage() {
  const navigate = useNavigate();
  const [nama, setNama] = useState(RESEARCHERS[0]!);
  const [peran, setPeran] = useState("RnD Formulator");

  function masukSebagaiPeneliti() {
    actions.login(nama, peran);
    navigate({ to: "/dashboard" });
  }

  function bukaContoh() {
    actions.login("Tamu Demo", "Pengamat");
    navigate({ to: "/dashboard" });
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="brand-gradient grid-lab relative hidden flex-col justify-between p-10 lg:flex">
        <Logo light />
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-foreground/70">
            paralab.ai
          </p>
          <h2 className="mt-3 max-w-md text-3xl font-bold leading-tight">
            Satu ruang kerja untuk formula, sensor, dan jurnal praktikum.
          </h2>
          <p className="mt-3 max-w-md text-sm opacity-90">
            Pilih profil untuk melanjutkan pekerjaan RnD, atau buka contoh dashboard untuk memahami
            alurnya lebih dulu.
          </p>
        </div>
        <p className="text-xs opacity-75">Prototipe riset internal untuk tim R&amp;D Vinara</p>
      </div>

      <main className="flex items-center justify-center px-6 py-14">
        <div className="w-full max-w-md">
          <div className="lg:hidden">
            <Logo />
          </div>
          <button
            type="button"
            onClick={() => navigate({ to: "/" })}
            className="mt-6 text-sm font-semibold text-brand hover:underline"
          >
            Kembali ke beranda
          </button>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-foreground">Akses ruang kerja</h1>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            Prototipe ini belum memakai autentikasi akun. Identitas di bawah hanya menyesuaikan
            konteks kerja dan logbook pada perangkat ini.
          </p>

          <section className="mt-7 rounded-xl border border-border bg-card p-5">
            <div className="flex items-start gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand">
                <FlaskConical className="size-4" />
              </span>
              <div>
                <h2 className="text-base font-semibold text-foreground">Masuk sebagai peneliti</h2>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  Gunakan ini saat ingin membuat atau memperbarui jurnal penelitian.
                </p>
              </div>
            </div>

            <form
              className="mt-5 space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                masukSebagaiPeneliti();
              }}
            >
              <Field label="Nama peneliti">
                <select className={inputClass} value={nama} onChange={(event) => setNama(event.target.value)}>
                  {RESEARCHERS.map((researcher) => (
                    <option key={researcher} value={researcher}>
                      {researcher}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Peran">
                <select className={inputClass} value={peran} onChange={(event) => setPeran(event.target.value)}>
                  {["RnD Formulator", "Team Lead RnD", "Analis Laboratorium", "Regulatory Specialist"].map(
                    (role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ),
                  )}
                </select>
              </Field>
              <PrimaryButton type="submit" className="w-full">
                Lanjut sebagai peneliti <ArrowRight className="size-4" />
              </PrimaryButton>
            </form>
          </section>

          <section className="mt-4 rounded-xl border border-border p-5">
            <div className="flex items-start gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-foreground">
                <Eye className="size-4" />
              </span>
              <div>
                <h2 className="text-base font-semibold text-foreground">Lihat tanpa akun</h2>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  Buka dashboard contoh untuk melihat proyek, batch, dan kondisi laboratorium tanpa
                  mengaku sebagai anggota tim.
                </p>
              </div>
            </div>
            <GhostButton onClick={bukaContoh} className="mt-4 w-full">
              Buka dashboard contoh <ArrowRight className="size-4" />
            </GhostButton>
          </section>
        </div>
      </main>
    </div>
  );
}
