/**
 * EXEMPLO DE INTEGRAÇÃO DA SÍNTESE DE VOZ NO GAME.TSX
 * 
 * Adicione este import no topo do Game.tsx:
 *   import { useSuperRitmoReactions } from "@/hooks/use-super-ritmo-reactions";
 * 
 * Adicione este hook dentro do componente Game:
 *   const { reactCorrect, reactCombo5, reactCombo10, reactCombo20, reactCombo50, reactLevelUp, reactWrong, reactPower, reactCheckpoint } = useSuperRitmoReactions();
 * 
 * Então use as reações nos pontos apropriados:
 */

// Exemplo 1: Quando o jogador acerta uma resposta
const handleCorrectAnswer = () => {
  // ... lógica de acerto ...
  addCorrect();
  reactCorrect(); // "Isso aí! Você entrou no ritmo!"
};

// Exemplo 2: Quando atinge combo de 5
useEffect(() => {
  if (stats.combo === 5) {
    reactCombo5(); // "Parabéns! Você pegou o ritmo!"
  }
  if (stats.combo === 10) {
    reactCombo10(); // "Uaaaaau! Que sequência incrível!"
  }
  if (stats.combo === 20) {
    reactCombo20(); // "Fantástico! Você está em perfeita harmonia!"
  }
  if (stats.combo === 50) {
    reactCombo50(); // "Você é uma máquina! Combo épico!"
  }
}, [stats.combo, reactCombo5, reactCombo10, reactCombo20, reactCombo50]);

// Exemplo 3: Quando sobe de nível
useEffect(() => {
  if (previousLevel !== stats.level) {
    reactLevelUp(); // "Fantástico! Você acabou de evoluir!"
  }
}, [stats.level, reactLevelUp]);

// Exemplo 4: Quando erra
const handleWrongAnswer = () => {
  // ... lógica de erro ...
  addWrong();
  reactWrong(); // "Quase! Respira... Escuta o compasso... Você consegue!"
};

// Exemplo 5: Quando ativa um poder
const handleActivatePower = () => {
  // ... lógica de poder ...
  reactPower(); // "Incrível! Hora de usar o Poder do Ritmo!"
};

// Exemplo 6: Quando atinge checkpoint (boss level)
useEffect(() => {
  if (isCheckpoint(stats.level)) {
    reactCheckpoint(); // "Parabéns! Você desbloqueou um novo desafio!"
  }
}, [stats.level, reactCheckpoint]);

/**
 * NOTA: As reações são assincronizadas, portanto você pode usar await se desejar:
 * 
 *   await reactLevelUp();
 *   // fazer algo depois que a fala terminar
 * 
 * Se preferir, pode ignorar o await e a fala acontecerá em paralelo.
 */

/**
 * CONFIGURAÇÕES:
 * - rate: velocidade da fala (0.5 - 2, padrão: 0.95)
 * - pitch: tom da voz (0 - 2, padrão: 1.1) - mais alto = mais jovem
 * - volume: volume (0 - 1, padrão: 0.8)
 * 
 * Todos esses parâmetros já estão configurados idealmente no hook useSuperRitmoReactions.
 */
