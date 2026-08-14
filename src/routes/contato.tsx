import { createFileRoute } from "@tanstack/react-router";

import { ContentPage } from "@/components/ContentPage";

export const Route = createFileRoute("/contato")({
  head: () => ({
    meta: [
      { title: "Contato — EntreNós" },
      {
        name: "description",
        content: "Fale com a equipe do EntreNós sobre dúvidas, sugestões ou privacidade.",
      },
      { property: "og:title", content: "Contato — EntreNós" },
      {
        property: "og:description",
        content: "Canais de contato da equipe do EntreNós.",
      },
    ],
  }),
  component: () => (
    <ContentPage
      title="Contato"
      intro="Se você tiver dúvidas, sugestões ou precisar falar sobre privacidade, estamos por aqui."
    >
      <section>
        <h2>E-mail</h2>
        <p>
          <a className="text-primary underline-offset-4 hover:underline" href="mailto:ola@entrenos.app">
            ola@entrenos.app
          </a>
        </p>
      </section>
      <section>
        <h2>Tempo de resposta</h2>
        <p>
          Respondemos em até alguns dias úteis. Este canal não é indicado para situações de
          emergência.
        </p>
      </section>
      <section>
        <h2>Emergências</h2>
        <p>CVV: 188 · SAMU: 192 · Emergência: procure o serviço mais próximo.</p>
      </section>
    </ContentPage>
  ),
});
