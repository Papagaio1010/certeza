import { Link, createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2, MailCheck } from "lucide-react";
import { z } from "zod";

import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/recuperar-senha")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Recuperar senha — EntreNós" },
      {
        name: "description",
        content: "Enviaremos um link para você criar uma nova senha e voltar ao seu espaço.",
      },
      { property: "og:title", content: "Recuperar senha — EntreNós" },
      { property: "og:description", content: "Receba um link para criar uma nova senha." },
    ],
  }),
  component: RecoverPage,
});

function RecoverPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const email = String(new FormData(event.currentTarget).get("email") ?? "").trim();
    const parsed = z.string().email().safeParse(email);
    if (!parsed.success) {
      setError("Informe um e-mail válido.");
      return;
    }
    setError(null);
    setStatus("loading");
    const { error: requestError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/redefinir-senha`,
    });
    setStatus(requestError ? "error" : "sent");
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-gradient-soft px-4 py-12">
      <div className="w-full max-w-md">
        <Logo />
        <div className="card-soft mt-8 p-8">
          {status === "sent" ? (
            <div className="text-center">
              <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-primary-soft text-primary">
                <MailCheck className="size-6" aria-hidden="true" />
              </span>
              <h1 className="mt-5 text-xl font-bold">Verifique seu e-mail</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Se existir uma conta com este e-mail, você receberá um link para criar uma nova
                senha.
              </p>
              <Link
                to="/auth"
                search={{ modo: "entrar" }}
                className="mt-6 inline-flex min-h-12 items-center justify-center rounded-full border border-border bg-card px-6 text-sm font-semibold hover:bg-secondary"
              >
                Voltar para o login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <div>
                <h1 className="text-xl font-bold">Esqueci minha senha</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  Sem problema. Informe seu e-mail e enviaremos um link para criar uma nova senha.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  className="min-h-12 rounded-2xl"
                  aria-invalid={Boolean(error)}
                />
                {error && <p className="text-xs text-destructive">{error}</p>}
                {status === "error" && (
                  <p className="text-xs text-destructive">
                    Não conseguimos enviar o e-mail agora. Tente novamente em instantes.
                  </p>
                )}
              </div>
              <Button
                type="submit"
                size="lg"
                className="min-h-12 w-full rounded-full"
                disabled={status === "loading"}
              >
                {status === "loading" && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
                Enviar link
              </Button>
              <Link
                to="/auth"
                search={{ modo: "entrar" }}
                className="block text-sm text-muted-foreground hover:text-foreground"
              >
                Voltar para o login
              </Link>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
