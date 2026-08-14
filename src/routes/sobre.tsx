import { createFileRoute } from "@tanstack/react-router";

import { ContentPage } from "@/components/ContentPage";

export const Route = createFileRoute("/sobre")({
  head: () => ({
    meta: [
      { title: "Sobre o EntreNós — apoio emocional com acolhimento" },
      {
        name: "description",
        content:
          "Conheça a proposta do EntreNós: um ambiente intermediário entre pessoas e profissionais de saúde mental, com uso de apelido dentro da plataforma.",
      },
      { property: "og:title", content: "Sobre o EntreNós" },
      {
        property: "og:description",
        content: "Um ambiente de apoio emocional com apelido, diário e comunicação assíncrona.",
      },
    ],
  }),
  component: () => (
    <ContentPage
      title="Sobre a plataforma"
      intro="O EntreNós existe para tornar o primeiro passo mais leve."
    >
      <section>
        <h2>Nossa proposta</h2>
        <p>
          Muitas pessoas adiam pedir ajuda por medo de julgamento. O EntreNós funciona como um
          ambiente intermediário entre você e profissionais de saúde mental, permitindo que você use
          um apelido dentro da plataforma enquanto organiza o que sente.
        </p>
      </section>
      <section>
        <h2>O que você encontra aqui</h2>
        <p>
          Um perfil emocional simples, um diário para escrever livremente, controle sobre o que é
          compartilhado e um canal de mensagens assíncrono com o profissional vinculado à sua conta.
        </p>
      </section>
      <section>
        <h2>O que não fazemos</h2>
        <p>
          Não realizamos diagnósticos, não oferecemos atendimento de emergência e não substituímos a
          psicoterapia tradicional. Somos uma ferramenta de apoio e organização emocional.
        </p>
      </section>
    </ContentPage>
  ),
});
