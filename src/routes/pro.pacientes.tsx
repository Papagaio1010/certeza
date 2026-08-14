import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { UserRound, Users } from "lucide-react";

import { PageHeader } from "@/components/AppShell";
import { EmptyState, LoadingState } from "@/components/States";
import { useAuth } from "@/hooks/useAuth";
import { formatDate } from "@/lib/emotions";
import { fetchLinkedUsers } from "@/lib/queries";

export const Route = createFileRoute("/pro/pacientes")({
  ssr: false,
  component: PatientsPage,
});

function PatientsPage() {
  const { user } = useAuth();
  const proId = user?.id ?? "";

  const patients = useQuery({
    queryKey: ["pro-patients", proId],
    queryFn: () => fetchLinkedUsers(proId),
    enabled: Boolean(proId),
  });

  if (patients.isLoading) return <LoadingState label="Carregando pacientes..." />;

  return (
    <div className="animate-rise">
      <PageHeader
        title="Pacientes vinculados"
        description="As pessoas são identificadas apenas pelo apelido escolhido por elas."
      />

      {(patients.data ?? []).length === 0 ? (
        <EmptyState
          icon={Users}
          title="Nenhum paciente vinculado"
          description="Você aparece na lista de profissionais da plataforma. Quando alguém criar um vínculo, ele será exibido aqui."
        />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {patients.data!.map((patient) => (
            <li key={patient.id} className="card-soft flex flex-col p-6">
              <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3">
                <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-primary-soft text-primary">
                  <UserRound className="size-5" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-lg font-semibold">
                    {patient.profile?.nickname ?? "Paciente"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Vinculado em {formatDate(patient.created_at)}
                  </p>
                </div>
                {patient.unread > 0 && (
                  <span className="shrink-0 rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-secondary-foreground">
                    {patient.unread}
                  </span>
                )}
              </div>

              {(patient.emotional?.predominant_emotions ?? []).length > 0 && (
                <ul className="mt-4 flex flex-wrap gap-2">
                  {patient.emotional!.predominant_emotions.map((emotion) => (
                    <li
                      key={emotion}
                      className="rounded-full bg-secondary px-3 py-1 text-xs text-secondary-foreground"
                    >
                      {emotion}
                    </li>
                  ))}
                </ul>
              )}

              <Link
                to="/pro/paciente/$id"
                params={{ id: patient.user_id }}
                className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
              >
                Ver acompanhamento
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
