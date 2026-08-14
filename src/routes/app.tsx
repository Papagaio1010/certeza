import { Outlet, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { BookHeart, HeartHandshake, Home, MessagesSquare, Settings, UserRound } from "lucide-react";

import { AppShell, type NavItem } from "@/components/AppShell";
import { LoadingState } from "@/components/States";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/app")({
  ssr: false,
  component: AppLayout,
});

const items: NavItem[] = [
  { label: "Início", to: "/app", icon: Home, exact: true },
  { label: "Meu diário", to: "/app/diario", icon: BookHeart },
  { label: "Mensagens", to: "/app/mensagens", icon: MessagesSquare },
  { label: "Perfil emocional", to: "/app/perfil", icon: HeartHandshake },
  { label: "Meu profissional", to: "/app/profissional", icon: UserRound },
  { label: "Configurações", to: "/app/configuracoes", icon: Settings },
];

function AppLayout() {
  const { loading, session, profile, role } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!session) {
      navigate({ to: "/auth", search: { modo: "entrar" }, replace: true });
      return;
    }
    if (role === "professional") {
      navigate({ to: "/pro", replace: true });
      return;
    }
    if (profile && !profile.onboarded) {
      navigate({ to: "/onboarding", replace: true });
    }
  }, [loading, session, profile, role, navigate]);

  if (loading || !session || !profile) {
    return (
      <div className="min-h-dvh bg-background">
        <LoadingState label="Preparando seu espaço..." />
      </div>
    );
  }

  return (
    <AppShell items={items} eyebrow="Seu apelido">
      <Outlet />
    </AppShell>
  );
}
