export const EMOTIONS = [
  "Ansiedade",
  "Estresse",
  "Tristeza",
  "Desmotivação",
  "Solidão",
  "Medo",
  "Irritação",
  "Cansaço",
  "Dificuldade para dormir",
  "Outro",
] as const;

export const MOOD_SCALE = [
  { value: 1, label: "Muito mal", emoji: "😞" },
  { value: 2, label: "Mal", emoji: "🙁" },
  { value: 3, label: "Neutro", emoji: "😐" },
  { value: 4, label: "Bem", emoji: "🙂" },
  { value: 5, label: "Muito bem", emoji: "😊" },
] as const;

export function moodLabel(value?: number | null) {
  return MOOD_SCALE.find((m) => m.value === value)?.label ?? "Sem registro";
}

export function moodEmoji(value?: number | null) {
  return MOOD_SCALE.find((m) => m.value === value)?.emoji ?? "🌤️";
}

export function formatDate(value: string) {
  return new Date(value).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function formatDateTime(value: string) {
  return new Date(value).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
