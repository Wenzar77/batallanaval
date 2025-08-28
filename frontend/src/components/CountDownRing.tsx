import React, { useEffect, useMemo, useRef, useState } from "react";

type Props = {
  /** Duración total en segundos (p. ej. 10) */
  seconds?: number;
  /** Tamaño total en px del círculo */
  size?: number;
  /** Grosor del borde (stroke) en px */
  strokeWidth?: number;
  /** Color del borde que decrece */
  strokeColor?: string;
  /** Color de fondo del borde (pista) */
  trackColor?: string;
  /** Color del número */
  textColor?: string;
  /** Callback al terminar */
  onComplete?: () => void;
  /** Inicia automáticamente al montar el componente */
  autoStart?: boolean;
  /** (Opcional) si cambia, reinicia el conteo (útil para nueva pregunta) */
  resetKey?: string | number;
};

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

const CountdownRing: React.FC<Props> = ({
  seconds = 10,
  size = 88,
  strokeWidth = 8,
  strokeColor = "#1976d2",   // primary-ish
  trackColor = "rgba(25,118,210,0.15)",
  textColor = "#fff",
  onComplete,
  autoStart = true,
  resetKey,
}) => {
  const durationMs = seconds * 1000;
  const [now, setNow] = useState<number>(() => performance.now());
  const startRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const doneRef = useRef(false);

  // Reinicia cuando cambie resetKey o seconds
  useEffect(() => {
    startRef.current = null;
    setNow(performance.now());
    doneRef.current = false;
    if (!autoStart) return;
    const tick = (t: number) => {
      if (startRef.current == null) startRef.current = t;
      setNow(t);
      const elapsed = t - startRef.current!;
      if (elapsed >= durationMs) {
        if (!doneRef.current) {
          doneRef.current = true;
          onComplete?.();
        }
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey, seconds, autoStart]);

  const elapsed = useMemo(() => {
    if (startRef.current == null) return 0;
    return Math.max(0, now - startRef.current);
  }, [now]);

  const progress = clamp01(elapsed / durationMs);      // 0 → 1
  const remainingMs = Math.max(0, durationMs - elapsed);
  const remainingSec = Math.ceil(remainingMs / 1000);   // número grande

  // Geometría del anillo SVG
  const r = (size - strokeWidth) / 2;
  const C = 2 * Math.PI * r; // circunferencia
  const dashOffset = C * progress;

  // Pequeño “shake/pulse” en los últimos 3s
  const pulse = remainingSec <= 3;

  return (
    <div
      aria-label={`Tiempo restante: ${remainingSec} segundos`}
      role="timer"
      style={{
        width: size,
        height: size,
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        filter: pulse ? "drop-shadow(0 0 6px rgba(255,0,0,0.5))" : "none",
        transition: "filter 200ms linear",
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ transform: "rotate(-90deg)" }} // para que empiece arriba
      >
        {/* pista */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* progreso */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={dashOffset}
          style={{
            transition: "stroke 200ms linear",
          }}
        />
      </svg>

      {/* número */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: textColor,
          fontWeight: 800,
          fontVariantNumeric: "tabular-nums",
          fontSize: Math.max(20, size * 0.34),
          transform: pulse ? "scale(1.06)" : "scale(1)",
          transition: "transform 120ms ease",
          userSelect: "none",
        }}
      >
        {remainingSec}
      </div>
    </div>
  );
};

export default CountdownRing;
