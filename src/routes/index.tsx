import { Link, createFileRoute } from "@tanstack/react-router";
import {
  BookHeart,
  HeartHandshake,
  Lock,
  MessagesSquare,
  Sparkles,
  UserRound,
  ShieldCheck,
  LifeBuoy,
} from "lucide-react";

import heroImage from "@/assets/hero-acolhimento.jpg";
import privacyImage from "@/assets/privacidade.jpg";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "EntreNós — um espaço seguro para cuidar do que sente" },
      {
        name: "description",
        content:
          "Registre suas emoções, mantenha um diário emocional e converse com um profissional usando um apelido dentro da plataforma.",
      },
      { property: "og:title", content: "EntreNós — um espaço seguro para cuidar do que sente" },
      {
        property: "og:description",
        content:
          "Registre suas emoções, mantenha um diário emocional e converse com um profissional usando um apelido dentro da plataforma.",
      },
    ],
  }),
  component: Landing,
});

const steps = [
  {
    number: "1",
    title: "Crie seu espaço anônimo",
    description: "Escolha um apelido e crie sua conta.",
    icon: UserRound,
  },
  {
    number: "2",
    title: "Conte como você está se sentindo",
    description: "Selecione as emoções que mais representam seu momento.",
    icon: Sparkles,
  },
  {
    number: "3",
    title: "Registre seus sentimentos",
    description: "Utilize o diário emocional para organizar pensamentos e acontecimentos.",
    icon: BookHeart,
  },
  {
    number: "4",
    title: "Converse com um profissional",
    description: "Envie mensagens e compartilhe registros quando desejar.",
    icon: MessagesSquare,
  },
];

const features = [
  {
    title: "Perfil emocional",
    description: "Um resumo suave das emoções que mais aparecem nos seus registros.",
    icon: HeartHandshake,
  },
  {
    title: "Diário emocional",
    description: "Escreva livremente sobre o seu dia, no seu tempo e do seu jeito.",
    icon: BookHeart,
  },
  {
    title: "Mensagens privadas",
    description: "Um canal calmo e assíncrono para falar com seu profissional.",
    icon: MessagesSquare,
  },
  {
    title: "Acompanhamento com profissional",
    description: "O profissional vê apenas o que você escolheu compartilhar.",
    icon: UserRound,
  },
  {
    title: "Privacidade",
    description: "Seu apelido é usado para preservar sua identidade dentro da plataforma.",
    icon: Lock,
  },
];

