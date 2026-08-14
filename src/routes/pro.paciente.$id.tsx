import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Loader2, Send, ShieldCheck } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/AppShell";
import { EmptyState, LoadingState } from "@/components/States";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { formatDate, formatDateTime, moodEmoji, moodLabel } from "@/lib/emotions";
import {
  fetchConversation,
  fetchEmotionalProfile,
  fetchLinkedUsers,
  fetchSharedEntries,
  markConversationRead,
} from "@/lib/queries";
import { cn } from "@/lib/utils";
import { BookHeart } from "lucide-react";

export const Route = createFileRoute("/pro/paciente/$id")({
  ssr: false,
  component: PatientDetail,
});

function PatientDetail() {
  const { id } = Route.useParams();
  const { user } = useAuth();
  const proId = user?.id ?? "";
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  const patients = useQuery({
    queryKey: ["pro-patients", proId],
    queryFn: () => fetchLinkedUsers(proId),
    enabled: Boolean(proId),
  });
  const patient = patients.data?.find((item) => item.user_id === id) ?? null;

  const emotional = useQuery({
    queryKey: ["emotional", id],
    queryFn: () => fetchEmotionalProfile(id),
    enabled: Boolean(patient),
  });
  const entries = useQuery({
    queryKey: ["pro-shared", proId, id],
    queryFn: () => fetchSharedEntries([id]),
    enabled: Boolean(patient),
  });
  const conversation = useQuery({
    queryKey: ["conversation", proId, id],
    queryFn: () => fetchConversation(proId, id),
    enabled: Boolean(patient),
    refetchInterval: 10000,
  });

  useEffect(() => {
    if (proId && patient) {
      void markConversationRead(proId, id).then(() =>
        queryClient.invalidateQueries({ queryKey: ["pro-patients", proId] }),
      );
    }
  }, [proId, patient, id, conversation.data, queryClient]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [conversation.data]);

  const send = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("messages")
        .insert({ sender_id: proId, recipient_id: id, content: draft.trim() });
      if (error) throw error;
    },
    onSuccess: () => {
      setDraft("");
      void queryClient.invalidateQueries({ queryKey: ["conversation", proId, id] });
    },
    onError: () => toast.error("Não conseguimos enviar sua mensagem agora."),
  });

  if (patients.isLoading) return <LoadingState label="Carregando acompanhamento..." />;

  if (!patient) {
    return (
      <EmptyState
        icon={ShieldCheck}
        title="Paciente não encontrado"
        description="Este vínculo não está ativo ou você não tem acesso a estas informações."
      />
    );
  }

  return (
    <div className="animate-rise">
      <PageHeader
        title={patient.profile?.nickname ?? "Paciente"}
        description={`Vínculo ativo desde ${formatDate(patient.created_at)}. Você vê apenas registros compartilhados.`}
      />

      <section className="card-soft p-6" aria-labelledby="perfil-emocional">
        <h2 id="perfil-emocional" className="text-sm font-semibold text-muted-foreground">
          Perfil emocional
        </h2>
        <p className="mt-2 text-xl font-bold">
          {emotional.data?.current_state ?? "Sem estado informado"}
        </p>
        <ul className="mt-4 flex flex-wrap gap-2">
          {(emotional.data?.predominant_emotions ?? []).map((emotion) => (
            <li
              key={emotion}
              className="rounded-full bg-accent-soft px-3 py-1 text-xs text-secondary-foreground"
            >
              {emotion}
            </li>
          ))}
        </ul>
      </section>

      <Tabs defaultValue="registros" className="mt-8">
        <TabsList className="h-auto rounded-full bg-secondary p-1">
          <TabsTrigger value="registros" className="min-h-11 rounded-full px-5">
            Registros
          </TabsTrigger>
          <TabsTrigger value="mensagens" className="min-h-11 rounded-full px-5">
            Mensagens
          </TabsTrigger>
        </TabsList>

        <TabsContent value="registros" className="mt-6">
          {entries.isLoading ? (
            <LoadingState label="Carregando registros..." />
          ) : (entries.data ?? []).length === 0 ? (
            <EmptyState
              icon={BookHeart}
              title="Nenhum registro compartilhado"
              description="Esta pessoa ainda não compartilhou registros do diário com você."
            />
          ) : (
            <ol className="space-y-3">
              {entries.data!.map((entry) => (
                <li key={entry.id} className="card-soft p-5">
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                    <p className="text-xs text-muted-foreground">{formatDate(entry.created_at)}</p>
                    <span className="shrink-0 text-sm font-medium">
                      <span aria-hidden="true">{moodEmoji(entry.day_rating)}</span>{" "}
                      {moodLabel(entry.day_rating)}
                    </span>
                  </div>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {entry.emotions.map((emotion) => (
                      <li
                        key={emotion}
                        className="rounded-full bg-secondary px-3 py-1 text-xs text-secondary-foreground"
                      >
                        {emotion}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-4 whitespace-pre-wrap text-sm text-muted-foreground">
                    {entry.content}
                  </p>
                </li>
              ))}
            </ol>
          )}
        </TabsContent>

        <TabsContent value="mensagens" className="mt-6">
          <div className="card-soft flex h-[55dvh] flex-col overflow-hidden">
            <div className="flex-1 space-y-3 overflow-y-auto p-4 sm:p-6">
              {conversation.isLoading ? (
                <LoadingState label="Carregando conversa..." />
              ) : (conversation.data ?? []).length === 0 ? (
                <p className="py-10 text-center text-sm text-muted-foreground">
                  Nenhuma mensagem ainda.
                </p>
              ) : (
                conversation.data!.map((message) => {
                  const mine = message.sender_id === proId;
                  return (
                    <div
                      key={message.id}
                      className={cn("flex", mine ? "justify-end" : "justify-start")}
                    >
                      <div
                        className={cn(
                          "max-w-[85%] rounded-3xl px-4 py-3 text-sm shadow-soft",
                          mine
                            ? "rounded-br-lg bg-primary text-primary-foreground"
                            : "rounded-bl-lg bg-secondary text-secondary-foreground",
                        )}
                      >
                        <p className="whitespace-pre-wrap">{message.content}</p>
                        <p
                          className={cn(
                            "mt-1.5 text-[11px]",
                            mine ? "text-primary-foreground/70" : "text-muted-foreground",
                          )}
                        >
                          {formatDateTime(message.created_at)}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={endRef} />
            </div>
            <form
              className="border-t border-border bg-surface p-3 sm:p-4"
              onSubmit={(event) => {
                event.preventDefault();
                if (draft.trim().length > 0) send.mutate();
              }}
            >
              <div className="flex items-end gap-2">
                <Textarea
                  aria-label="Escreva sua mensagem"
                  rows={2}
                  maxLength={2000}
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  placeholder="Escreva uma mensagem de acolhimento..."
                  className="min-h-12 resize-none rounded-2xl text-base"
                />
                <Button
                  type="submit"
                  size="icon"
                  aria-label="Enviar mensagem"
                  className="size-12 shrink-0 rounded-2xl"
                  disabled={draft.trim().length === 0 || send.isPending}
                >
                  {send.isPending ? (
                    <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <Send className="size-4" aria-hidden="true" />
                  )}
                </Button>
              </div>
            </form>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
