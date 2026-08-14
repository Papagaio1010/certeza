import { useMutation } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { KeyRound, Loader2, LogOut, ShieldCheck, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/AppShell";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/app/configuracoes")({
  ssr: false,
  component: SettingsPage,
});

function SettingsPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const changePassword = useMutation({
    mutationFn: async () => {
      if (password.length < 8) throw new Error("curta");
      if (password !== confirm) throw new Error("diferente");
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Senha atualizada.");
      setPassword("");
      setConfirm("");
    },
    onError: (error: Error) =>
      toast.error(
        error.message === "curta"
          ? "A senha precisa ter ao menos 8 caracteres."
          : error.message === "diferente"
            ? "As senhas não coincidem."
            : "Não conseguimos atualizar sua senha agora.",
      ),
  });

  const eraseData = useMutation({
    mutationFn: async () => {
      if (!user) return;
      await supabase.from("diary_entries").delete().eq("user_id", user.id);
      await supabase.from("emotional_profiles").delete().eq("user_id", user.id);
      await supabase.from("professional_links").delete().eq("user_id", user.id);
    },
    onSuccess: () => toast.success("Seus registros foram apagados definitivamente."),
    onError: () => toast.error("Não conseguimos apagar seus dados agora."),
  });

  async function handleSignOut() {
    await signOut();
    navigate({ to: "/", replace: true });
  }

  return (
    <div className="animate-rise">
      <PageHeader
        title="Configurações e privacidade"
        description="Você decide o que compartilhar e pode apagar seus dados quando quiser."
      />

      <section className="card-soft p-6 sm:p-8" aria-labelledby="privacidade-resumo">
        <span className="grid size-11 place-items-center rounded-2xl bg-primary-soft text-primary">
          <ShieldCheck className="size-5" aria-hidden="true" />
        </span>
        <h2 id="privacidade-resumo" className="mt-4 text-lg font-semibold">
          Como protegemos você
        </h2>
        <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
          <li>Seu nome real nunca é exibido: usamos apenas o apelido escolhido por você.</li>
          <li>Registros do diário são privados por padrão.</li>
          <li>Apenas o profissional vinculado por você vê o que foi compartilhado.</li>
          <li>Você pode desfazer o vínculo ou apagar seus registros a qualquer momento.</li>
        </ul>
      </section>

      <section className="card-soft mt-6 p-6 sm:p-8" aria-labelledby="senha">
        <span className="grid size-11 place-items-center rounded-2xl bg-accent-soft text-accent">
          <KeyRound className="size-5" aria-hidden="true" />
        </span>
        <h2 id="senha" className="mt-4 text-lg font-semibold">
          Alterar senha
        </h2>
        <div className="mt-6 grid max-w-md gap-4">
          <div className="space-y-2">
            <Label htmlFor="nova-senha">Nova senha</Label>
            <Input
              id="nova-senha"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="min-h-12 rounded-2xl"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmar-senha">Confirmar nova senha</Label>
            <Input
              id="confirmar-senha"
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(event) => setConfirm(event.target.value)}
              className="min-h-12 rounded-2xl"
            />
          </div>
        </div>
        <Button
          className="mt-6 min-h-12 rounded-full sm:px-8"
          disabled={changePassword.isPending}
          onClick={() => changePassword.mutate()}
        >
          {changePassword.isPending && (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          )}
          Atualizar senha
        </Button>
      </section>

      <section className="card-soft mt-6 p-6 sm:p-8" aria-labelledby="dados">
        <h2 id="dados" className="text-lg font-semibold">
          Meus dados
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Apagar os dados remove todos os registros do diário, o perfil emocional e o vínculo com
          profissional. Esta ação é permanente.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="min-h-12 rounded-full text-destructive">
                <Trash2 className="size-4" aria-hidden="true" />
                Apagar meus registros
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-3xl">
              <AlertDialogHeader>
                <AlertDialogTitle>Apagar todos os seus registros?</AlertDialogTitle>
                <AlertDialogDescription>
                  Tudo o que você escreveu no diário, seu perfil emocional e seu vínculo com
                  profissional serão removidos permanentemente.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="min-h-11 rounded-full">Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  className="min-h-11 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={() => eraseData.mutate()}
                >
                  Apagar tudo
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Button variant="ghost" className="min-h-12 rounded-full" onClick={handleSignOut}>
            <LogOut className="size-4" aria-hidden="true" />
            Sair da conta
          </Button>
        </div>
      </section>
    </div>
  );
}
