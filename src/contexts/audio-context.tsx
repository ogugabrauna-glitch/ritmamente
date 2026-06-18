import { createContext, useContext, type ReactNode } from "react";
import { useGame } from "@/lib/game/store";
import { forro, playClick, setClickEnabled } from "@/lib/audio/forro";

interface AudioContextType {
  isEnabled: boolean;
  musicEnabled: boolean;
  musicVolume: number;
  setMusicEnabled: (enabled: boolean) => void;
  setMusicVolume: (volume: number) => void;
  playClickSound: () => void;
  startMusic: () => void;
  stopMusic: () => void;
  duckMusic: (mul?: number, duration?: number) => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function AudioProvider({ children }: { children: ReactNode }) {
  const { settings, toggleSound, toggleMusic, setMusicVolume: setMusicVolumeStore } = useGame();

  const handleSetMusicVolume = (volume: number) => {
    setMusicVolumeStore(volume);
    forro.setVolume((volume ?? 22) / 100);
  };

  const handlePlayClick = () => {
    if (settings.sound) playClick();
  };

  const handleStartMusic = () => {
    if (settings.sound && settings.music && (settings.musicVolume ?? 22) > 0) {
      forro.start();
    }
  };

  const handleStopMusic = () => {
    forro.stop();
  };

  const handleDuckMusic = (mul = 0.45, duration = 1800) => {
    forro.duck(mul, duration);
  };

  return (
    <AudioContext.Provider
      value={{
        isEnabled: settings.sound,
        musicEnabled: settings.music,
        musicVolume: settings.musicVolume ?? 22,
        setMusicEnabled: toggleMusic,
        setMusicVolume: handleSetMusicVolume,
        playClickSound: handlePlayClick,
        startMusic: handleStartMusic,
        stopMusic: handleStopMusic,
        duckMusic: handleDuckMusic,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error("useAudio must be used within AudioProvider");
  }
  return context;
}
