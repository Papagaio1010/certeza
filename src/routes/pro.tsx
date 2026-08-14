import { Outlet, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Home, Settings, Users } from "lucide-react";

import { AppShell, type NavItem } from "@/components/AppShell";
import { LoadingState } from "@/components/States";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/pro")({
  ssr: false,
  component: ProLayout,
});

const items: NavItem[] = [
  { label: "Painel", to: "/pro", icon: Home, exact: true },
  { label: "Pacientes", to: "/pro/pacientes", icon: Users },
  { label: "Meu perfil", to: "/pro/perfil", icon: Settings },
];

function ProLayout() {
  const { loading, session, role, profile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!session) {
      navigate({ to: "/auth", search: { modo: "entrar" }, replace: true });
      return;
    }
    if (role === "user") navigate({ to: "/app", replace: true });
  }, [loading, session, role, navigate]);

  if (loading || !session || !profile || role !== "professional") {
    return (
      <div className="min-h-dvh bg-background">
        <LoadingState label="Preparando sua área profissional..." />
      </div>
    );
  }

  return (
    <AppShell items={items} eyebrow="Profissional">
      <Outlet />
    </AppShell>
  );
}
