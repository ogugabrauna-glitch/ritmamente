import { useState } from "react";
import { motion } from "framer-motion";
import { AVATARS, PETS, useGame } from "@/lib/game/store";
import type { Profile } from "@/lib/game/types";
import { RitmizinhoMascot } from "./RitmizinhoMascot";
import { useT } from "@/lib/i18n";

interface Props { onDone: () => void; }

type Step = "welcome" | "form" | "avatar" | "pet";

export function Onboarding({ onDone }: Props) {
  const setProfile = useGame(s => s.setProfile);
  const t = useT();
  const [step, setStep] = useState<Step>("welcome");
  const [form, setForm] = useState({ name: "", age: "", city: "", country: "Brasil" });
  const [avatar, setAvatar] = useState<string>("");
  const [photo, setPhoto] = useState<string>("");

  function onPickPhoto(file?: File | null) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      // Reduz a imagem para evitar localStorage cheio
      const img = new Image();
      img.onload = () => {
        const size = 256;
        const c = document.createElement("canvas");
        c.width = size; c.height = size;
        const ctx = c.getContext("2d")!;
        const s = Math.min(img.width, img.height);
        const sx = (img.width - s) / 2;
        const sy = (img.height - s) / 2;
        ctx.drawImage(img, sx, sy, s, s, 0, 0, size, size);
        setPhoto(c.toDataURL("image/jpeg", 0.85));
        setAvatar("__photo__");
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  }
  const [pet, setPet] = useState<string>("");

  function finish(petId: string) {
    const p: Profile = {
      name: form.name.trim(),
      age: Number(form.age) || 10,
      city: form.city.trim(),
      country: form.country.trim(),
      avatar: avatar === "__photo__" ? photo : (AVATARS.find(a => a.id === avatar)?.emoji ?? "🦁"),
      pet: PETS.find(x => x.id === petId)?.emoji ?? "🐉",
      createdAt: Date.now(),
    };
    setProfile(p);
    onDone();
  }

  return (
    <div className="relative flex min-h-[100svh] items-center justify-center p-4">
      <motion.div
        initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-md rounded-3xl glass p-6 shadow-card"
      >
        {step === "welcome" && (
          <div className="text-center">
            <div className="mx-auto flex justify-center">
              <RitmizinhoMascot size={140} mood="wave" level={1} />
            </div>
            <h1 className="mt-3 font-display text-3xl font-black shimmer-text">RITMAMENTE MATH</h1>
            <p className="mt-2 text-sm text-muted-foreground">{t("welcomeMsg")}</p>
            <button onClick={() => setStep("form")}
                    className="mt-6 w-full rounded-full bg-gold-grad py-3 font-bold text-primary-foreground shadow-gold">
              {t("letsGo")}
            </button>
          </div>
        )}

        {step === "form" && (
          <form onSubmit={(e) => { e.preventDefault(); if (form.name) setStep("avatar"); }} className="space-y-3">
            <h2 className="font-display text-xl font-bold text-gold">Quem é você?</h2>
            <Field label="Nome" value={form.name} onChange={v => setForm({...form, name: v})} required />
            <div className="grid grid-cols-2 gap-3">
              <Field label="Idade" type="number" value={form.age} onChange={v => setForm({...form, age: v})} required />
              <Field label="Cidade" value={form.city} onChange={v => setForm({...form, city: v})} />
            </div>
            <Field label="País" value={form.country} onChange={v => setForm({...form, country: v})} />
            <button type="submit" className="mt-2 w-full rounded-full bg-gold-grad py-3 font-bold text-primary-foreground shadow-gold">
              Continuar →
            </button>
          </form>
        )}

        {step === "avatar" && (
          <div>
            <h2 className="font-display text-xl font-bold text-gold">Escolha seu avatar</h2>
            <p className="text-xs text-muted-foreground">Mais avatares serão liberados conforme você evolui.</p>
            <div className="mt-4 grid grid-cols-5 gap-2">
              {AVATARS.map(a => (
                <motion.button
                  key={a.id}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setAvatar(a.id)}
                  className={"flex flex-col items-center gap-1 rounded-xl p-2 transition " +
                    (avatar === a.id ? "bg-gold-grad text-primary-foreground shadow-gold" : "gold-border bg-card/40")}
                >
                  <span className="text-2xl">{a.emoji}</span>
                  <span className="text-[10px] font-bold">{a.name}</span>
                </motion.button>
              ))}
            </div>

            <div className="mt-4 rounded-2xl gold-border bg-card/40 p-3">
              <div className="flex items-center gap-3">
                {photo ? (
                  <img src={photo} alt="" className="h-14 w-14 rounded-xl object-cover gold-border" />
                ) : (
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-card/60 text-2xl">📷</div>
                )}
                <div className="flex-1">
                  <div className="text-xs font-bold">Ou use sua própria foto</div>
                  <label className="mt-1 inline-block cursor-pointer rounded-full bg-gold-grad px-3 py-1 text-xs font-bold text-primary-foreground shadow-gold">
                    {photo ? "Trocar foto" : "Escolher foto"}
                    <input type="file" accept="image/*" className="hidden"
                      onChange={(e) => onPickPhoto(e.target.files?.[0])} />
                  </label>
                  {photo && (
                    <button onClick={() => { setPhoto(""); if (avatar === "__photo__") setAvatar(""); }}
                            className="ml-2 text-[10px] text-muted-foreground underline">remover</button>
                  )}
                </div>
                {photo && (
                  <button
                    onClick={() => setAvatar("__photo__")}
                    className={"rounded-full px-2 py-1 text-[10px] font-bold " +
                      (avatar === "__photo__" ? "bg-gold-grad text-primary-foreground shadow-gold" : "gold-border")}
                  >
                    usar
                  </button>
                )}
              </div>
            </div>
            <button disabled={!avatar} onClick={() => setStep("pet")}
                    className="mt-5 w-full rounded-full bg-gold-grad py-3 font-bold text-primary-foreground shadow-gold disabled:opacity-40">
              Continuar →
            </button>
          </div>
        )}

        {step === "pet" && (
          <div>
            <h2 className="font-display text-xl font-bold text-gold">Adote seu Pet Rítmico</h2>
            <p className="text-xs text-muted-foreground">Ele evolui com você.</p>
            <div className="mt-4 grid grid-cols-3 gap-3">
              {PETS.map(p => (
                <motion.button
                  key={p.id}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setPet(p.id)}
                  className={"flex flex-col items-center gap-1 rounded-2xl p-3 transition " +
                    (pet === p.id ? "bg-gold-grad text-primary-foreground shadow-gold" : "gold-border bg-card/40")}
                >
                  <span className="text-4xl">{p.emoji}</span>
                  <span className="text-xs font-bold">{p.name}</span>
                </motion.button>
              ))}
            </div>
            <button disabled={!pet} onClick={() => finish(pet)}
                    className="mt-5 w-full rounded-full bg-gold-grad py-3 font-bold text-primary-foreground shadow-gold disabled:opacity-40">
              Entrar no jogo →
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}

function Field(props: { label: string; value: string; onChange: (v:string)=>void; type?: string; required?: boolean }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted-foreground">{props.label}</span>
      <input
        type={props.type ?? "text"}
        value={props.value}
        required={props.required}
        onChange={e => props.onChange(e.target.value)}
        className="w-full rounded-xl gold-border bg-card/40 px-3 py-2 outline-none focus:ring-2 focus:ring-[color:var(--gold)]"
      />
    </label>
  );
}
