import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  BadgeCheck,
  FileText,
  GraduationCap,
  Languages,
  Loader2,
  Mail,
  MapPin,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";

import { ProfileAvatar } from "@/components/ProfileAvatar";
import { EmptyState, LoadingState } from "@/components/States";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { fetchMyLink, fetchProfessionalById } from "@/lib/queries";
import { CV_BUCKET, createSignedUrl } from "@/lib/storage";

export const Route = createFileRoute("/app/profissionais/$id")({
  ssr: false,
  component: PublicProfessionalPage,
});

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof UserRound;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-border bg-surface p-4">
      <Icon className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="mt-1 break-words text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}

function PublicProfessionalPage() {
  const { id } = Route.useParams();
  const { user } = useAuth();
  const userId = user?.id ?? "";
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const professional = useQuery({
    queryKey: ["professional", id],
    queryFn: () => fetchProfessionalById(id),
  });
  const link = useQuery({
    queryKey: ["link", userId],
    queryFn: () => fetchMyLink(userId),
    enabled: Boolean(userId),
  });

  const details = professional.data?.details ?? null;
  const cvVisible = Boolean(details?.cv_url && details?.show_cv);

  const cvLink = useQuery({
    queryKey: ["cv-url", details?.cv_url ?? "none"],
    queryFn: () => createSignedUrl(CV_BUCKET, details?.cv_url),
    enabled: cvVisible,
  });

  const connect = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("professional_links")
        .insert({ user_id: userId, professional_id: id, status: "active" });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Vínculo criado. Você já pode enviar mensagens.");
      void queryClient.invalidateQueries({ queryKey: ["link", userId] });
      navigate({ to: "/app/profissional" });
    },
    onError: () => toast.error("Não conseguimos criar o vínculo agora."),
  });

  if (professional.isLoading) return <LoadingState label="Carregando perfil do profissional..." />;

  if (!professional.data) {
    return (
      <EmptyState
        icon={UserRound}
        title="Perfil não encontrado"
        description="Este profissional não está mais disponível na plataforma."
      />
    );
  }

  const person = professional.data;
  const isLinkedToThis = link.data?.professional_id === id;
  const hasOtherLink = Boolean(link.data) && !isLinkedToThis;
  const whatsappDigits = details?.show_whatsapp ? details.whatsapp : null;

  const modalities = [
    details?.online_sessions ? "Atendimento online" : null,
    details?.in_person_sessions ? "Atendimento presencial" : null,
  ].filter(Boolean) as string[];

  return (
    <div className="animate-rise">
      <Button asChild variant="ghost" className="mb-4 min-h-11 rounded-full px-3">
        <Link to="/app/profissional">
          <ArrowLeft className="size-4" aria-hidden="true" />
          Voltar
        </Link>
      </Button>

      <section className="card-soft overflow-hidden">
        <div className="bg-primary-soft/60 p-6 sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <ProfileAvatar
              path={person.avatar_url}
              name={details?.full_name ?? person.nickname}
              className="size-28 rounded-[2rem] shadow-sm sm:size-32"
              iconClassName="size-10"
            />
            <div className="min-w-0">
              <h1 className="text-2xl font-bold sm:text-3xl">{person.nickname}</h1>
              {details?.specialty && (
                <p className="mt-1 text-base font-medium text-primary">{details.specialty}</p>
              )}
              {details?.council_registration && (
                <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-surface px-3 py-1 text-xs font-medium">
                  <BadgeCheck className="size-3.5 text-primary" aria-hidden="true" />
                  {details.council_registration}
                </p>
              )}
              {modalities.length > 0 && (
                <p className="mt-3 text-sm text-muted-foreground">{modalities.join(" · ")}</p>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-8">
          <h2 className="text-lg font-semibold">Apresentação</h2>
          <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
            {details?.presentation ??
              person.bio ??
              "Este profissional ainda não escreveu uma apresentação."}
          </p>

          <h2 className="mt-8 text-lg font-semibold">Informações profissionais</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {details?.education && (
              <InfoRow icon={GraduationCap} label="Formação" value={details.education} />
            )}
            {details?.approach && (
              <InfoRow icon={Sparkles} label="Abordagem" value={details.approach} />
            )}
            {details?.years_experience != null && (
              <InfoRow
                icon={BadgeCheck}
                label="Experiência"
                value={`${details.years_experience} ${details.years_experience === 1 ? "ano" : "anos"}`}
              />
            )}
            {details?.languages && (
              <InfoRow icon={Languages} label="Idiomas" value={details.languages} />
            )}
            {details?.show_location && (details?.city || details?.state) && (
              <InfoRow
                icon={MapPin}
                label="Localização"
                value={[details.city, details.state].filter(Boolean).join(" — ")}
              />
            )}
            {details?.show_email && details?.contact_email && (
              <InfoRow icon={Mail} label="E-mail de contato" value={details.contact_email} />
            )}
          </div>

          {(cvVisible || whatsappDigits) && (
            <div className="mt-6 flex flex-wrap gap-3">
              {cvVisible && (
                <Button asChild variant="outline" className="min-h-12 rounded-full">
                  <a href={cvLink.data ?? undefined} target="_blank" rel="noreferrer">
                    <FileText className="size-4" aria-hidden="true" />
                    {details?.cv_filename ?? "Ver currículo"}
                  </a>
                </Button>
              )}
              {whatsappDigits && (
                <Button asChild variant="outline" className="min-h-12 rounded-full">
                  <a
                    href={`https://wa.me/55${whatsappDigits}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <MessageCircle className="size-4" aria-hidden="true" />
                    Falar no WhatsApp
                  </a>
                </Button>
              )}
            </div>
          )}

          <div className="mt-8 flex flex-wrap gap-3">
            {isLinkedToThis ? (
              <Button asChild className="min-h-12 rounded-full sm:px-8">
                <Link to="/app/mensagens">Abrir mensagens</Link>
              </Button>
            ) : (
              <Button
                className="min-h-12 rounded-full sm:px-8"
                disabled={connect.isPending || hasOtherLink}
                onClick={() => connect.mutate()}
              >
                {connect.isPending && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
                Vincular a este profissional
              </Button>
            )}
          </div>
          {hasOtherLink && (
            <p className="mt-3 text-xs text-muted-foreground">
              Você já tem um vínculo ativo. Desfaça o vínculo atual para escolher outro profissional.
            </p>
          )}

          <div className="mt-8 flex items-start gap-3 rounded-2xl border border-border bg-surface p-4">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
            <p className="text-sm text-muted-foreground">
              Ao criar um vínculo, o profissional passa a ver apenas seu apelido, seu perfil emocional
              e os registros que você marcar como compartilhados.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
