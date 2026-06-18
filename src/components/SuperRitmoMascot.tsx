import { motion } from "framer-motion";

export type SuperRitmoMood = "idle" | "happy" | "sad" | "dance" | "wave" | "wow" | "celebrate";

export function superRitmoTier(level: number) {
  if (level >= 100) return { tier: 6, name: "Guardião Supremo do Tempo", accent: "👑", glow: true, capaBrilho: true };
  if (level >= 80)  return { tier: 5, name: "Lenda do Ritmo", accent: "🌟", glow: true, capaBrilho: true };
  if (level >= 60)  return { tier: 4, name: "Mestre da Harmonia", accent: "🎼", glow: true, capaBrilho: false };
  if (level >= 40)  return { tier: 3, name: "Capitão do Ritmo", accent: "⚡", glow: false, capaBrilho: false };
  if (level >= 20)  return { tier: 2, name: "Guardião do Compasso", accent: "🎵", glow: false, capaBrilho: false };
  return { tier: 1, name: "Super Ritmo Aprendiz", accent: "🎸", glow: false, capaBrilho: false };
}

/**
 * SUPER RITMO — O Guardião Oficial do Tempo
 * 
 * Corpo: Zabumba (cilindro de madeira com pele frontal)
 * Adições: Capa, máscara, símbolo "R", maceta, bacalhau, notas musicais, brilho
 * Visual: Pixar meets Nintendo - personagem memorável e carismático
 * 
 * Evolui com 6 tiers, adicionando detalhes visuais sem perder identidade
 */
