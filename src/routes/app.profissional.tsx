import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Loader2, ShieldCheck, UserRound, UserRoundX } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/AppShell";
import { ProfileAvatar } from "@/components/ProfileAvatar";
import { EmptyState, LoadingState } from "@/components/States";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { formatDate } from "@/lib/emotions";
import { fetchMyLink, fetchProfessionalProfiles } from "@/lib/queries";

export const Route = createFileRoute("/app/profissional")({
  ssr: false,
  component: ProfessionalPage,
});

function ProfessionalPage() {
  const { user } = useAuth();
  const userId = user?.id ?? "";
  const queryClient = useQueryClient();

  const link = useQuery({
    queryKey: ["link", userId],
    queryFn: () => fetchMyLink(userId),
    enabled: Boolean(userId),
  });
  const professionals = useQuery({
    queryKey: ["professionals"],
    queryFn: fetchProfessionalProfiles,
  });

  function invalidate() {
    void queryClient.invalidateQueries({ queryKey: ["link", userId] });
  }

  const connect = useMutation({
    mutationFn: async (professionalId: string) => {
      const { error } = await supabase
        .from("professional_links")
        .insert({ user_id: userId, professional_id: professionalId, status: "active" });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Vínculo criado. Você já pode enviar mensagens.");
      invalidate();
    },
    onError: () => toast.error("Não conseguimos criar o vínculo agora."),
  });

  const disconnect = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("professional_links").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Vínculo desfeito. Seus registros deixam de ser visíveis.");
      invalidate();
    },
    onError: () => toast.error("Não conseguimos desfazer o vínculo agora."),
  });

  if (link.isLoading) return <LoadingState label="Carregando informações do vínculo..." />;

  return (
    <div className="animate-rise">
      <PageHeader
        title="Meu profissional"
        description="Você escolhe se quer acompanhamento profissional e pode desfazer o vínculo em qualquer momento."
      />

      {link.data ? (
        <section className="card-soft p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-primary-soft text-primary">
              <UserRound className="size-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <h2 className="truncate text-xl font-bold">{link.data.professional?.nickname}</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Vínculo ativo desde {formatDate(link.data.created_at)}
              </p>
              {link.data.professional?.bio && (
                <p className="mt-3 text-sm text-muted-foreground">{link.data.professional.bio}</p>
              )}
            </div>
          </div>

          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-border bg-surface p-4">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
            <p className="text-sm text-muted-foreground">
              Seu profissional vê apenas o seu apelido, seu perfil emocional e os registros que você
              marcou como compartilhados.
            </p>
          </div>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="mt-6 min-h-12 rounded-full">
                <UserRoundX className="size-4" aria-hidden="true" />
                Desfazer vínculo
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-3xl">
              <AlertDialogHeader>
                <AlertDialogTitle>Desfazer o vínculo?</AlertDialogTitle>
                <AlertDialogDescription>
                  Seu profissional deixará de ver seus registros compartilhados e o canal de
                  mensagens será encerrado. Seus registros continuam com você.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="min-h-11 rounded-full">Manter vínculo</AlertDialogCancel>
                <AlertDialogAction
                  className="min-h-11 rounded-full"
                  onClick={() => disconnect.mutate(link.data!.id)}
                >
                  Desfazer
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </section>
      ) : professionals.isLoading ? (
        <LoadingState label="Carregando profissionais..." />
      ) : (professionals.data ?? []).length === 0 ? (
        <EmptyState
          icon={UserRound}
          title="Nenhum profissional disponível no momento"
          description="Assim que um profissional se cadastrar na plataforma, ele aparecerá aqui para você escolher."
        />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {professionals.data!.map((professional) => (
            <li key={professional.id} className="card-soft flex flex-col p-6">
              <ProfileAvatar
                path={professional.avatar_url}
                name={professional.details?.full_name ?? professional.nickname}
                className="size-16 rounded-3xl"
                iconClassName="size-6"
              />
              <h2 className="mt-4 truncate text-lg font-semibold">{professional.nickname}</h2>
              {professional.details?.specialty && (
                <p className="mt-1 text-sm font-medium text-primary">
                  {professional.details.specialty}
                </p>
              )}
              <p className="mt-2 flex-1 text-sm text-muted-foreground">
                {professional.details?.presentation ??
                  professional.bio ??
                  "Profissional cadastrado na plataforma EntreNós."}
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button
                  className="min-h-12 rounded-full"
                  disabled={connect.isPending}
                  onClick={() => connect.mutate(professional.id)}
                >
                  {connect.isPending && (
                    <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  )}
                  Vincular
                </Button>
                <Button asChild variant="outline" className="min-h-12 rounded-full">
                  <Link to="/app/profissionais/$id" params={{ id: professional.id }}>
                    Ver perfil
                  </Link>
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
