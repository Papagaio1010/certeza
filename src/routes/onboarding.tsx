import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Check, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { EmotionSelector, MoodPicker } from "@/components/EmotionSelector";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { moodLabel } from "@/lib/emotions";

export const Route = createFileRoute("/onboarding")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Vamos conhecer como você está — EntreNós" },
      {
        name: "description",
        content:
          "Um passo curto para personalizar seu espaço no EntreNós: emoções presentes e como você se sente hoje.",
      },
      { property: "og:title", content: "Vamos conhecer como você está — EntreNós" },
      { property: "og:description", content: "Personalize seu espaço em poucos toques." },
    ],
  }),
  component: Onboarding,
});

function Onboarding() {
  const { user, profile, refresh, loading } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [emotions, setEmotions] = useState<string[]>([]);
  const [mood, setMood] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  if (!loading && !user) {
    navigate({ to: "/auth", search: { modo: "entrar" }, replace: true });
  }

  async function finish() {
    if (!user) return;
    setSaving(true);
    const [{ error: profileError }, { error: emotionalError }] = await Promise.all([
      supabase.from("profiles").update({ onboarded: true }).eq("id", user.id),
      supabase.from("emotional_profiles").upsert({
        user_id: user.id,
        predominant_emotions: emotions,
        current_state: mood ? moodLabel(mood) : null,
        updated_at: new Date().toISOString(),
      }),
    ]);
    setSaving(false);
    if (profileError || emotionalError) {
      toast.error("Não conseguimos salvar agora. Tente novamente.");
      return;
    }
    await refresh();
    setStep(3);
  }

  const steps = [
    {
      title: "Vamos conhecer um pouco de como você está.",
      description:
        "São duas perguntas curtas. Suas respostas ajudam a personalizar sua experiência e podem ser alteradas depois, quando você quiser.",
      content: null,
      canAdvance: true,
    },
    {
      title: "Quais sentimentos ou dificuldades estão mais presentes neste momento?",
      description: "Você pode escolher mais de uma opção. Não existe resposta certa.",
      content: <EmotionSelector value={emotions} onChange={setEmotions} />,
      canAdvance: emotions.length > 0,
    },
    {
      title: "Como você se sente hoje?",
      description: "Esta escala é apenas um registro do seu momento, não uma avaliação clínica.",
      content: <MoodPicker value={mood} onChange={setMood} label="Como você se sente hoje" />,
      canAdvance: mood !== null,
    },
  ];

  if (step === 3) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-gradient-soft px-4 py-12">
        <div className="card-soft w-full max-w-md animate-rise p-10 text-center">
          <span className="mx-auto grid size-16 place-items-center rounded-3xl bg-primary-soft text-primary">
            <Check className="size-7" aria-hidden="true" />
          </span>
          <h1 className="mt-6 text-2xl font-bold">Seu espaço está pronto.</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Olá, {profile?.nickname}. A partir de agora você pode registrar como está se sentindo no
            seu ritmo.
          </p>
          <Button
            size="lg"
            className="mt-8 min-h-12 w-full rounded-full"
            onClick={() => navigate({ to: "/app", replace: true })}
          >
            Ir para o meu espaço
          </Button>
        </div>
      </div>
    );
  }

  const current = steps[step]!;

  return (
    <div className="min-h-dvh bg-gradient-soft px-4 py-10 sm:px-6">
      <div className="mx-auto w-full max-w-2xl">
        <Logo asLink={false} />
        <div className="mt-8">
          <Progress value={((step + 1) / 3) * 100} className="h-2" />
          <p className="mt-2 text-xs text-muted-foreground">Passo {step + 1} de 3</p>
        </div>

        <div key={step} className="card-soft mt-6 animate-rise p-6 sm:p-10">
          <span className="grid size-11 place-items-center rounded-2xl bg-accent-soft text-accent">
            <Sparkles className="size-5" aria-hidden="true" />
          </span>
          <h1 className="mt-5 text-2xl font-bold leading-snug sm:text-3xl">{current.title}</h1>
          <p className="mt-3 text-sm text-muted-foreground">{current.description}</p>
          {current.content && <div className="mt-8">{current.content}</div>}

          <div className="mt-10 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
            <Button
              type="button"
              variant="ghost"
              className="min-h-12 rounded-full"
              onClick={() => setStep((value) => Math.max(0, value - 1))}
              disabled={step === 0}
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
              Voltar
            </Button>
            <Button
              type="button"
              size="lg"
              className="min-h-12 rounded-full sm:px-8"
              disabled={!current.canAdvance || saving}
              onClick={() => (step === 2 ? finish() : setStep((value) => value + 1))}
            >
              {saving && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
              {step === 2 ? "Concluir" : "Continuar"}
              {step < 2 && <ArrowRight className="size-4" aria-hidden="true" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
