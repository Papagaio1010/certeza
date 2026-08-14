import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

const searchSchema = z.object({
  modo: z.enum(["entrar", "cadastro"]).catch("entrar"),
});

export const Route = createFileRoute("/auth")({
  ssr: false,
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Entrar ou criar conta — EntreNós" },
      {
        name: "description",
        content:
          "Acesse seu espaço no EntreNós ou crie uma conta escolhendo um apelido para usar dentro da plataforma.",
      },
      { property: "og:title", content: "Entrar ou criar conta — EntreNós" },
      {
        property: "og:description",
        content: "Acesse seu espaço ou crie sua conta com um apelido.",
      },
    ],
  }),
  component: AuthPage,
});

const signUpSchema = z
  .object({
    email: z.string().trim().email({ message: "Informe um e-mail válido." }).max(255),
    password: z.string().min(8, { message: "A senha precisa ter ao menos 8 caracteres." }).max(72),
    confirm: z.string(),
    nickname: z
      .string()
      .trim()
      .min(2, { message: "O apelido precisa ter ao menos 2 caracteres." })
      .max(30, { message: "O apelido pode ter até 30 caracteres." }),
    accepted: z.literal(true, {
      errorMap: () => ({ message: "É necessário aceitar os Termos e a Política de Privacidade." }),
    }),
  })
  .refine((data) => data.password === data.confirm, {
    path: ["confirm"],
    message: "As senhas não são iguais.",
  });

const signInSchema = z.object({
  email: z.string().trim().email({ message: "Informe um e-mail válido." }),
  password: z.string().min(1, { message: "Informe sua senha." }),
});

