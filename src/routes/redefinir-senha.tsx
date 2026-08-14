import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/redefinir-senha")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Criar nova senha — EntreNós" },
      { name: "description", content: "Defina uma nova senha para voltar ao seu espaço no EntreNós." },
      { property: "og:title", content: "Criar nova senha — EntreNós" },
      { property: "og:description", content: "Defina uma nova senha com segurança." },
    ],
  }),
  component: ResetPasswordPage,
});

const schema = z
  .object({
    password: z.string().min(8, { message: "A senha precisa ter ao menos 8 caracteres." }).max(72),
    confirm: z.string(),
  })
  .refine((data) => data.password === data.confirm, {
    path: ["confirm"],
    message: "As senhas não são iguais.",
  });

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const parsed = schema.safeParse({
      password: form.get("password"),
      confirm: form.get("confirm"),
    });
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? "form");
        if (!next[key]) next[key] = issue.message;
      }
      setErrors(next);
      return;
    }
    setErrors({});
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
    setLoading(false);
    if (error) {
      toast.error("Este link pode ter expirado. Solicite um novo e-mail de recuperação.");
      return;
    }
    toast.success("Senha atualizada.");
    navigate({ to: "/app", replace: true });
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-gradient-soft px-4 py-12">
      <div className="w-full max-w-md">
        <Logo />
        <form onSubmit={handleSubmit} className="card-soft mt-8 space-y-5 p-8" noValidate>
          <div>
            <h1 className="text-xl font-bold">Criar nova senha</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Escolha uma senha com pelo menos 8 caracteres.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Nova senha</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              className="min-h-12 rounded-2xl"
              aria-invalid={Boolean(errors["password"])}
            />
            {errors["password"] && <p className="text-xs text-destructive">{errors["password"]}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm">Confirmação de senha</Label>
            <Input
              id="confirm"
              name="confirm"
              type="password"
              autoComplete="new-password"
              className="min-h-12 rounded-2xl"
              aria-invalid={Boolean(errors["confirm"])}
            />
            {errors["confirm"] && <p className="text-xs text-destructive">{errors["confirm"]}</p>}
          </div>
          <Button type="submit" size="lg" className="min-h-12 w-full rounded-full" disabled={loading}>
            {loading && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
            Salvar nova senha
          </Button>
        </form>
      </div>
    </div>
  );
}
