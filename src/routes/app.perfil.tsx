import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/AppShell";
import { EmotionSelector } from "@/components/EmotionSelector";
import { LoadingState } from "@/components/States";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { formatDate, moodEmoji, moodLabel } from "@/lib/emotions";
import { fetchDiaryEntries, fetchEmotionalProfile } from "@/lib/queries";

export const Route = createFileRoute("/app/perfil")({
  ssr: false,
  component: EmotionalProfilePage,
});

function EmotionalProfilePage() {
  const { user, profile, refresh } = useAuth();
  const userId = user?.id ?? "";
  const queryClient = useQueryClient();
  const [emotions, setEmotions] = useState<string[]>([]);
  const [nickname, setNickname] = useState("");

  const emotional = useQuery({
    queryKey: ["emotional", userId],
    queryFn: () => fetchEmotionalProfile(userId),
    enabled: Boolean(userId),
  });
  const entries = useQuery({
    queryKey: ["diary", userId],
    queryFn: () => fetchDiaryEntries(userId),
    enabled: Boolean(userId),
  });

  useEffect(() => {
    if (emotional.data) setEmotions(emotional.data.predominant_emotions ?? []);
  }, [emotional.data]);

  useEffect(() => {
    if (profile) setNickname(profile.nickname);
  }, [profile]);

  const save = useMutation({
    mutationFn: async () => {
      const latest = entries.data?.[0];
      const { error } = await supabase.from("emotional_profiles").upsert({
        user_id: userId,
        predominant_emotions: emotions,
        current_state: latest ? moodLabel(latest.day_rating) : (emotional.data?.current_state ?? null),
        updated_at: new Date().toISOString(),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Perfil emocional atualizado.");
      void queryClient.invalidateQueries({ queryKey: ["emotional", userId] });
    },
    onError: () => toast.error("Não conseguimos salvar agora."),
  });

  const saveNickname = useMutation({
    mutationFn: async () => {
      const value = nickname.trim();
      if (value.length < 2) throw new Error("apelido curto");
      const { error } = await supabase.from("profiles").update({ nickname: value }).eq("id", userId);
      if (error) throw error;
    },
    onSuccess: async () => {
      toast.success("Apelido atualizado.");
      await refresh();
    },
    onError: () => toast.error("O apelido precisa ter ao menos 2 caracteres."),
  });

  if (emotional.isLoading || entries.isLoading) {
    return <LoadingState label="Carregando seu perfil emocional..." />;
  }

  const latest = entries.data?.[0] ?? null;

  return (
    <div className="animate-rise">
      <PageHeader
        title="Meu perfil emocional"
        description="Este perfil ajuda você e seu profissional a compreender melhor os temas que aparecem com mais frequência nos seus registros. Ele não representa um diagnóstico."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <article className="card-soft p-6">
          <h2 className="text-sm font-semibold text-muted-foreground">Apelido</h2>
          <p className="mt-2 truncate text-xl font-bold">{profile?.nickname}</p>
        </article>
        <article className="card-soft p-6">
          <h2 className="text-sm font-semibold text-muted-foreground">Estado emocional recente</h2>
          <p className="mt-2 text-xl font-bold">
            <span aria-hidden="true">{moodEmoji(latest?.day_rating)}</span>{" "}
            {latest ? moodLabel(latest.day_rating) : "Sem registro"}
          </p>
        </article>
        <article className="card-soft p-6">
          <h2 className="text-sm font-semibold text-muted-foreground">Último registro</h2>
          <p className="mt-2 text-xl font-bold">
            {latest ? formatDate(latest.created_at) : "Nenhum ainda"}
          </p>
        </article>
      </div>

      <section className="card-soft mt-6 p-6 sm:p-8" aria-labelledby="emocoes-predominantes">
        <h2 id="emocoes-predominantes" className="text-lg font-semibold">
          Emoções predominantes
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Escolha as emoções que representam melhor este momento. Você pode mudar quando quiser.
        </p>
        <div className="mt-6">
          <EmotionSelector value={emotions} onChange={setEmotions} />
        </div>
        <Button
          className="mt-8 min-h-12 rounded-full sm:px-8"
          disabled={save.isPending}
          onClick={() => save.mutate()}
        >
          {save.isPending && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
          Salvar emoções
        </Button>
      </section>

      <section className="card-soft mt-6 p-6 sm:p-8" aria-labelledby="preferencias">
        <h2 id="preferencias" className="text-lg font-semibold">
          Preferências básicas
        </h2>
        <div className="mt-6 max-w-sm space-y-3">
          <Label htmlFor="apelido">Apelido exibido na plataforma</Label>
          <Input
            id="apelido"
            value={nickname}
            maxLength={30}
            onChange={(event) => setNickname(event.target.value)}
            className="min-h-12 rounded-2xl"
          />
          <p className="text-xs text-muted-foreground">
            Seu apelido é utilizado para preservar sua identidade dentro da plataforma.
          </p>
        </div>
        <Button
          variant="outline"
          className="mt-6 min-h-12 rounded-full"
          disabled={saveNickname.isPending}
          onClick={() => saveNickname.mutate()}
        >
          {saveNickname.isPending && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
          Salvar apelido
        </Button>
      </section>
    </div>
  );
}
