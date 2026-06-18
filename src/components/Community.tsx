import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useGame } from "@/lib/game/store";
import { AuthPanel } from "./AuthPanel";

interface Props { onBack: () => void; }

type Tab = "feed" | "ranking" | "profile";

interface PostRow {
  id: string;
  user_id: string;
  kind: string;
  message: string | null;
  level: number | null;
  score: number | null;
  best_combo: number | null;
  bpm: number | null;
  likes_count: number;
  comments_count: number;
  created_at: string;
  profile?: { name: string; avatar: string; city: string | null; age: number | null } | null;
  liked?: boolean;
}

interface RankRow {
  id: string;
  name: string;
  avatar: string;
  best_level: number;
  best_score: number;
  best_combo: number;
  bpm_max: number;
  city: string | null;
}

export function Community({ onBack }: Props) {
  const { user, loading } = useAuth();
  const [tab, setTab] = useState<Tab>("feed");

  if (loading) return <div className="p-6 text-center text-muted-foreground">Carregando…</div>;

  return (
    <div className="relative mx-auto flex min-h-[100svh] max-w-md flex-col gap-4 p-4">
      <header className="flex items-center justify-between">
        <button onClick={onBack} className="rounded-full glass px-3 py-1.5 text-sm">← Menu</button>
        <h1 className="font-display text-xl font-black shimmer-text">COMUNIDADE</h1>
        <div className="w-16" />
      </header>

      {!user ? (
        <AuthPanel />
      ) : (
        <>
          <div className="grid grid-cols-3 gap-1 rounded-full gold-border p-1 text-sm">
            <TabBtn active={tab === "feed"} onClick={() => setTab("feed")}>Feed</TabBtn>
            <TabBtn active={tab === "ranking"} onClick={() => setTab("ranking")}>Ranking</TabBtn>
            <TabBtn active={tab === "profile"} onClick={() => setTab("profile")}>Perfil</TabBtn>
          </div>
          {tab === "feed" && <Feed userId={user.id} />}
          {tab === "ranking" && <Ranking selfId={user.id} />}
          {tab === "profile" && <ProfileView userId={user.id} />}
        </>
      )}
    </div>
  );
}

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick}
      className={"rounded-full py-2 font-bold transition " + (active ? "bg-gold-grad text-primary-foreground shadow-gold" : "text-muted-foreground")}>
      {children}
    </button>
  );
}

