import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Lang = "pt" | "en" | "es";

type Dict = Record<string, string>;

const PT: Dict = {
  play: "JOGAR",
  community: "Comunidade",
  stats: "Estatísticas",
  achievements: "Conquistas",
  menu: "Menu",
  back: "Voltar",
  howToPlay: "Como jogar",
  howToPlayDesc: "Responda a operação exatamente no tempo 4 do metrônomo. Errar a resposta ou o tempo custa uma vida. Sobreviva e suba de nível!",
  chooseMode: "Escolha seu modo",
  lives: "Vidas",
  credits: "Créditos",
  recordL: "Recorde",
  chancesLeft: "Chances restantes",
  answerOnBeat4: "Responda no tempo 4",
  onTime: "🟢 NO TEMPO!",
  early: "🟠 ADIANTADO!",
  late: "🔴 ATRASADO!",
  levelUp: "VOCÊ SUBIU DE NÍVEL!",
  nextLevel: "Próximo nível →",
  gameOver: "Suas vidas acabaram",
  tryAgain: "Reiniciar",
  newRecord: "Você bateu seu recorde!",
  share: "Compartilhar",
  notNow: "Agora não",
  activateExplosion: "⚡ ATIVAR EXPLOSÃO",
  explosionMode: "MODO EXPLOSÃO!",
  promotionUnlocked: "PROMOÇÃO DESBLOQUEADA",
  youAreNow: "VOCÊ AGORA É",
  masterOfTables: "MESTRE DA TABUADA",
  masterOfTablesMsg: "PARABÉNS! VOCÊ SE TORNOU UM MESTRE DA TABUADA!",
  sound: "Som",
  music: "Música",
  vibration: "Vibração",
  theme: "Tema",
  language: "Idioma",
  feed: "Feed",
  ranking: "Ranking",
  profile: "Perfil",
  hideHelper: "Ocultar Super Ritmo",
  showHelper: "Mostrar Super Ritmo",
  comment: "Comentar…",
  send: "Enviar",
  publish: "Publicar",
  shareYourWin: "Compartilhe sua conquista, recorde ou progresso...",
  chooseLanguage: "🌎 Escolha seu idioma",
  welcomeTitle: "Bem-vindo ao Ritmamente Math!",
  welcomeMsg: "Olá! Eu sou o Super Ritmo, o Guardião Oficial do Tempo! Vou te ajudar a dominar o ritmo e a matemática!",
  tapToContinue: "toque para continuar",
  letsGo: "Vamos lá!",
  enabled: "ativado",
  disabled: "desativado",
  unlocked: "desbloqueadas",
};

const EN: Dict = {
  play: "PLAY",
  community: "Community",
  stats: "Statistics",
  achievements: "Achievements",
  menu: "Menu",
  back: "Back",
  howToPlay: "How to play",
  howToPlayDesc: "Answer the operation exactly on beat 4 of the metronome. A wrong answer or wrong timing costs a life. Survive and level up!",
  chooseMode: "Choose your mode",
  lives: "Lives",
  credits: "Credits",
  recordL: "Record",
  chancesLeft: "Chances left",
  answerOnBeat4: "Answer on beat 4",
  onTime: "🟢 ON TIME!",
  early: "🟠 TOO EARLY!",
  late: "🔴 TOO LATE!",
  levelUp: "YOU LEVELED UP!",
  nextLevel: "Next level →",
  gameOver: "You ran out of lives",
  tryAgain: "Restart",
  newRecord: "You beat your record!",
  share: "Share",
  notNow: "Not now",
  activateExplosion: "⚡ ACTIVATE EXPLOSION",
  explosionMode: "EXPLOSION MODE!",
  promotionUnlocked: "PROMOTION UNLOCKED",
  youAreNow: "YOU ARE NOW",
  masterOfTables: "MASTER OF TABLES",
  masterOfTablesMsg: "CONGRATULATIONS! YOU BECAME A MASTER OF TABLES!",
  sound: "Sound",
  music: "Music",
  vibration: "Vibration",
  theme: "Theme",
  language: "Language",
  feed: "Feed",
  ranking: "Ranking",
  profile: "Profile",
  hideHelper: "Hide Super Ritmo",
  showHelper: "Show Super Ritmo",
  comment: "Comment…",
  send: "Send",
  publish: "Publish",
  shareYourWin: "Share your achievement, record or progress...",
  chooseLanguage: "🌎 Choose your language",
  welcomeTitle: "Welcome to Ritmamente Math!",
  welcomeMsg: "Hello! I'm Super Ritmo, the Official Guardian of Time! I'll help you master rhythm and math!",,
  tapToContinue: "tap to continue",
  letsGo: "Let's go!",
  enabled: "enabled",
  disabled: "disabled",
  unlocked: "unlocked",
};

