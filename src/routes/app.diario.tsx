import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { BookHeart, Eye, Loader2, Lock, Pencil, Share2, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/AppShell";
import { EmotionSelector, MoodPicker } from "@/components/EmotionSelector";
import { EmptyState, ErrorState, LoadingState } from "@/components/States";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { formatDate, moodEmoji, moodLabel } from "@/lib/emotions";
import { fetchDiaryEntries, type DiaryEntry } from "@/lib/queries";

export const Route = createFileRoute("/app/diario")({
  ssr: false,
  component: DiaryPage,
});

function DiaryPage() {
  const { user } = useAuth();
  const userId = user?.id ?? "";
  const queryClient = useQueryClient();

  const [emotions, setEmotions] = useState<string[]>([]);
  const [content, setContent] = useState("");
  const [rating, setRating] = useState<number | null>(null);
  const [share, setShare] = useState(false);
  const [editing, setEditing] = useState<DiaryEntry | null>(null);
  const [reading, setReading] = useState<DiaryEntry | null>(null);
  const [deleting, setDeleting] = useState<DiaryEntry | null>(null);

  const entries = useQuery({
    queryKey: ["diary", userId],
    queryFn: () => fetchDiaryEntries(userId),
    enabled: Boolean(userId),
  });

  function invalidate() {
    void queryClient.invalidateQueries({ queryKey: ["diary", userId] });
  }

  const save = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("diary_entries").insert({
        user_id: userId,
        emotions,
        content: content.trim(),
        day_rating: rating ?? 3,
        shared: share,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(share ? "Registro salvo e compartilhado." : "Registro salvo.");
      setEmotions([]);
      setContent("");
      setRating(null);
      setShare(false);
      invalidate();
    },
    onError: () => toast.error("Não conseguimos salvar seu registro agora."),
  });

  const update = useMutation({
    mutationFn: async (entry: DiaryEntry) => {
      const { error } = await supabase
        .from("diary_entries")
        .update({
          emotions: entry.emotions,
          content: entry.content.trim(),
          day_rating: entry.day_rating,
          shared: entry.shared,
        })
        .eq("id", entry.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Registro atualizado.");
      setEditing(null);
      invalidate();
    },
    onError: () => toast.error("Não conseguimos atualizar este registro."),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("diary_entries").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Registro excluído.");
      setDeleting(null);
      invalidate();
    },
    onError: () => toast.error("Não conseguimos excluir este registro."),
  });

  const canSave = content.trim().length > 3 && rating !== null && !save.isPending;

  return (
    <div className="animate-rise">
      <PageHeader
        title="Meu diário"
        description="Escreva no seu ritmo. Seus registros são privados, a menos que você escolha compartilhar."
      />

      <section className="card-soft p-6 sm:p-8" aria-labelledby="novo-registro">
        <h2 id="novo-registro" className="text-lg font-semibold">
          Novo registro
        </h2>

        <div className="mt-6 space-y-3">
          <Label htmlFor="emocoes">Como você está se sentindo?</Label>
          <EmotionSelector id="emocoes" value={emotions} onChange={setEmotions} />
        </div>

        <div className="mt-8 space-y-3">
          <Label htmlFor="conteudo">O que aconteceu?</Label>
          <Textarea
            id="conteudo"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            rows={7}
            maxLength={4000}
            placeholder="Escreva livremente sobre o seu dia, seus pensamentos e o que você sentiu."
            className="min-h-40 rounded-2xl text-base"
          />
          <p className="text-xs text-muted-foreground">{content.length}/4000 caracteres</p>
        </div>

        <div className="mt-8 space-y-3">
          <Label>Como você avalia seu dia?</Label>
          <MoodPicker value={rating} onChange={setRating} label="Avaliação do dia" />
        </div>

        <div className="mt-8 flex items-start gap-3 rounded-2xl border border-border bg-surface p-4">
          <Checkbox
            id="compartilhar"
            checked={share}
            onCheckedChange={(value) => setShare(value === true)}
            className="mt-0.5"
          />
          <Label htmlFor="compartilhar" className="text-sm font-normal leading-relaxed">
            Quero compartilhar este registro com meu profissional.
          </Label>
        </div>

        <Button
          type="button"
          size="lg"
          className="mt-8 min-h-12 w-full rounded-full sm:w-auto sm:px-10"
          disabled={!canSave}
          onClick={() => save.mutate()}
        >
          {save.isPending && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
          Salvar registro
        </Button>
      </section>

      <section className="mt-12" aria-labelledby="historico">
        <h2 id="historico" className="text-lg font-semibold">
          Histórico
        </h2>

        {entries.isLoading ? (
          <LoadingState label="Carregando seus registros..." />
        ) : entries.isError ? (
          <ErrorState onRetry={() => void entries.refetch()} />
        ) : (entries.data ?? []).length === 0 ? (
          <EmptyState
            className="mt-4"
            icon={BookHeart}
            title="Você ainda não possui registros no diário"
            description="Comece escrevendo como está se sentindo hoje. Não existe forma certa de começar."
          />
        ) : (
          <ol className="mt-4 space-y-4">
            {entries.data!.map((entry) => (
              <li key={entry.id} className="card-soft p-5 sm:p-6">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-muted-foreground">
                      {formatDate(entry.created_at)}
                    </p>
                    <p className="mt-1 flex items-center gap-2 text-sm font-semibold">
                      <span aria-hidden="true">{moodEmoji(entry.day_rating)}</span>
                      {moodLabel(entry.day_rating)}
                    </p>
                  </div>
                  <span
                    className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
                      entry.shared
                        ? "bg-primary-soft text-secondary-foreground"
                        : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    {entry.shared ? (
                      <Share2 className="size-3" aria-hidden="true" />
                    ) : (
                      <Lock className="size-3" aria-hidden="true" />
                    )}
                    {entry.shared ? "Compartilhado" : "Privado"}
                  </span>
                </div>

                {entry.emotions.length > 0 && (
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {entry.emotions.map((emotion) => (
                      <li
                        key={emotion}
                        className="rounded-full bg-accent-soft px-3 py-1 text-xs text-secondary-foreground"
                      >
                        {emotion}
                      </li>
                    ))}
                  </ul>
                )}

                <p className="mt-4 line-clamp-3 text-sm text-muted-foreground">{entry.content}</p>

                <div className="mt-5 flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    className="min-h-11 rounded-full"
                    onClick={() => setReading(entry)}
                  >
                    <Eye className="size-4" aria-hidden="true" />
                    Abrir
                  </Button>
                  <Button
                    variant="ghost"
                    className="min-h-11 rounded-full"
                    onClick={() => setEditing(entry)}
                  >
                    <Pencil className="size-4" aria-hidden="true" />
                    Editar
                  </Button>
                  <Button
                    variant="ghost"
                    className="min-h-11 rounded-full text-destructive hover:bg-destructive/10"
                    onClick={() => setDeleting(entry)}
                  >
                    <Trash2 className="size-4" aria-hidden="true" />
                    Excluir
                  </Button>
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>

      <Dialog open={Boolean(reading)} onOpenChange={(open) => !open && setReading(null)}>
        <DialogContent className="max-h-[85dvh] overflow-y-auto rounded-3xl">
          <DialogHeader>
            <DialogTitle>{reading ? formatDate(reading.created_at) : ""}</DialogTitle>
          </DialogHeader>
          {reading && (
            <div className="space-y-4">
              <p className="text-sm font-medium">
                {moodEmoji(reading.day_rating)} {moodLabel(reading.day_rating)}
              </p>
              <ul className="flex flex-wrap gap-2">
                {reading.emotions.map((emotion) => (
                  <li
                    key={emotion}
                    className="rounded-full bg-accent-soft px-3 py-1 text-xs text-secondary-foreground"
                  >
                    {emotion}
                  </li>
                ))}
              </ul>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                {reading.content}
              </p>
              <p className="text-xs text-muted-foreground">
                {reading.shared
                  ? "Este registro está compartilhado com seu profissional."
                  : "Este registro é privado."}
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(editing)} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="max-h-[85dvh] overflow-y-auto rounded-3xl">
          <DialogHeader>
            <DialogTitle>Editar registro</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-6">
              <div className="space-y-3">
                <Label>Emoções</Label>
                <EmotionSelector
                  value={editing.emotions}
                  onChange={(value) => setEditing({ ...editing, emotions: value })}
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="editar-conteudo">O que aconteceu?</Label>
                <Textarea
                  id="editar-conteudo"
                  rows={6}
                  maxLength={4000}
                  value={editing.content}
                  onChange={(event) => setEditing({ ...editing, content: event.target.value })}
                  className="rounded-2xl text-base"
                />
              </div>
              <div className="space-y-3">
                <Label>Avaliação do dia</Label>
                <MoodPicker
                  value={editing.day_rating}
                  onChange={(value) => setEditing({ ...editing, day_rating: value })}
                />
              </div>
              <div className="flex items-start gap-3 rounded-2xl border border-border bg-surface p-4">
                <Checkbox
                  id="editar-compartilhar"
                  checked={editing.shared}
                  onCheckedChange={(value) => setEditing({ ...editing, shared: value === true })}
                  className="mt-0.5"
                />
                <Label htmlFor="editar-compartilhar" className="text-sm font-normal">
                  Compartilhar este registro com meu profissional.
                </Label>
              </div>
              <Button
                className="min-h-12 w-full rounded-full"
                disabled={update.isPending}
                onClick={() => update.mutate(editing)}
              >
                {update.isPending && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
                Salvar alterações
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(deleting)} onOpenChange={(open) => !open && setDeleting(null)}>
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir este registro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O texto e as emoções deste registro serão removidos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="min-h-11 rounded-full">Manter registro</AlertDialogCancel>
            <AlertDialogAction
              className="min-h-11 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleting && remove.mutate(deleting.id)}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