function Feed({ userId }: { userId: string }) {
  const [posts, setPosts] = useState<PostRow[]>([]);
  const [busy, setBusy] = useState(true);
  const [composer, setComposer] = useState("");
  const profile = useGame((s) => s.profile);
  const stats = useGame((s) => s.stats);

  async function load() {
    setBusy(true);
    const { data: postsData } = await supabase
      .from("community_posts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
    const ids = (postsData ?? []).map((p) => p.user_id);
    const { data: profilesData } = ids.length
      ? await supabase.from("profiles").select("id,name,avatar,city,age").in("id", ids)
      : { data: [] as any[] };
    const { data: likes } = await supabase
      .from("post_likes")
      .select("post_id")
      .eq("user_id", userId);
    const likedSet = new Set((likes ?? []).map((l: any) => l.post_id));
    const profileMap = new Map((profilesData ?? []).map((p: any) => [p.id, p]));
    setPosts(
      (postsData ?? []).map((p: any) => ({
        ...p,
        profile: profileMap.get(p.user_id) ?? null,
        liked: likedSet.has(p.id),
      })),
    );
    setBusy(false);
  }

  useEffect(() => { void load(); }, [userId]);

  async function publish() {
    if (!composer.trim()) return;
    await supabase.from("community_posts").insert({
      user_id: userId,
      kind: "share",
      message: composer.trim(),
      level: stats.bestLevel,
      score: stats.totalCorrect * 10 + stats.bestCombo * 5,
      best_combo: stats.bestCombo,
      bpm: stats.bpmMax,
    });
    if (profile) {
      await supabase.from("profiles").update({
        name: profile.name, avatar: profile.avatar, age: profile.age, city: profile.city, country: profile.country,
      }).eq("id", userId);
    }
    setComposer("");
    void load();
  }

  async function toggleLike(post: PostRow) {
    if (post.liked) {
      await supabase.from("post_likes").delete().eq("post_id", post.id).eq("user_id", userId);
    } else {
      await supabase.from("post_likes").insert({ post_id: post.id, user_id: userId });
    }
    void load();
  }

  return (
    <div className="space-y-3">
      <div className="rounded-2xl glass p-3">
        <textarea
          value={composer}
          onChange={(e) => setComposer(e.target.value)}
          placeholder="Compartilhe sua conquista, recorde ou progresso..."
          rows={2}
          className="w-full resize-none rounded-xl bg-card/40 p-2 text-sm outline-none"
        />
        <div className="mt-2 flex justify-end">
          <button onClick={publish} disabled={!composer.trim()}
            className="rounded-full bg-gold-grad px-4 py-1.5 text-sm font-bold text-primary-foreground shadow-gold disabled:opacity-50">
            Publicar
          </button>
        </div>
      </div>

      {busy && <div className="py-4 text-center text-sm text-muted-foreground">Carregando posts…</div>}
      {!busy && posts.length === 0 && (
        <div className="rounded-2xl glass p-6 text-center text-sm text-muted-foreground">
          Ninguém postou ainda. Seja o primeiro!
        </div>
      )}

      {posts.map((p) => <PostCard key={p.id} post={p} onLike={() => toggleLike(p)} userId={userId} />)}
    </div>
  );
}

function PostCard({ post, onLike, userId }: { post: PostRow; onLike: () => void; userId: string }) {
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<{ id: string; user_id: string; body: string; created_at: string; name?: string; avatar?: string }[]>([]);
  const [commentBody, setCommentBody] = useState("");

  async function loadComments() {
    const { data } = await supabase.from("post_comments").select("*").eq("post_id", post.id).order("created_at", { ascending: true });
    const ids = Array.from(new Set((data ?? []).map((c: any) => c.user_id)));
    const { data: pf } = ids.length ? await supabase.from("profiles").select("id,name,avatar").in("id", ids) : { data: [] as any[] };
    const map = new Map((pf ?? []).map((x: any) => [x.id, x]));
    setComments((data ?? []).map((c: any) => ({ ...c, name: map.get(c.user_id)?.name, avatar: map.get(c.user_id)?.avatar })));
  }

  async function addComment() {
    if (!commentBody.trim()) return;
    await supabase.from("post_comments").insert({ post_id: post.id, user_id: userId, body: commentBody.trim() });
    setCommentBody("");
    void loadComments();
  }

  function toggleComments() {
    const next = !showComments;
    setShowComments(next);
    if (next) void loadComments();
  }

  return (
    <motion.div initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="rounded-2xl glass p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-grad text-2xl">{post.profile?.avatar ?? "🦁"}</div>
        <div className="flex-1">
          <div className="font-bold">{post.profile?.name ?? "Jogador"}</div>
          <div className="text-[10px] text-muted-foreground">
            {post.profile?.city ? post.profile.city + " • " : ""}{new Date(post.created_at).toLocaleString("pt-BR")}
          </div>
        </div>
        {post.kind === "record" && <span className="rounded-full bg-gold-grad px-2 py-0.5 text-[10px] font-bold text-primary-foreground">RECORDE</span>}
      </div>
      {post.message && <p className="mt-3 text-sm">{post.message}</p>}
      {(post.level || post.score || post.best_combo || post.bpm) && (
        <div className="mt-3 grid grid-cols-4 gap-2 text-center text-xs">
          {post.level != null && <Stat label="Nível" value={post.level} />}
          {post.score != null && <Stat label="Pontos" value={post.score} />}
          {post.best_combo != null && <Stat label="Combo" value={post.best_combo} />}
          {post.bpm != null && <Stat label="BPM" value={post.bpm} />}
        </div>
      )}
      <div className="mt-3 flex items-center gap-4 text-sm">
        <button onClick={onLike} className={"flex items-center gap-1 " + (post.liked ? "text-gold" : "text-muted-foreground")}>
          {post.liked ? "❤" : "🤍"} {post.likes_count}
        </button>
        <button onClick={toggleComments} className="flex items-center gap-1 text-muted-foreground">
          💬 {post.comments_count}
        </button>
      </div>
      {showComments && (
        <div className="mt-3 space-y-2 border-t border-foreground/10 pt-3">
          {comments.map((c) => (
            <div key={c.id} className="flex gap-2 text-sm">
              <span className="text-lg">{c.avatar ?? "🙂"}</span>
              <div className="flex-1 rounded-xl bg-card/40 px-3 py-2">
                <div className="text-xs font-bold">{c.name ?? "Jogador"}</div>
                <div>{c.body}</div>
              </div>
            </div>
          ))}
          <div className="flex gap-2">
            <input value={commentBody} onChange={(e) => setCommentBody(e.target.value)} placeholder="Comentar…"
              className="flex-1 rounded-full gold-border bg-card/40 px-3 py-1.5 text-sm outline-none" />
            <button onClick={addComment} className="rounded-full bg-gold-grad px-3 text-sm font-bold text-primary-foreground">
              Enviar
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg gold-border bg-card/30 py-1.5">
      <div className="font-display font-black text-gold">{value}</div>
      <div className="text-[9px] uppercase text-muted-foreground">{label}</div>
    </div>
  );
}

function Ranking({ selfId }: { selfId: string }) {
  const [rows, setRows] = useState<RankRow[]>([]);
  const [busy, setBusy] = useState(true);
  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id,name,avatar,best_level,best_score,best_combo,bpm_max,city")
        .order("best_level", { ascending: false })
        .order("best_score", { ascending: false })
        .limit(100);
      setRows((data ?? []) as any);
      setBusy(false);
    })();
  }, []);
  if (busy) return <div className="py-6 text-center text-muted-foreground">Carregando…</div>;
  return (
    <div className="space-y-2">
      {rows.map((r, i) => (
        <div key={r.id}
          className={"flex items-center gap-3 rounded-2xl p-3 " + (r.id === selfId ? "bg-gold-grad text-primary-foreground" : "glass")}>
          <div className="w-7 text-center font-display text-lg font-black">{i + 1}</div>
          <div className="text-2xl">{r.avatar}</div>
          <div className="flex-1">
            <div className="font-bold">{r.name}</div>
            <div className="text-[10px] opacity-80">{r.city ?? "—"} • combo {r.best_combo} • {r.bpm_max} BPM</div>
          </div>
          <div className="text-right">
            <div className="font-display font-black">Nv {r.best_level}</div>
            <div className="text-[10px] opacity-80">{r.best_score} pts</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ProfileView({ userId }: { userId: string }) {
  const profile = useGame((s) => s.profile);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function sync() {
    if (!profile) return;
    setBusy(true);
    await supabase.from("profiles").update({
      name: profile.name, avatar: profile.avatar, pet: profile.pet,
      age: profile.age, city: profile.city, country: profile.country,
    }).eq("id", userId);
    setMsg("Perfil sincronizado!");
    setBusy(false);
    setTimeout(() => setMsg(null), 2000);
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  return (
    <div className="space-y-3">
      {profile && (
        <div className="rounded-2xl glass p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gold-grad text-4xl">{profile.avatar}</div>
            <div>
              <div className="font-display text-lg font-black">{profile.name}</div>
              <div className="text-xs text-muted-foreground">{profile.city || "—"} • {profile.country}</div>
              <div className="text-xs text-muted-foreground">{profile.age} anos</div>
            </div>
          </div>
          <button onClick={sync} disabled={busy}
            className="mt-4 w-full rounded-full bg-gold-grad py-2 text-sm font-bold text-primary-foreground shadow-gold disabled:opacity-60">
            Sincronizar perfil do jogo
          </button>
          {msg && <div className="mt-2 text-center text-xs text-gold">{msg}</div>}
        </div>
      )}
      <button onClick={signOut} className="w-full rounded-full glass py-3 font-bold">Sair</button>
    </div>
  );
}