const ES: Dict = {
  play: "JUGAR",
  community: "Comunidad",
  stats: "Estadísticas",
  achievements: "Logros",
  menu: "Menú",
  back: "Volver",
  howToPlay: "Cómo jugar",
  howToPlayDesc: "Responde la operación exactamente en el tiempo 4 del metrónomo. Equivocarse cuesta una vida. ¡Sobrevive y sube de nivel!",
  chooseMode: "Elige tu modo",
  lives: "Vidas",
  credits: "Créditos",
  recordL: "Récord",
  chancesLeft: "Oportunidades",
  answerOnBeat4: "Responde en el tiempo 4",
  onTime: "🟢 ¡A TIEMPO!",
  early: "🟠 ¡TEMPRANO!",
  late: "🔴 ¡TARDE!",
  levelUp: "¡SUBISTE DE NIVEL!",
  nextLevel: "Siguiente nivel →",
  gameOver: "Te quedaste sin vidas",
  tryAgain: "Reiniciar",
  newRecord: "¡Batiste tu récord!",
  share: "Compartir",
  notNow: "Ahora no",
  activateExplosion: "⚡ ACTIVAR EXPLOSIÓN",
  explosionMode: "¡MODO EXPLOSIÓN!",
  promotionUnlocked: "PROMOCIÓN DESBLOQUEADA",
  youAreNow: "AHORA ERES",
  masterOfTables: "MAESTRO DE LAS TABLAS",
  masterOfTablesMsg: "¡FELICIDADES! ¡TE CONVERTISTE EN MAESTRO DE LAS TABLAS!",
  sound: "Sonido",
  music: "Música",
  theme: "Tema",
  vibration: "Vibración",
  language: "Idioma",
  feed: "Feed",
  ranking: "Ranking",
  profile: "Perfil",
  hideHelper: "Ocultar Super Ritmo",
  showHelper: "Mostrar Super Ritmo",
  comment: "Comentar…",
  send: "Enviar",
  publish: "Publicar",
  shareYourWin: "Comparte tu logro, récord o progreso...",
  chooseLanguage: "🌎 Elige tu idioma",
  welcomeTitle: "¡Bienvenido a Ritmamente Math!",
  welcomeMsg: "¡Hola! ¡Soy Super Ritmo, el Guardián Oficial del Tiempo! ¡Te ayudaré a dominar el ritmo y las matemáticas!",,
  tapToContinue: "toca para continuar",
  letsGo: "¡Vamos!",
  enabled: "activado",
  disabled: "desactivado",
  unlocked: "desbloqueadas",
};

const DICT: Record<Lang, Dict> = { pt: PT, en: EN, es: ES };

function detect(): Lang {
  if (typeof navigator === "undefined") return "pt";
  const l = (navigator.language || "pt").toLowerCase();
  if (l.startsWith("en")) return "en";
  if (l.startsWith("es")) return "es";
  return "pt";
}

interface I18nState {
  lang: Lang;
  setLang: (l: Lang) => void;
}

export const useI18n = create<I18nState>()(
  persist(
    (set) => ({ lang: detect(), setLang: (l) => set({ lang: l }) }),
    { name: "ritmamente-lang" },
  ),
);

export function t(key: string): string {
  const lang = useI18n.getState().lang;
  return DICT[lang][key] ?? PT[key] ?? key;
}

export function useT() {
  const lang = useI18n((s) => s.lang);
  return (key: string) => DICT[lang][key] ?? PT[key] ?? key;
}

export const LANG_OPTIONS: { code: Lang; label: string; flag: string }[] = [
  { code: "pt", label: "PT", flag: "🇧🇷" },
  { code: "en", label: "EN", flag: "🇺🇸" },
  { code: "es", label: "ES", flag: "🇪🇸" },
];
