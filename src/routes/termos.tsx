import { createFileRoute } from "@tanstack/react-router";

import { ContentPage } from "@/components/ContentPage";

export const Route = createFileRoute("/termos")({
  head: () => ({
    meta: [
      { title: "Termos de uso — EntreNós" },
      {
        name: "description",
        content:
          "Termos de uso do EntreNós: finalidade de apoio emocional, responsabilidades e limites da plataforma.",
      },
      { property: "og:title", content: "Termos de uso — EntreNós" },
      {
        property: "og:description",
        content: "Finalidade, responsabilidades e limites da plataforma EntreNós.",
      },
    ],
  }),
  component: () => (
    <ContentPage
      title="Termos de uso"
      intro="Ao criar sua conta, você concorda com os pontos abaixo."
    >
      <section>
        <h2>Finalidade</h2>
        <p>
          O EntreNós é uma ferramenta de apoio e organização emocional. Não realiza diagnósticos,
          não prescreve tratamentos e não substitui atendimento psicológico ou médico.
        </p>
      </section>
      <section>
        <h2>Uso responsável</h2>
        <p>
          Você se compromete a usar a plataforma de forma respeitosa e a não utilizar o canal de
          mensagens para situações de emergência, que exigem atendimento imediato.
        </p>
      </section>
      <section>
        <h2>Comunicação assíncrona</h2>
        <p>
          As mensagens trocadas com profissionais não têm garantia de resposta imediata. Este é um
          canal assíncrono.
        </p>
      </section>
      <section>
        <h2>Conta e apelido</h2>
        <p>
          Você é responsável por manter suas credenciais em segurança. O apelido escolhido deve
          respeitar outras pessoas.
        </p>
      </section>
      <section>
        <h2>Emergências</h2>
        <p>
          Em situações de risco, procure o CVV pelo telefone 188, o SAMU pelo 192 ou o serviço de
          emergência mais próximo.
        </p>
      </section>
    </ContentPage>
  ),
});