function AuthPage() {
  const { modo } = Route.useSearch();
  const navigate = useNavigate();
  const { session, profile, role, loading } = useAuth();
  const [tab, setTab] = useState<"entrar" | "cadastro">(modo);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [accountType, setAccountType] = useState<"user" | "professional">("user");
  const [accepted, setAccepted] = useState(false);

  useEffect(() => setTab(modo), [modo]);

  useEffect(() => {
    if (loading || !session || !profile) return;
    if (role === "professional") navigate({ to: "/pro", replace: true });
    else navigate({ to: profile.onboarded ? "/app" : "/onboarding", replace: true });
  }, [loading, session, profile, role, navigate]);

  async function handleSignIn(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const parsed = signInSchema.safeParse({
      email: form.get("email"),
      password: form.get("password"),
    });
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }
    setErrors({});
    setSubmitting(true);
    const { error } = await supabase.auth.signInWithPassword(parsed.data);
    setSubmitting(false);
    if (error) {
      toast.error("Não foi possível entrar. Confira o e-mail e a senha.");
      return;
    }
    toast.success("Bem-vindo de volta.");
  }

  async function handleSignUp(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const parsed = signUpSchema.safeParse({
      email: form.get("email"),
      password: form.get("password"),
      confirm: form.get("confirm"),
      nickname: form.get("nickname"),
      accepted: accepted ? true : undefined,
    });
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }
    setErrors({});
    setSubmitting(true);
    const { error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { nickname: parsed.data.nickname, account_type: accountType },
      },
    });
    setSubmitting(false);
    if (error) {
      toast.error(
        error.message.includes("already")
          ? "Já existe uma conta com este e-mail."
          : "Não foi possível criar sua conta agora.",
      );
      return;
    }
    toast.success("Seu espaço foi criado.");
  }

  return (
    <div className="grid min-h-dvh lg:grid-cols-[1.05fr_1fr]">
      <aside className="hidden flex-col justify-between bg-gradient-soft p-12 lg:flex">
        <Logo />
        <div>
          <h2 className="max-w-sm text-3xl font-bold leading-tight">
            Você pode contar como está se sentindo.
          </h2>
          <p className="mt-4 max-w-sm text-sm text-muted-foreground">
            Dentro da plataforma você é conhecido pelo apelido que escolher. Você decide o que
            compartilhar e quando.
          </p>
        </div>
        <p className="max-w-sm text-xs text-muted-foreground">
          Espaço de apoio e organização emocional. Não substitui atendimento psicológico ou médico.
        </p>
      </aside>

      <main className="flex items-center justify-center px-4 py-12 sm:px-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden">
            <Logo />
          </div>

          <div className="mt-8 grid grid-cols-2 gap-1 rounded-full bg-secondary p-1">
            {(["entrar", "cadastro"] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => {
                  setErrors({});
                  navigate({ to: "/auth", search: { modo: option }, replace: true });
                }}
                className={cn(
                  "min-h-11 rounded-full text-sm font-semibold transition-colors",
                  tab === option
                    ? "bg-card text-foreground shadow-soft"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {option === "entrar" ? "Entrar" : "Criar conta"}
              </button>
            ))}
          </div>

          {tab === "entrar" ? (
            <form onSubmit={handleSignIn} className="mt-8 space-y-5" noValidate>
              <div>
                <h1 className="text-2xl font-bold">Que bom te ver de novo</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  Entre para acessar seu espaço.
                </p>
              </div>
              <Field label="E-mail" name="email" type="email" error={errors["email"]} autoComplete="email" />
              <Field
                label="Senha"
                name="password"
                type="password"
                error={errors["password"]}
                autoComplete="current-password"
              />
              <Button type="submit" size="lg" className="min-h-12 w-full rounded-full" disabled={submitting}>
                {submitting && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
                Entrar
              </Button>
              <div className="flex flex-col gap-2 text-sm">
                <Link to="/recuperar-senha" className="text-primary hover:underline">
                  Esqueci minha senha
                </Link>
                <Link
                  to="/auth"
                  search={{ modo: "cadastro" }}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Criar uma conta
                </Link>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSignUp} className="mt-8 space-y-5" noValidate>
              <div>
                <h1 className="text-2xl font-bold">Crie seu espaço</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  Leva menos de um minuto. Você escolhe como quer ser chamado.
                </p>
              </div>

              <fieldset>
                <legend className="text-sm font-medium">Tipo de conta</legend>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {(
                    [
                      { value: "user", label: "Quero apoio" },
                      { value: "professional", label: "Sou profissional" },
                    ] as const
                  ).map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      aria-pressed={accountType === option.value}
                      onClick={() => setAccountType(option.value)}
                      className={cn(
                        "min-h-12 rounded-2xl border px-4 text-sm font-medium transition-colors",
                        accountType === option.value
                          ? "border-primary bg-primary-soft text-secondary-foreground"
                          : "border-border bg-card text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </fieldset>

              <Field
                label="Apelido"
                name="nickname"
                error={errors["nickname"]}
                hint="Seu apelido será o nome exibido dentro da plataforma. Você não precisa utilizar seu nome real como identificação pública."
                autoComplete="nickname"
              />
              <Field label="E-mail" name="email" type="email" error={errors["email"]} autoComplete="email" />
              <Field
                label="Senha"
                name="password"
                type="password"
                error={errors["password"]}
                autoComplete="new-password"
              />
              <Field
                label="Confirmação de senha"
                name="confirm"
                type="password"
                error={errors["confirm"]}
                autoComplete="new-password"
              />

              <div className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4">
                <Checkbox
                  id="termos"
                  checked={accepted}
                  onCheckedChange={(value) => setAccepted(value === true)}
                  className="mt-0.5"
                />
                <div>
                  <Label htmlFor="termos" className="text-sm font-normal leading-relaxed">
                    Li e concordo com os{" "}
                    <Link to="/termos" className="text-primary hover:underline">
                      Termos de Uso
                    </Link>{" "}
                    e a{" "}
                    <Link to="/privacidade" className="text-primary hover:underline">
                      Política de Privacidade
                    </Link>
                    .
                  </Label>
                  {errors["accepted"] && (
                    <p className="mt-1 text-xs text-destructive">{errors["accepted"]}</p>
                  )}
                </div>
              </div>

              <Button type="submit" size="lg" className="min-h-12 w-full rounded-full" disabled={submitting}>
                {submitting && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
                Criar minha conta
              </Button>
              <p className="text-sm text-muted-foreground">
                Já tem conta?{" "}
                <Link to="/auth" search={{ modo: "entrar" }} className="text-primary hover:underline">
                  Entrar
                </Link>
              </p>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}

function fieldErrors(error: z.ZodError) {
  const result: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!result[key]) result[key] = issue.message;
  }
  return result;
}

function Field({
  label,
  name,
  type = "text",
  error,
  hint,
  autoComplete,
}: {
  label: string;
  name: string;
  type?: string;
  error?: string | undefined;
  hint?: string | undefined;
  autoComplete?: string | undefined;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        name={name}
        type={type}
        autoComplete={autoComplete}
        aria-invalid={Boolean(error)}
        aria-describedby={hint ? `${name}-hint` : undefined}
        className="min-h-12 rounded-2xl"
      />
      {hint && (
        <p id={`${name}-hint`} className="text-xs text-muted-foreground">
          {hint}
        </p>
      )}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
