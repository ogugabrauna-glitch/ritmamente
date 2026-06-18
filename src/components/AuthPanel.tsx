import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";

interface Props { onAuthed?: () => void; }

export function AuthPanel({ onAuthed }: Props) {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { name: name || email.split("@")[0] },
          },
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      onAuthed?.();
    } catch (err: any) {
      setError(err?.message || "Erro de autenticação");
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogle() {
    setBusy(true);
    setError(null);
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (result.error) { setError(String(result.error)); setBusy(false); return; }
    if (result.redirected) return;
    onAuthed?.();
    setBusy(false);
  }

  return (
    <div className="mx-auto w-full max-w-md rounded-3xl glass p-6 shadow-card">
      <h2 className="font-display text-2xl font-black text-gold">
        {mode === "signin" ? "Entrar na Comunidade" : "Criar Conta"}
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">Acesse o ranking global e poste seus recordes.</p>

      <button onClick={handleGoogle} disabled={busy}
        className="mt-5 w-full rounded-full bg-white py-3 font-bold text-black shadow-card disabled:opacity-60">
        Continuar com Google
      </button>

      <div className="my-4 flex items-center gap-2 text-xs text-muted-foreground">
        <div className="h-px flex-1 bg-foreground/10" /> ou <div className="h-px flex-1 bg-foreground/10" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {mode === "signup" && (
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome"
            className="w-full rounded-xl gold-border bg-card/40 px-3 py-2 outline-none" />
        )}
        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required placeholder="email@exemplo.com"
          className="w-full rounded-xl gold-border bg-card/40 px-3 py-2 outline-none" />
        <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required minLength={6} placeholder="senha (mínimo 6)"
          className="w-full rounded-xl gold-border bg-card/40 px-3 py-2 outline-none" />
        {error && <div className="text-xs text-[color:var(--danger)]">{error}</div>}
        <button type="submit" disabled={busy}
          className="w-full rounded-full bg-gold-grad py-3 font-bold text-primary-foreground shadow-gold disabled:opacity-60">
          {busy ? "..." : mode === "signin" ? "Entrar" : "Criar conta"}
        </button>
      </form>

      <button onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
        className="mt-4 w-full text-xs text-muted-foreground hover:text-gold">
        {mode === "signin" ? "Não tem conta? Criar agora" : "Já tem conta? Entrar"}
      </button>
    </div>
  );
}
