import { Check } from "lucide-react";

import { EMOTIONS, MOOD_SCALE } from "@/lib/emotions";
import { cn } from "@/lib/utils";

type EmotionSelectorProps = {
  value: string[];
  onChange: (value: string[]) => void;
  options?: readonly string[];
  id?: string;
};

export function EmotionSelector({ value, onChange, options = EMOTIONS, id }: EmotionSelectorProps) {
  function toggle(emotion: string) {
    onChange(
      value.includes(emotion) ? value.filter((item) => item !== emotion) : [...value, emotion],
    );
  }

  return (
    <div id={id} className="flex flex-wrap gap-2" role="group" aria-label="Emoções">
      {options.map((emotion) => {
        const selected = value.includes(emotion);
        return (
          <button
            key={emotion}
            type="button"
            aria-pressed={selected}
            onClick={() => toggle(emotion)}
            className={cn(
              "inline-flex min-h-11 items-center gap-2 rounded-full border px-4 py-2 text-sm transition-all duration-200",
              selected
                ? "border-primary bg-primary-soft text-secondary-foreground shadow-soft"
                : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground",
            )}
          >
            {selected && <Check className="size-4 text-primary" aria-hidden="true" />}
            {emotion}
          </button>
        );
      })}
    </div>
  );
}

type MoodPickerProps = {
  value: number | null;
  onChange: (value: number) => void;
  label?: string;
};

export function MoodPicker({ value, onChange, label = "Escala emocional" }: MoodPickerProps) {
  return (
    <div
      className="grid grid-cols-2 gap-2 sm:grid-cols-5"
      role="radiogroup"
      aria-label={label}
    >
      {MOOD_SCALE.map((mood) => {
        const selected = value === mood.value;
        return (
          <button
            key={mood.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(mood.value)}
            className={cn(
              "flex min-h-24 flex-col items-center justify-center gap-1 rounded-2xl border px-3 py-4 text-sm transition-all duration-200",
              selected
                ? "border-primary bg-primary-soft text-secondary-foreground shadow-soft"
                : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground",
            )}
          >
            <span className="text-2xl" aria-hidden="true">
              {mood.emoji}
            </span>
            <span className="text-center leading-tight">{mood.label}</span>
          </button>
        );
      })}
    </div>
  );
}
