export const QS_CODE = 'code';
export const QS_TOKEN = 't';

export const readQS = () => new URL(window.location.href).searchParams;

export const setQS = (updates: Record<string, string | null | undefined>) => {
  const url = new URL(window.location.href);
  for (const [k, v] of Object.entries(updates)) {
    if (v == null || v === '') url.searchParams.delete(k);
    else url.searchParams.set(k, String(v));
  }
  window.history.replaceState({}, '', url.toString());
};

export const ensureTokenInURL = (): string => {
  const url = new URL(window.location.href);
  let t = url.searchParams.get(QS_TOKEN);
  if (!t) {
    t = (crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2));
    url.searchParams.set(QS_TOKEN, t);
    window.history.replaceState({}, '', url.toString());
  }
  return t;
};

// utils/url.ts
export const buildScreenUrl = (roomCode: string): string => {
  const params = new URLSearchParams({
    screen: "1",           // o "true", lo que prefieras
    [QS_CODE]: roomCode
  });
  return `${window.location.origin}/?${params.toString()}`;
};

