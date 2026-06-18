import { motion } from "framer-motion";

export type RitmizinhoMood = "idle" | "happy" | "sad" | "dance" | "wave" | "wow";

export function ritmizinhoTier(level: number) {
  if (level >= 100) return { tier: 5, name: "Mestre Supremo do Tempo", accent: "👑", glow: true };
  if (level >= 50)  return { tier: 4, name: "Lendário",                 accent: "🌟", glow: true };
  if (level >= 25)  return { tier: 3, name: "Mestre",                   accent: "🎩", glow: true };
  if (level >= 10)  return { tier: 2, name: "Guardião",                 accent: "🛡️", glow: false };
  return              { tier: 1, name: "Aprendiz",                  accent: "🌱", glow: false };
}

/**
 * RITMIZINHO — zabumbinha viva (mascote oficial Ritmamente).
 * O corpo INTEIRO é uma zabumba: madeira, cordas em zigue-zague, pele frontal.
 * Olhos grandes e boca com dentes nascem direto da pele. Sem corpo humano.
 * Braço direito segura a MACETA (baqueta grossa de feltro).
 * Braço esquerdo segura o BACALHAU (vareta fina tradicional).
 * Pernas curtinhas e saltitantes.
 */
export function RitmizinhoMascot({
  size = 120,
  mood = "idle",
  level = 1,
  beat = false,
}: {
  size?: number;
  mood?: RitmizinhoMood;
  level?: number;
  beat?: boolean;
}) {
  const tier = ritmizinhoTier(level);

  const body =
    mood === "dance" ? { y: [0, -8, 0, -4, 0], rotate: [-4, 4, -4] }
    : mood === "wow" ? { scale: [1, 1.12, 1] }
    : mood === "sad" ? { y: [0, 2, 0] }
    : { y: [0, -5, 0] };

  // blink
  const eyeScaleY =
    mood === "happy" || mood === "dance" ? 0.6
    : mood === "sad" ? 0.7
    : 1;

  const mouthPath =
    mood === "wow"
      ? "M 52 82 Q 60 96 68 82 Q 60 90 52 82 Z"
      : mood === "sad"
      ? "M 44 90 Q 60 80 76 90"
      : // idle/happy/dance/wave — sorriso reto e cativante
        "M 46 84 Q 60 92 74 84";

  

  return (
    <motion.svg
      viewBox="0 0 140 150"
      width={size}
      height={(size * 150) / 140}
      animate={body}
      transition={{ repeat: Infinity, duration: mood === "dance" ? 0.55 : 1.8, ease: "easeInOut" }}
      style={{ filter: tier.glow ? "drop-shadow(0 0 14px rgba(255,210,80,0.85))" : "drop-shadow(0 8px 10px rgba(0,0,0,0.45))" }}
    >
      <defs>
        <radialGradient id="rzWood" cx="0.35" cy="0.3" r="0.95">
          <stop offset="0%" stopColor="#3a3a3a" />
          <stop offset="45%" stopColor="#141414" />
          <stop offset="100%" stopColor="#000000" />
        </radialGradient>
        <radialGradient id="rzWoodSide" cx="0.5" cy="0.5" r="0.6">
          <stop offset="0%" stopColor="#000" stopOpacity="0" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.7" />
        </radialGradient>
        <radialGradient id="rzSkin" cx="0.4" cy="0.35" r="0.9">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="70%" stopColor="#f5f5f5" />
          <stop offset="100%" stopColor="#dcdcdc" />
        </radialGradient>
        <radialGradient id="rzCheek" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#ff7a8a" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#ff7a8a" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="rzEye" cx="0.4" cy="0.35" r="0.9">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="70%" stopColor="#eef3fb" />
          <stop offset="100%" stopColor="#aebfd4" />
        </radialGradient>
        <radialGradient id="rzPupil" cx="0.4" cy="0.35" r="0.8">
          <stop offset="0%" stopColor="#3b86ff" />
          <stop offset="55%" stopColor="#0a2a6a" />
          <stop offset="100%" stopColor="#03060f" />
        </radialGradient>
        <linearGradient id="rzMallet" x1="0" x2="1">
          <stop offset="0%" stopColor="#2a2a2a" />
          <stop offset="100%" stopColor="#000000" />
        </linearGradient>
        <radialGradient id="rzGlow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#ffd24a" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#ffd24a" stopOpacity="0" />
        </radialGradient>
        <filter id="rzSoft" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="0.6" />
        </filter>
      </defs>

      {/* ambient halo — vivo */}
      <motion.ellipse
        cx="70" cy="80" rx="58" ry="56" fill="url(#rzGlow)"
        animate={{ opacity: [0.55, 0.9, 0.55], scale: [1, 1.06, 1] }}
        transition={{ repeat: Infinity, duration: 2.4, ease: "easeInOut" }}
        style={{ transformOrigin: "70px 80px" }}
      />


      {/* shadow */}
      <ellipse cx="70" cy="142" rx="34" ry="4" fill="#000" opacity="0.4" />

      {/* legs — small, bouncy */}
      <motion.g
        animate={mood === "dance" ? { rotate: [-8, 8, -8] } : {}}
        transition={{ repeat: Infinity, duration: 0.5 }}
        style={{ transformOrigin: "70px 126px" }}
      >
        <rect x="52" y="122" width="11" height="14" rx="5" fill="#0a0a0a" />
        <rect x="77" y="122" width="11" height="14" rx="5" fill="#0a0a0a" />
        {/* shoes */}
        <ellipse cx="57" cy="138" rx="11" ry="5" fill="#1a1a1a" stroke="#000" strokeWidth="1.5" />
        <ellipse cx="83" cy="138" rx="11" ry="5" fill="#1a1a1a" stroke="#000" strokeWidth="1.5" />
      </motion.g>

      {/* LEFT ARM holding BACALHAU (thin stick) */}
      <motion.g
        animate={mood === "dance" ? { rotate: [-20, 10, -20] } : mood === "wave" ? { rotate: [0, 15, -10, 0] } : { rotate: [-4, 2, -4] }}
        transition={{ repeat: Infinity, duration: mood === "dance" ? 0.55 : 2 }}
        style={{ transformOrigin: "30px 78px" }}
      >
        {/* arm */}
        <rect x="14" y="74" width="20" height="8" rx="4" fill="url(#rzWood)" />
        {/* hand */}
        <circle cx="14" cy="78" r="6.5" fill="url(#rzSkin)" stroke="#000" strokeWidth="1.5" />
        {/* bacalhau — thin long stick */}
        <line x1="6" y1="60" x2="22" y2="96" stroke="#1a1a1a" strokeWidth="2.2" strokeLinecap="round" />
        <circle cx="6" cy="60" r="1.8" fill="#1a1a1a" />
      </motion.g>

      {/* RIGHT ARM holding MACETA (felt-headed mallet) */}
      <motion.g
        animate={mood === "dance" ? { rotate: [15, -10, 15] } : { rotate: [4, -2, 4] }}
        transition={{ repeat: Infinity, duration: mood === "dance" ? 0.55 : 1.6 }}
        style={{ transformOrigin: "110px 78px" }}
      >
        <rect x="106" y="74" width="20" height="8" rx="4" fill="url(#rzWood)" />
        <circle cx="126" cy="78" r="6.5" fill="url(#rzSkin)" stroke="#000" strokeWidth="1.5" />
        {/* maceta shaft */}
        <line x1="126" y1="78" x2="138" y2="58" stroke="url(#rzMallet)" strokeWidth="3.5" strokeLinecap="round" />
        {/* felt head */}
        <circle cx="138" cy="56" r="6.5" fill="#f5f5f5" stroke="#000" strokeWidth="1.5" />
        <ellipse cx="136" cy="54" rx="2" ry="1.4" fill="#fff" opacity="0.9" />
      </motion.g>

      {/* BODY — zabumba cylinder (the whole character) */}
      <g>
        {/* top rim — black */}
        <ellipse cx="70" cy="40" rx="42" ry="9" fill="#050505" />
        <ellipse cx="70" cy="40" rx="42" ry="9" fill="url(#rzWood)" opacity="0.6" />
        {/* top skin — white */}
        <ellipse cx="70" cy="38" rx="40" ry="7.5" fill="url(#rzSkin)" />
        <ellipse cx="64" cy="36" rx="18" ry="2.6" fill="#fff" opacity="0.9" />
        {/* shell — black */}
        <path d="M 28 40 L 30 116 Q 70 128 110 116 L 112 40 Z" fill="url(#rzWood)" />
        {/* highlight */}
        <path d="M 28 40 L 30 116 Q 36 119 40 116 L 38 40 Z" fill="#4a4a4a" opacity="0.5" />
        {/* shadow side */}
        <path d="M 112 40 L 110 116 Q 104 119 100 116 L 102 40 Z" fill="#000" opacity="0.6" />

        {/* zig-zag ropes — silver/white */}
        <g stroke="#e6e6e6" strokeWidth="2.2" fill="none" opacity="0.95">
          {Array.from({ length: 10 }).map((_, i) => {
            const x1 = 32 + i * 8;
            const x2 = 36 + i * 8;
            return (
              <g key={i}>
                <line x1={x1} y1="44" x2={x2} y2="112" />
                <line x1={x2} y1="44" x2={x1 + 8} y2="112" />
              </g>
            );
          })}
        </g>

        {/* bottom rim — black */}
        <ellipse cx="70" cy="116" rx="40" ry="6.5" fill="#000" />
        <ellipse cx="70" cy="115" rx="40" ry="5" fill="#1a1a1a" />
        {/* bottom skin peek — white */}
        <ellipse cx="70" cy="118" rx="36" ry="3" fill="url(#rzSkin)" opacity="0.95" />

        {/* side shading for 3D cylinder */}
        <path d="M 28 40 L 30 116 Q 70 128 110 116 L 112 40 Z" fill="url(#rzWoodSide)" />

        {/* FRONT SKIN PANEL — white face area on the drum skin */}
        <ellipse cx="70" cy="78" rx="34" ry="36" fill="url(#rzSkin)" />
        <ellipse cx="70" cy="78" rx="34" ry="36" fill="none" stroke="#000" strokeWidth="1.2" opacity="0.5" />
        {/* specular highlight on skin (3D sphere feel) */}
        <ellipse cx="56" cy="58" rx="14" ry="7" fill="#fff" opacity="0.7" filter="url(#rzSoft)" />
        <ellipse cx="92" cy="100" rx="10" ry="4" fill="#fff" opacity="0.35" />

        {/* EYES — big, expressive, with blink */}
        <motion.g
          animate={{ scaleY: [1, 1, 0.1, 1, 1] }}
          transition={{ repeat: Infinity, duration: 4.2, times: [0, 0.92, 0.95, 0.98, 1], ease: "easeInOut" }}
          style={{ transformOrigin: "70px 66px" }}
        >
          <ellipse cx="54" cy="66" rx="11" ry={11 * eyeScaleY} fill="url(#rzEye)" stroke="#000" strokeWidth="1.8" />
          <ellipse cx="86" cy="66" rx="11" ry={11 * eyeScaleY} fill="url(#rzEye)" stroke="#000" strokeWidth="1.8" />
          <circle cx={54 + (mood === "wow" ? 1 : 0)} cy={66 + (mood === "sad" ? 2 : 1)} r={5.6 * eyeScaleY} fill="url(#rzPupil)" />
          <circle cx={86 + (mood === "wow" ? 1 : 0)} cy={66 + (mood === "sad" ? 2 : 1)} r={5.6 * eyeScaleY} fill="url(#rzPupil)" />
          <circle cx="56" cy="63" r="2.4" fill="#fff" />
          <circle cx="88" cy="63" r="2.4" fill="#fff" />
          <circle cx="51" cy="69" r="1.2" fill="#fff" opacity="0.85" />
          <circle cx="83" cy="69" r="1.2" fill="#fff" opacity="0.85" />
        </motion.g>


        {/* cheeks */}
        <circle cx="42" cy="82" r="6.5" fill="url(#rzCheek)" />
        <circle cx="98" cy="82" r="6.5" fill="url(#rzCheek)" />

        {/* MOUTH — sorriso reto cativante */}
        <g>
          <path
            d={mouthPath}
            fill="none"
            stroke="#0a0a0a"
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      </g>

      {/* tier accessories */}
      {tier.tier >= 3 && (
        <g>
          <rect x="50" y="22" width="40" height="6" fill="#1a1a2e" />
          <rect x="56" y="8" width="28" height="16" fill="#1a1a2e" />
          <rect x="56" y="20" width="28" height="4" fill="#d4af37" />
        </g>
      )}
      {tier.tier >= 4 && (
        <g>
          <text x="6" y="18" fontSize="14">✨</text>
          <text x="118" y="18" fontSize="14">✨</text>
        </g>
      )}
      {tier.tier >= 5 && (
        <text x="54" y="18" fontSize="24">👑</text>
      )}

      {/* beat pulse */}
      {beat && (
        <motion.circle
          cx="70" cy="78" r="44" fill="none" stroke="gold" strokeWidth="3"
          initial={{ opacity: 0.8, scale: 0.6 }} animate={{ opacity: 0, scale: 1.4 }}
          transition={{ duration: 0.6 }}
        />
      )}
    </motion.svg>
  );
}
