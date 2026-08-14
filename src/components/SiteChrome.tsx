import { Link } from "@tanstack/react-router";

import { Logo } from "@/components/Logo";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-3 sm:px-6">
        <Logo />
        <nav aria-label="Acesso" className="flex shrink-0 items-center gap-2">
          <Link
            to="/auth"
            search={{ modo: "entrar" }}
            className="inline-flex min-h-11 items-center rounded-full px-4 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
          >
            Entrar
          </Link>
          <Link
            to="/auth"
            search={{ modo: "cadastro" }}
            className="inline-flex min-h-11 items-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-soft transition-colors hover:bg-primary/90"
          >
            Começar agora
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-4 max-w-sm text-sm text-muted-foreground">
            O EntreNós é um espaço para organizar o que você sente e conversar com um profissional
            usando um apelido dentro da plataforma.
          </p>
        </div>
        <div>
          <h2 className="text-sm font-semibold">Plataforma</h2>
          <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
            <li>
              <Link to="/sobre" className="hover:text-foreground">
                Sobre a plataforma
              </Link>
            </li>
            <li>
              <Link to="/privacidade" className="hover:text-foreground">
                Privacidade
              </Link>
            </li>
            <li>
              <Link to="/termos" className="hover:text-foreground">
                Termos de uso
              </Link>
            </li>
            <li>
              <Link to="/contato" className="hover:text-foreground">
                Contato
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h2 className="text-sm font-semibold">Aviso importante</h2>
          <p className="mt-4 text-sm text-muted-foreground">
            Esta plataforma é uma ferramenta de apoio e organização emocional e não substitui
            atendimento psicológico ou médico. Em situações de emergência, procure o CVV pelo
            telefone 188 ou o serviço de emergência mais próximo.
          </p>
        </div>
      </div>
      <div className="border-t border-border px-4 py-6 text-center text-xs text-muted-foreground sm:px-6">
        © {new Date().getFullYear()} EntreNós. Feito com cuidado.
      </div>
    </footer>
  );
}
