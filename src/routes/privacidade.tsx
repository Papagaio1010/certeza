import { createFileRoute } from "@tanstack/react-router";

import { ContentPage } from "@/components/ContentPage";

export const Route = createFileRoute("/privacidade")({
  head: () => ({
    meta: [
      { title: "Privacidade — EntreNós" },
      {
        name: "description",
        content:
          "Como o EntreNós trata seu apelido, seus registros do diário e o que você escolhe compartilhar com o profissional.",
      },
      { property: "og:title", content: "Privacidade — EntreNós" },
      {
        property: "og:description",
        content: "Apelido, controle de compartilhamento e cuidado com os seus dados.",
      },
    ],
  }),
  component: () => (
    <ContentPage
      title="Privacidade"
      intro="Privacidade é um dos pilares do EntreNós. Aqui explicamos, de forma simples, como cuidamos das suas informações."
    >
      <section>
        <h2>Seu apelido</h2>
        <p>
          Seu apelido é utilizado para preservar sua identidade dentro da plataforma. Ele é o nome
          exibido para você e para o profissional vinculado à sua conta. Você não precisa usar seu
          nome real como identificação pública.
        </p>
      </section>
      <section>
        <h2>Seus registros</h2>
        <p>
          Os registros do diário são privados por padrão. Somente os registros que você marcar como
          compartilhados ficam visíveis para o profissional vinculado à sua conta.
        </p>
      </section>
      <section>
        <h2>Mensagens</h2>
        <p>
          As mensagens são visíveis apenas para você e para o profissional com quem a conversa
          acontece.
        </p>
      </section>
      <section>
        <h2>Segurança da conta</h2>
        <p>
          O acesso é protegido por autenticação com e-mail e senha. As senhas nunca são armazenadas
          em texto puro. Ainda assim, nenhuma plataforma é totalmente imune a riscos: por isso
          preferimos falar em cuidado e responsabilidade, e não em garantias absolutas.
        </p>
      </section>
      <section>
        <h2>Seus escolhas</h2>
        <p>
          Você pode editar ou excluir seus registros, alterar seu apelido e deixar de compartilhar
          conteúdos quando quiser.
        </p>
      </section>
    </ContentPage>
  ),
});