export function SuperRitmoMascot({
  size = 120,
  mood = "idle",
  level = 1,
  beat = false,
}: {
  size?: number;
  mood?: SuperRitmoMood;
  level?: number;
  beat?: boolean;
}) {
  const tier = superRitmoTier(level);
  const scale = size / 120;

  // Animação do corpo principal
  const bodyAnimation =
    mood === "dance" ? { y: [0, -8, 0, -4, 0], rotate: [-4, 4, -4] }
    : mood === "celebrate" ? { y: [0, -15, 0, -10, 0], rotate: [-8, 8, -8], scale: [1, 1.05, 1] }
    : mood === "wow" ? { scale: [1, 1.15, 1] }
    : mood === "sad" ? { y: [0, 2, 0] }
    : { y: [0, -3, 0] };

  // Animação da capa
  const capeAnimation = mood === "wave" || mood === "celebrate" 
    ? { rotate: [0, 15, -15, 0], transformOrigin: "top center" }
    : { rotate: [-2, 2, -2] };

  // Expressão facial
  const eyeScale = mood === "happy" || mood === "dance" || mood === "celebrate" ? 1.1 : 1;
  const eyeRotate = mood === "wow" ? 5 : 0;

  const mouthPath = 
    mood === "celebrate" ? "M 48 85 Q 60 100 72 85"
    : mood === "wow" ? "M 48 88 Q 60 105 72 88"
    : mood === "happy" || mood === "dance" ? "M 50 85 Q 60 95 70 85"
    : mood === "sad" ? "M 50 95 Q 60 85 70 95"
    : "M 52 88 Q 60 93 68 88";

  const teethOpacity = mood === "happy" || mood === "celebrate" ? 1 : mood === "dance" ? 0.8 : 0;

  // Notas musicais flutuando
  const notes = [
    { delay: 0, x: -40, y: -60 },
    { delay: 0.3, x: 50, y: -50 },
    { delay: 0.6, x: -30, y: 20 },
  ];

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <motion.svg
        viewBox="0 0 120 160"
        width={size}
        height={size}
        className="drop-shadow-lg"
        animate={bodyAnimation}
        transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
      >
        <defs>
          {/* Gradientes */}
          <linearGradient id="woodGradient" x1="0%" y1="0%" x2="100%">
            <stop offset="0%" stopColor="#8B6F47" />
            <stop offset="50%" stopColor="#A0826D" />
            <stop offset="100%" stopColor="#6B5838" />
          </linearGradient>

          <radialGradient id="glowGradient" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="#FFD700" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#FFD700" stopOpacity="0" />
          </radialGradient>

          <filter id="goldBrilho">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2" />
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.6" />
            </feComponentTransfer>
          </filter>

          {/* Sombra suave */}
          <filter id="shadowFilter">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.3" />
          </filter>
        </defs>

        {/* Brilho dourado ao fundo (apenas se tier >= 4) */}
        {tier.glow && (
          <ellipse cx="60" cy="70" rx="55" ry="65" fill="url(#glowGradient)" />
        )}

        {/* CORPO: Zabumba cilíndrica */}
        {/* Lateral esquerda */}
        <ellipse cx="35" cy="70" rx="15" ry="50" fill="url(#woodGradient)" opacity="0.7" />
        {/* Lateral direita */}
        <ellipse cx="85" cy="70" rx="15" ry="50" fill="url(#woodGradient)" opacity="0.7" />
        {/* Corpo principal (frente) */}
        <rect x="25" y="20" width="70" height="100" rx="8" fill="url(#woodGradient)" />

        {/* Cordas da zabumba (zigue-zague) */}
        <g stroke="#2C2C2C" strokeWidth="1.5" opacity="0.6">
          <line x1="32" y1="25" x2="28" y2="35" />
          <line x1="40" y1="25" x2="40" y2="35" />
          <line x1="48" y1="25" x2="50" y2="35" />
          <line x1="56" y1="25" x2="56" y2="35" />
          <line x1="64" y1="25" x2="62" y2="35" />
          <line x1="72" y1="25" x2="78" y2="35" />
          <line x1="80" y1="25" x2="82" y2="35" />
          {/* Cordas inferiores */}
          <line x1="32" y1="115" x2="28" y2="105" />
          <line x1="40" y1="115" x2="40" y2="105" />
          <line x1="48" y1="115" x2="50" y2="105" />
          <line x1="56" y1="115" x2="56" y2="105" />
          <line x1="64" y1="115" x2="62" y2="105" />
          <line x1="72" y1="115" x2="78" y2="105" />
          <line x1="80" y1="115" x2="82" y2="105" />
        </g>

        {/* Pele frontal (texture) */}
        <rect x="28" y="25" width="64" height="90" fill="#D4A574" opacity="0.9" rx="4" />

        {/* CAPA DE SUPER-HERÓI */}
        <motion.g
          animate={capeAnimation}
          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
        >
          {/* Capa vermelha/dourada */}
          <path
            d="M 35 35 Q 30 45 32 65 Q 35 85 40 105 L 80 105 Q 85 85 88 65 Q 90 45 85 35 Z"
            fill="#DC143C"
            opacity="0.85"
            filter="url(#shadowFilter)"
          />
          {/* Gola da capa com brilho dourado */}
          <ellipse cx="60" cy="35" rx="30" ry="8" fill="#FFD700" opacity="0.7" />
          <path d="M 40 35 L 50 40 L 70 40 L 80 35 Z" fill="#DAA520" opacity="0.6" />
        </motion.g>

        {/* MÁSCARA NOS OLHOS */}
        <ellipse cx="45" cy="50" rx="12" ry="14" fill="#1a1a1a" opacity="0.8" />
        <ellipse cx="75" cy="50" rx="12" ry="14" fill="#1a1a1a" opacity="0.8" />
        {/* Máscara borda dourada (tier 3+) */}
        {tier.tier >= 3 && (
          <>
            <ellipse cx="45" cy="50" rx="12" ry="14" fill="none" stroke="#FFD700" strokeWidth="1.5" />
            <ellipse cx="75" cy="50" rx="12" ry="14" fill="none" stroke="#FFD700" strokeWidth="1.5" />
          </>
        )}

        {/* OLHOS - Grandes e expressivos */}
        <motion.g
          animate={{ scale: eyeScale, rotate: eyeRotate }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          transformOrigin="45 50"
        >
          {/* Branco do olho esquerdo */}
          <circle cx="45" cy="50" r="10" fill="white" />
          {/* Íris esquerdo */}
          <circle cx="46" cy="51" r="6" fill="#4A90E2" />
          {/* Pupila esquerda */}
          <circle cx="47" cy="52" r="3.5" fill="black" />
          {/* Brilho esquerdo */}
          <circle cx="48" cy="50" r="1.5" fill="white" opacity="0.8" />
        </motion.g>

        <motion.g
          animate={{ scale: eyeScale, rotate: eyeRotate }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          transformOrigin="75 50"
        >
          {/* Branco do olho direito */}
          <circle cx="75" cy="50" r="10" fill="white" />
          {/* Íris direito */}
          <circle cx="76" cy="51" r="6" fill="#4A90E2" />
          {/* Pupila direita */}
          <circle cx="77" cy="52" r="3.5" fill="black" />
          {/* Brilho direito */}
          <circle cx="78" cy="50" r="1.5" fill="white" opacity="0.8" />
        </motion.g>

        {/* PISCADA (animação) */}
        <motion.g
          animate={{ scaleY: [1, 1, 0.1, 0.1, 1, 1] }}
          transition={{ repeat: Infinity, duration: 4, times: [0, 0.4, 0.45, 0.55, 0.6, 1] }}
          transformOrigin="60 50"
        >
          <line x1="35" y1="50" x2="55" y2="50" stroke="black" strokeWidth="0.5" opacity="0.3" />
          <line x1="65" y1="50" x2="85" y2="50" stroke="black" strokeWidth="0.5" opacity="0.3" />
        </motion.g>

        {/* SÍMBOLO "R" DOURADO NO PEITO */}
        <g filter="url(#goldBrilho)">
          {/* Fundo circular */}
          <circle cx="60" cy="75" r="16" fill="#FFD700" opacity="0.9" />
          {/* Borda */}
          <circle cx="60" cy="75" r="16" fill="none" stroke="#DAA520" strokeWidth="1.5" />
          {/* Letra R */}
          <text
            x="60"
            y="82"
            fontSize="18"
            fontWeight="bold"
            textAnchor="middle"
            fill="#DC143C"
            fontFamily="Arial"
          >
            R
          </text>
        </g>

        {/* MACETA (na mão direita) */}
        <g>
          {/* Cabo da maceta */}
          <line x1="80" y1="85" x2="92" y2="75" stroke="#8B4513" strokeWidth="3" strokeLinecap="round" />
          {/* Cabeça da maceta (feltro) */}
          <ellipse cx="95" cy="72" rx="5" ry="8" fill="#FF6B9D" />
          <ellipse cx="95" cy="72" rx="4.5" ry="7" fill="#FF8AC7" opacity="0.8" />
        </g>

        {/* BACALHAU (na mão esquerda) */}
        <g>
          {/* Cabo do bacalhau */}
          <line x1="40" y1="85" x2="28" y2="75" stroke="#8B4513" strokeWidth="2" strokeLinecap="round" />
          {/* Vareta fina do bacalhau */}
          <line x1="28" y1="75" x2="20" y2="68" stroke="#D2691E" strokeWidth="1.5" />
          <line x1="28" y1="75" x2="25" y2="62" stroke="#D2691E" strokeWidth="1.5" opacity="0.7" />
        </g>

        {/* BOCA */}
        <motion.path
          d={mouthPath}
          stroke="#8B4513"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          initial={{ d: mouthPath }}
          animate={{ d: mouthPath }}
        />

        {/* DENTES (discretos e amigáveis) */}
        <motion.g opacity={teethOpacity} transition={{ duration: 0.3 }}>
          <line x1="52" y1="88" x2="52" y2="90" stroke="#FFFACD" strokeWidth="1" />
          <line x1="56" y1="93" x2="56" y2="94" stroke="#FFFACD" strokeWidth="0.8" />
          <line x1="60" y1="95" x2="60" y2="96" stroke="#FFFACD" strokeWidth="0.8" />
          <line x1="64" y1="93" x2="64" y2="94" stroke="#FFFACD" strokeWidth="0.8" />
          <line x1="68" y1="88" x2="68" y2="90" stroke="#FFFACD" strokeWidth="1" />
        </motion.g>

        {/* PERNAS SALTITANTES */}
        <motion.g
          animate={{ y: [0, -3, 0] }}
          transition={{ repeat: Infinity, duration: 2.5 }}
        >
          {/* Perna esquerda */}
          <ellipse cx="42" cy="115" rx="5" ry="8" fill="#8B6F47" />
          {/* Perna direita */}
          <ellipse cx="78" cy="115" rx="5" ry="8" fill="#8B6F47" />
        </motion.g>

        {/* TIER BADGE (canto superior direito, só em tiers > 1) */}
        {tier.tier > 1 && (
          <g>
            <circle cx="105" cy="35" r="10" fill={tier.tier >= 5 ? "#FFD700" : "#C0C0C0"} opacity="0.9" />
            <text
              x="105"
              y="40"
              fontSize="12"
              fontWeight="bold"
              textAnchor="middle"
              fill={tier.tier >= 5 ? "#DC143C" : "#333"}
              fontFamily="Arial"
            >
              {tier.accent}
            </text>
          </g>
        )}
      </motion.svg>

      {/* NOTAS MUSICAIS FLUTUANDO (fora do SVG) */}
      {mood !== "sad" && (
        <>
          {notes.map((note, i) => (
            <motion.div
              key={i}
              className="absolute text-xl"
              initial={{ x: note.x, y: note.y, opacity: 0 }}
              animate={{
                x: note.x + 20,
                y: note.y - 40,
                opacity: [0, 1, 1, 0],
                rotate: [0, 15, 30],
              }}
              transition={{
                duration: 2 + note.delay,
                repeat: Infinity,
                delay: note.delay,
                ease: "easeOut",
              }}
            >
              ♪
            </motion.div>
          ))}
        </>
      )}

      {/* PARTÍCULAS COLORIDAS (entrada/celebração) */}
      {(mood === "wow" || mood === "celebrate") && (
        <>
          {Array.from({ length: 12 }).map((_, i) => (
            <motion.div
              key={`particle-${i}`}
              className="absolute w-2 h-2 rounded-full"
              style={{
                background: ["#FFD700", "#FF6B9D", "#4A90E2", "#50C878"][i % 4],
              }}
              initial={{
                x: size / 2,
                y: size / 2,
                opacity: 1,
                scale: 1,
              }}
              animate={{
                x: size / 2 + Math.cos((i / 12) * Math.PI * 2) * 60,
                y: size / 2 + Math.sin((i / 12) * Math.PI * 2) * 60,
                opacity: 0,
                scale: 0,
              }}
              transition={{
                duration: 0.8,
                delay: i * 0.05,
              }}
            />
          ))}
        </>
      )}
    </div>
  );
}
