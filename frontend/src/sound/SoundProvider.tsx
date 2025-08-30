import React, { createContext, useCallback, useContext, useMemo, useRef, useState, useEffect } from "react";

type SoundName = "hit" | "miss" | "sink";
type SoundContextValue = {
  isMuted: boolean;
  toggleMute: () => void;
  play: (name: SoundName) => void;
};

const SoundContext = createContext<SoundContextValue | undefined>(undefined);
const STORAGE_KEY = "bn_sound_muted";

export const SoundProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMuted, setIsMuted] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? saved === "true" : false;
  });

  // Pre-carga de audios (en refs para no recrearlos)
  const soundsRef = useRef<Record<SoundName, HTMLAudioElement>>({
    hit: new Audio("/sounds/hit.mp3"),
    miss: new Audio("/sounds/miss.mp3"),
    sink: new Audio("/sounds/sink.mp3"),
  });

  useEffect(() => {
    Object.values(soundsRef.current).forEach(a => {
      a.preload = "auto";
      a.volume = 0.9; // ajusta si quieres
    });
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(isMuted));
  }, [isMuted]);

  const toggleMute = useCallback(() => setIsMuted(m => !m), []);

  const play = useCallback((name: SoundName) => {
    if (isMuted) return;
    const a = soundsRef.current[name];
    if (!a) return;

    // Permite disparos consecutivos: reinicia y clona si ya está sonando
    try {
      if (!a.paused) {
        const clone = a.cloneNode(true) as HTMLAudioElement;
        clone.volume = a.volume;
        clone.currentTime = 0;
        void clone.play();
      } else {
        a.currentTime = 0;
        void a.play();
      }
    } catch {
      // Autoplay policies: se habilitará tras una interacción del usuario
    }
  }, [isMuted]);

  const value = useMemo(() => ({ isMuted, toggleMute, play }), [isMuted, toggleMute, play]);

  return <SoundContext.Provider value={value}>{children}</SoundContext.Provider>;
};

export const useSound = () => {
  const ctx = useContext(SoundContext);
  if (!ctx) throw new Error("useSound debe usarse dentro de <SoundProvider>");
  return ctx;
};
