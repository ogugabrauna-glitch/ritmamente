import { createContext, useContext, type ReactNode } from "react";
import { useGame, type GameState } from "@/lib/game/store";

type GameContextType = GameState;

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const gameState = useGame();

  return <GameContext.Provider value={gameState}>{children}</GameContext.Provider>;
}

export function useGameContext() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error("useGameContext must be used within GameProvider");
  }
  return context;
}
