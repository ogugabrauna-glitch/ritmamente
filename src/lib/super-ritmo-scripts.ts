/**
 * Roteiros de fala do Super Ritmo
 * Guardião Oficial do Tempo
 * 
 * Contextos:
 * - opening: Fala de abertura cinematográfica
 * - correct: Quando o jogador acerta
 * - combo5: Primeiro combo (5)
 * - combo10: Segundo combo (10)
 * - combo20: Terceiro combo (20)
 * - combo50: Grande combo (50)
 * - levelUp: Sobe de nível
 * - wrong: Comete um erro
 * - power: Ativa um poder
 * - checkpoint: Atinge checkpoint (nível boss)
 * - masterTitle: Recebe novo título
 */

export type ScriptContext =
  | "opening"
  | "correct"
  | "combo5"
  | "combo10"
  | "combo20"
  | "combo50"
  | "levelUp"
  | "wrong"
  | "power"
  | "checkpoint"
  | "masterTitle"
  | "goodbye";

interface Scripts {
  [key in ScriptContext]: string;
}

export const SUPER_RITMO_SCRIPTS = {
  PT: {
    opening: `Olááá! Seja muito bem-vindo ao Ritmamente! 
    Eu sou o Super Ritmo, o Guardião Oficial do Tempo! 
    Aqui a matemática entra no compasso da música. 
    Cada desafio tem seu ritmo. 
    Cada resposta tem seu momento. 
    E aprender vira uma grande aventura! 
    Preparado? Então vamos começar!`,

    correct: `Isso aí! Você entrou no ritmo!`,

    combo5: `Parabéns! Você pegou o ritmo!`,

    combo10: `Uaaaaau! Que sequência incrível!`,

    combo20: `Fantástico! Você está em perfeita harmonia!`,

    combo50: `Você é uma máquina! Combo épico!`,

    levelUp: `Fantástico! Você acabou de evoluir! Parabéns!`,

    wrong: `Quase! Respira... Escuta o compasso... Você consegue!`,

    power: `Incrível! Hora de usar o Poder do Ritmo!`,

    checkpoint: `Parabéns! Você desbloqueou um novo desafio!`,

    masterTitle: `Parabéns! Agora você faz parte da Ordem dos Mestres do Tempo!`,

    goodbye: `Até logo, campeão! Continue praticando! Tchau!`,
  } as Scripts,

  EN: {
    opening: `Hello! Welcome to Ritmamente! 
    I'm Super Ritmo, the Official Guardian of Time! 
    Here, mathematics enters the beat of music. 
    Every challenge has its rhythm. 
    Every answer has its moment. 
    And learning becomes a big adventure! 
    Are you ready? Then let's begin!`,

    correct: `That's it! You got the rhythm!`,

    combo5: `Congratulations! You're catching the beat!`,

    combo10: `Wow! What an incredible streak!`,

    combo20: `Fantastic! You're in perfect harmony!`,

    combo50: `You're a machine! Epic combo!`,

    levelUp: `Fantastic! You just leveled up! Congratulations!`,

    wrong: `Almost! Take a breath... Listen to the beat... You got this!`,

    power: `Incredible! Time to use the Power of Rhythm!`,

    checkpoint: `Congratulations! You unlocked a new challenge!`,

    masterTitle: `Congratulations! Now you're part of the Order of the Masters of Time!`,

    goodbye: `See you later, champion! Keep practicing! Goodbye!`,
  } as Scripts,

  ES: {
    opening: `¡Hola! ¡Bienvenido a Ritmamente! 
    ¡Soy Super Ritmo, el Guardián Oficial del Tiempo! 
    Aquí las matemáticas entran al compás de la música. 
    Cada desafío tiene su ritmo. 
    Cada respuesta tiene su momento. 
    ¡Y aprender se convierte en una gran aventura! 
    ¿Estás listo? ¡Entonces comencemos!`,

    correct: `¡Así es! ¡Entraste en el ritmo!`,

    combo5: `¡Felicidades! ¡Estás atrapando el ritmo!`,

    combo10: `¡Guau! ¡Qué racha increíble!`,

    combo20: `¡Fantástico! ¡Estás en perfecta armonía!`,

    combo50: `¡Eres una máquina! ¡Combo épico!`,

    levelUp: `¡Fantástico! ¡Acabas de subir de nivel! ¡Felicidades!`,

    wrong: `¡Casi! Respira... Escucha el compás... ¡Tú puedes!`,

    power: `¡Increíble! ¡Es hora de usar el Poder del Ritmo!`,

    checkpoint: `¡Felicidades! ¡Desbloqueaste un nuevo desafío!`,

    masterTitle: `¡Felicidades! ¡Ahora eres parte de la Orden de los Maestres del Tiempo!`,

    goodbye: `¡Hasta luego, campeón! ¡Sigue practicando! ¡Adiós!`,
  } as Scripts,
};

export function getSuperRitmoScript(
  context: ScriptContext,
  lang: "pt" | "en" | "es" = "pt",
): string {
  return SUPER_RITMO_SCRIPTS[lang][context] || SUPER_RITMO_SCRIPTS.PT[context];
}
