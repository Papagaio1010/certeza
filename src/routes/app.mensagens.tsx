import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { Loader2, MessagesSquare, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/AppShell";
import { EmptyState, LoadingState } from "@/components/States";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { formatDateTime } from "@/lib/emotions";
import { fetchConversation, fetchMyLink, markConversationRead } from "@/lib/queries";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/mensagens")({
  ssr: false,
  component: MessagesPage,
});

function MessagesPage() {
  const { user } = useAuth();
  const userId = user?.id ?? "";
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  const link = useQuery({
    queryKey: ["link", userId],
    queryFn: () => fetchMyLink(userId),
    enabled: Boolean(userId),
  });
  const partnerId = link.data?.professional_id ?? "";

  const conversation = useQuery({
    queryKey: ["conversation", userId, partnerId],
    queryFn: () => fetchConversation(userId, partnerId),
    enabled: Boolean(userId && partnerId),
    refetchInterval: 10000,
  });

  useEffect(() => {
    if (userId && partnerId) {
      void markConversationRead(userId, partnerId).then(() =>
        queryClient.invalidateQueries({ queryKey: ["unread", userId] }),
      );
    }
  }, [userId, partnerId, conversation.data, queryClient]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [conversation.data]);

  const send = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("messages").insert({
        sender_id: userId,
        recipient_id: partnerId,
        content: draft.trim(),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setDraft("");
      void queryClient.invalidateQueries({ queryKey: ["conversation", userId, partnerId] });
    },
    onError: () => toast.error("Não conseguimos enviar sua mensagem agora."),
  });

  if (link.isLoading) return <LoadingState label="Carregando suas mensagens..." />;

  if (!link.data) {
    return (
      <div className="animate-rise">
        <PageHeader
          title="Mensagens"
          description="Um canal simples e privado entre você e seu profissional."
        />
        <EmptyState
          icon={MessagesSquare}
          title="Você ainda não tem um profissional vinculado"
          description="Para conversar por mensagens, escolha um profissional na plataforma. Você pode desfazer o vínculo quando quiser."
          action={
            <Link
              to="/app/profissional"
              className="mt-2 inline-flex min-h-11 items-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Escolher profissional
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="animate-rise">
      <PageHeader
        title="Mensagens"
        description={`Conversa privada com ${link.data.professional?.nickname ?? "seu profissional"}.`}
      />

      <div className="card-soft flex h-[60dvh] flex-col overflow-hidden">
        <div className="flex-1 space-y-3 overflow-y-auto p-4 sm:p-6">
          {conversation.isLoading ? (
            <LoadingState label="Carregando a conversa..." />
          ) : (conversation.data ?? []).length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              Nenhuma mensagem ainda. Escreva quando se sentir confortável.
            </p>
          ) : (
            conversation.data!.map((message) => {
              const mine = message.sender_id === userId;
              return (
                <div key={message.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
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
              placeholder="Escreva sua mensagem..."
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

      <p className="mt-4 text-xs text-muted-foreground">
        Este canal não substitui atendimento de urgência. Em situações de risco, procure o CVV (188)
        ou o serviço de emergência mais próximo.
      </p>
    </div>
  );
}
