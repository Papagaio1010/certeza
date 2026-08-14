import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { BookHeart, MessagesSquare, Users } from "lucide-react";

import { PageHeader } from "@/components/AppShell";
import { EmptyState, LoadingState } from "@/components/States";
import { useAuth } from "@/hooks/useAuth";
import { formatDate, moodEmoji, moodLabel } from "@/lib/emotions";
import { fetchLinkedUsers, fetchSharedEntries } from "@/lib/queries";

export const Route = createFileRoute("/pro/")({
  ssr: false,
  component: ProDashboard,
});

function ProDashboard() {
  const { user, profile } = useAuth();
  const proId = user?.id ?? "";

  const patients = useQuery({
    queryKey: ["pro-patients", proId],
    queryFn: () => fetchLinkedUsers(proId),
    enabled: Boolean(proId),
  });

  const patientIds = (patients.data ?? []).map((item) => item.user_id);
  const entries = useQuery({
    queryKey: ["pro-shared", proId, patientIds.join(",")],
    queryFn: () => fetchSharedEntries(patientIds),
    enabled: patientIds.length > 0,
  });

  if (patients.isLoading) return <LoadingState label="Carregando seu painel..." />;

  const unread = (patients.data ?? []).reduce((total, item) => total + item.unread, 0);

  return (
    <div className="animate-rise">
      <PageHeader
        title={`Olá, ${profile?.nickname ?? "profissional"}`}
        description="Aqui você acompanha apenas o que os pacientes escolheram compartilhar."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <article className="card-soft p-6">
          <span className="grid size-11 place-items-center rounded-2xl bg-primary-soft text-primary">
            <Users className="size-5" aria-hidden="true" />
          </span>
          <p className="mt-4 text-2xl font-bold">{patients.data?.length ?? 0}</p>
          <p className="text-xs text-muted-foreground">pacientes vinculados</p>
        </article>
        <article className="card-soft p-6">
          <span className="grid size-11 place-items-center rounded-2xl bg-accent-soft text-accent">
            <BookHeart className="size-5" aria-hidden="true" />
          </span>
          <p className="mt-4 text-2xl font-bold">{entries.data?.length ?? 0}</p>
          <p className="text-xs text-muted-foreground">registros compartilhados</p>
        </article>
        <article className="card-soft p-6">
          <span className="grid size-11 place-items-center rounded-2xl bg-primary-soft text-primary">
            <MessagesSquare className="size-5" aria-hidden="true" />
          </span>
          <p className="mt-4 text-2xl font-bold">{unread}</p>
          <p className="text-xs text-muted-foreground">mensagens não lidas</p>
        </article>
      </div>

      <section className="mt-10" aria-labelledby="recentes">
        <h2 id="recentes" className="text-lg font-semibold">
          Registros recentes
        </h2>
        {patientIds.length === 0 ? (
          <EmptyState
            className="mt-4"
            icon={Users}
            title="Nenhum paciente vinculado ainda"
            description="Quando uma pessoa escolher você como profissional, ela aparecerá aqui com o apelido dela."
          />
        ) : entries.isLoading ? (
          <LoadingState label="Carregando registros..." />
        ) : (entries.data ?? []).length === 0 ? (
          <EmptyState
            className="mt-4"
            icon={BookHeart}
            title="Nenhum registro compartilhado"
            description="Os pacientes decidem quais registros compartilhar. Nada aparece aqui sem o consentimento deles."
          />
        ) : (
          <ol className="mt-4 space-y-3">
            {entries.data!.slice(0, 8).map((entry) => {
              const patient = patients.data?.find((item) => item.user_id === entry.user_id);
              return (
                <li key={entry.id} className="card-soft p-5">
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">
                        {patient?.profile?.nickname ?? "Paciente"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(entry.created_at)}
                      </p>
                    </div>
                    <span className="shrink-0 text-sm">
                      <span aria-hidden="true">{moodEmoji(entry.day_rating)}</span>{" "}
                      {moodLabel(entry.day_rating)}
                    </span>
                  </div>
                  <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{entry.content}</p>
                  {patient && (
                    <Link
                      to="/pro/paciente/$id"
                      params={{ id: entry.user_id }}
                      className="mt-4 inline-flex min-h-11 items-center rounded-full border border-border px-5 text-sm font-medium hover:bg-secondary"
                    >
                      Abrir paciente
                    </Link>
                  )}
                </li>
              );
            })}
          </ol>
        )}
      </section>
    </div>
  );
}
