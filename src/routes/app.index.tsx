import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import {
  BookHeart,
  MessagesSquare,
  NotebookPen,
  PenLine,
  Send,
  Sparkles,
  UserRound,
} from "lucide-react";

import { LoadingState } from "@/components/States";
import { useAuth } from "@/hooks/useAuth";
import { formatDate, moodEmoji, moodLabel } from "@/lib/emotions";
import {
  fetchDiaryEntries,
  fetchEmotionalProfile,
  fetchMyLink,
  fetchUnreadCount,
} from "@/lib/queries";

export const Route = createFileRoute("/app/")({
  ssr: false,
  component: Dashboard,
});

function Dashboard() {
  const { user, profile } = useAuth();
  const userId = user?.id ?? "";

  const entries = useQuery({
    queryKey: ["diary", userId],
    queryFn: () => fetchDiaryEntries(userId),
    enabled: Boolean(userId),
  });
  const emotional = useQuery({
    queryKey: ["emotional", userId],
    queryFn: () => fetchEmotionalProfile(userId),
    enabled: Boolean(userId),
  });
  const unread = useQuery({
    queryKey: ["unread", userId],
    queryFn: () => fetchUnreadCount(userId),
    enabled: Boolean(userId),
  });
  const link = useQuery({
    queryKey: ["link", userId],
    queryFn: () => fetchMyLink(userId),
    enabled: Boolean(userId),
  });

  if (entries.isLoading || emotional.isLoading) {
    return <LoadingState label="Carregando seu resumo..." />;
  }

  const latest = entries.data?.[0] ?? null;
  const recentCount =
    entries.data?.filter(
      (entry) => Date.now() - new Date(entry.created_at).getTime() < 1000 * 60 * 60 * 24 * 30,
    ).length ?? 0;

  return (
    <div className="animate-rise">
      <header className="mb-8">
        <p className="text-sm text-muted-foreground">Seu espaço</p>
        <h1 className="mt-1 text-2xl font-bold sm:text-3xl">
          Olá, {profile?.nickname}. Como você está hoje?
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
          {latest
            ? `Seu último registro foi em ${formatDate(latest.created_at)} e você avaliou o dia como “${moodLabel(latest.day_rating)}”.`
            : "Você ainda não tem registros. Comece contando como está se sentindo hoje."}
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <article className="card-soft p-6">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-muted-foreground">Como você está hoje?</h2>
              <p className="mt-2 text-2xl font-bold">
                {latest ? moodLabel(latest.day_rating) : "Sem registro"}
              </p>
              {emotional.data?.current_state && (
                <p className="mt-1 text-xs text-muted-foreground">
                  No onboarding você indicou: {emotional.data.current_state}
                </p>
              )}
            </div>
            <span className="text-3xl" aria-hidden="true">
              {moodEmoji(latest?.day_rating)}
            </span>
          </div>
          <Link
            to="/app/diario"
            className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            <PenLine className="size-4" aria-hidden="true" />
            Registrar como estou me sentindo
          </Link>
        </article>

        <article className="card-soft p-6">
          <h2 className="text-sm font-semibold text-muted-foreground">Meu diário</h2>
          <p className="mt-2 text-2xl font-bold">{recentCount}</p>
          <p className="text-xs text-muted-foreground">registros nos últimos 30 dias</p>
          <Link
            to="/app/diario"
            className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full border border-border px-5 text-sm font-semibold hover:bg-secondary"
          >
            <BookHeart className="size-4" aria-hidden="true" />
            Ver meus registros
          </Link>
        </article>

        <article className="card-soft p-6">
          <h2 className="text-sm font-semibold text-muted-foreground">Mensagens</h2>
          <p className="mt-2 text-2xl font-bold">{unread.data ?? 0}</p>
          <p className="text-xs text-muted-foreground">
            {unread.data === 1 ? "mensagem não lida" : "mensagens não lidas"}
          </p>
          <Link
            to="/app/mensagens"
            className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full border border-border px-5 text-sm font-semibold hover:bg-secondary"
          >
            <Send className="size-4" aria-hidden="true" />
            Enviar mensagem
          </Link>
        </article>

        <article className="card-soft p-6">
          <h2 className="text-sm font-semibold text-muted-foreground">Meu profissional</h2>
          <p className="mt-2 text-2xl font-bold">
            {link.data?.professional?.nickname ?? "Nenhum vínculo"}
          </p>
          <p className="text-xs text-muted-foreground">
            {link.data
              ? "Vínculo ativo na plataforma"
              : "Você pode escolher um profissional quando quiser"}
          </p>
          <Link
            to="/app/profissional"
            className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full border border-border px-5 text-sm font-semibold hover:bg-secondary"
          >
            <UserRound className="size-4" aria-hidden="true" />
            {link.data ? "Ver profissional" : "Escolher profissional"}
          </Link>
        </article>
      </div>

      <section className="mt-10" aria-labelledby="acoes-rapidas">
        <h2 id="acoes-rapidas" className="text-sm font-semibold text-muted-foreground">
          Ações rápidas
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Registrar como estou me sentindo", to: "/app/diario", icon: Sparkles },
            { label: "Escrever no diário", to: "/app/diario", icon: NotebookPen },
            { label: "Enviar mensagem", to: "/app/mensagens", icon: MessagesSquare },
            { label: "Ver meus registros", to: "/app/diario", icon: BookHeart },
          ].map((action) => (
            <Link
              key={action.label}
              to={action.to}
              className="flex min-h-20 items-center gap-3 rounded-2xl border border-border bg-card px-5 text-sm font-medium shadow-soft transition-transform hover:-translate-y-0.5"
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
                <action.icon className="size-4" aria-hidden="true" />
              </span>
              <span className="min-w-0">{action.label}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