function Landing() {
  return (
    <div className="min-h-dvh bg-background">
      <SiteHeader />
      <main>
        <section className="relative overflow-hidden">
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24">
            <div className="animate-rise">
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-xs font-semibold text-muted-foreground">
                <Lock className="size-3.5 text-primary" aria-hidden="true" />
                Você escolhe o apelido que quer usar
              </span>
              <h1 className="mt-6 text-4xl font-extrabold leading-[1.08] sm:text-5xl lg:text-6xl">
                Um espaço seguro para você <span className="text-gradient-brand">cuidar do que sente</span>.
              </h1>
              <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                Aqui você pode registrar seus sentimentos, organizar o que está acontecendo e buscar
                apoio de forma mais confortável e discreta. Dentro da plataforma você é conhecido
                pelo apelido que escolher.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/auth"
                  search={{ modo: "cadastro" }}
                  className="inline-flex min-h-12 items-center justify-center rounded-full bg-gradient-brand px-7 text-sm font-semibold text-primary-foreground shadow-lift transition-transform hover:-translate-y-0.5"
                >
                  Começar agora
                </Link>
                <Link
                  to="/auth"
                  search={{ modo: "entrar" }}
                  className="inline-flex min-h-12 items-center justify-center rounded-full border border-border bg-card px-7 text-sm font-semibold transition-colors hover:bg-secondary"
                >
                  Entrar
                </Link>
              </div>
              <p className="mt-6 text-xs text-muted-foreground">
                Este é um espaço de apoio e organização emocional. Não realizamos diagnósticos.
              </p>
            </div>
            <div className="relative animate-rise">
              <div className="overflow-hidden rounded-4xl border border-border shadow-lift">
                <img
                  src={heroImage}
                  alt="Ilustração abstrata de duas conversas se encontrando em forma de coração"
                  width={1280}
                  height={1024}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="bg-surface py-16 lg:py-24" aria-labelledby="como-funciona">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 id="como-funciona" className="text-3xl font-bold sm:text-4xl">
              Como funciona
            </h2>
            <p className="mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">
              Quatro passos simples, no seu ritmo.
            </p>
            <ol className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {steps.map((step) => (
                <li key={step.number} className="card-soft p-6">
                  <span className="grid size-11 place-items-center rounded-2xl bg-primary-soft text-primary">
                    <step.icon className="size-5" aria-hidden="true" />
                  </span>
                  <p className="mt-5 text-xs font-bold tracking-widest text-accent">
                    PASSO {step.number}
                  </p>
                  <h3 className="mt-2 text-base font-semibold">{step.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{step.description}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="py-16 lg:py-24" aria-labelledby="anonimato">
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2">
            <div className="overflow-hidden rounded-4xl border border-border bg-gradient-soft shadow-soft">
              <img
                src={privacyImage}
                alt="Ilustração abstrata de um escudo translúcido representando proteção"
                width={1024}
                height={1024}
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <h2 id="anonimato" className="text-3xl font-bold sm:text-4xl">
                Por que anonimato?
              </h2>
              <p className="mt-5 text-base leading-relaxed text-muted-foreground">
                Você não precisa expor seu nome real publicamente. Dentro da plataforma, você pode
                utilizar um apelido para se sentir mais confortável ao começar.
              </p>
              <ul className="mt-8 space-y-4">
                {[
                  {
                    icon: UserRound,
                    text: "Seu apelido é o nome exibido para o profissional e nas suas telas.",
                  },
                  {
                    icon: ShieldCheck,
                    text: "Usar um apelido não significa ausência de segurança: sua conta continua protegida por autenticação.",
                  },
                  {
                    icon: Lock,
                    text: "Você decide quais registros do diário deseja compartilhar.",
                  },
                ].map((item) => (
                  <li key={item.text} className="flex gap-3">
                    <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent">
                      <item.icon className="size-4" aria-hidden="true" />
                    </span>
                    <p className="text-sm text-muted-foreground">{item.text}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="bg-surface py-16 lg:py-24" aria-labelledby="recursos">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 id="recursos" className="text-3xl font-bold sm:text-4xl">
              Recursos
            </h2>
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <article key={feature.title} className="card-soft p-6">
                  <span className="grid size-11 place-items-center rounded-2xl bg-primary-soft text-primary">
                    <feature.icon className="size-5" aria-hidden="true" />
                  </span>
                  <h3 className="mt-5 text-base font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 lg:py-24" aria-labelledby="seguranca">
          <div className="mx-auto max-w-4xl px-4 sm:px-6">
            <div className="card-soft p-8 sm:p-10">
              <span className="grid size-12 place-items-center rounded-2xl bg-accent-soft text-accent">
                <LifeBuoy className="size-6" aria-hidden="true" />
              </span>
              <h2 id="seguranca" className="mt-6 text-2xl font-bold sm:text-3xl">
                Cuidado e responsabilidade
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
                O EntreNós é uma ferramenta de apoio e organização emocional. Ele não substitui
                atendimento psicológico ou médico e não realiza diagnósticos.
              </p>
              <div className="mt-6 rounded-2xl border border-accent/30 bg-accent-soft/60 p-5">
                <h3 className="text-sm font-semibold">Se você precisa de ajuda agora</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Em situações de emergência ou risco, procure atendimento imediato: CVV pelo
                  telefone <strong className="text-foreground">188</strong> (24h), SAMU{" "}
                  <strong className="text-foreground">192</strong> ou a emergência mais próxima de
                  você.
                </p>
              </div>
              <p className="mt-6 text-sm text-muted-foreground">
                Você não precisa passar por isso em silêncio.
              </p>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
