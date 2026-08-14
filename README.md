# EntreNós — Plataforma de Apoio Emocional

EntreNós é uma plataforma digital de apoio emocional e acompanhamento psicológico com foco em
anonimato, acolhimento, privacidade e simplicidade. Pessoas registram emoções em um diário,
escolhem o que compartilhar e conversam de forma assíncrona com profissionais de saúde mental.

> A plataforma não substitui psicoterapia tradicional e não realiza diagnósticos automáticos.

## Funcionalidades

- Cadastro e login com apelido anônimo (contas de usuário e de profissional).
- Onboarding em etapas com seleção de emoções predominantes e humor atual.
- Diário emocional com criação, edição, exclusão e controle de privacidade por registro.
- Perfil emocional editável e painel com resumo do estado atual.
- Vínculo opcional com um profissional, com possibilidade de desfazer a qualquer momento.
- Mensagens assíncronas entre paciente e profissional, com contagem de não lidas.
- Área profissional: painel, lista de pacientes vinculados e detalhe de acompanhamento.
- Cadastro profissional completo (dados pessoais, foto, dados profissionais, currículo em PDF,
  contato e controles de privacidade/visibilidade).
- Páginas institucionais: sobre, contato, privacidade e termos.

## Stack

- [TanStack Start](https://tanstack.com/start) (React 19 + SSR) e TanStack Router
- TanStack Query para dados
- Vite 8 como build tool
- Tailwind CSS v4 (configurado em `src/styles.css`) + componentes shadcn/ui
- Supabase (banco de dados, autenticação e storage)

## Estrutura do projeto

```text
public/                 arquivos estáticos servidos na raiz (favicon, robots.txt)
src/
  assets/               imagens do projeto (logo, ilustrações) importadas pelo bundler
  components/           componentes de UI e de layout (AppShell, Logo, ProfileAvatar, ui/)
  hooks/                hooks compartilhados (useAuth, use-mobile)
  integrations/supabase/ cliente, tipos e middlewares de autenticação
  lib/                  consultas ao banco, storage, emoções e utilidades
  routes/               rotas por arquivo (páginas públicas, /app e /pro)
  styles.css            tokens de design, cores, fontes e utilitários
  router.tsx            configuração do router
supabase/               configuração e migrações do banco
```

## Como rodar localmente

Requisitos: Node.js 20+ e npm (o projeto também funciona com bun ou pnpm).

```bash
git clone <url-do-seu-repositorio>
cd <pasta-do-projeto>
npm install
cp .env.example .env   # preencha com as credenciais do seu Supabase
npm run dev
```

A aplicação sobe em `http://localhost:8080`.

## Variáveis de ambiente

Todas estão documentadas em `.env.example`. O arquivo `.env` não é versionado.

| Variável | Uso |
| --- | --- |
| `VITE_SUPABASE_URL` | URL do projeto Supabase (navegador) |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Chave publishable/anon (navegador) |
| `VITE_SUPABASE_PROJECT_ID` | Identificador do projeto (navegador) |
| `SUPABASE_URL` | URL do projeto Supabase (SSR) |
| `SUPABASE_PUBLISHABLE_KEY` | Chave publishable/anon (SSR) |
| `SUPABASE_PROJECT_ID` | Identificador do projeto (SSR) |
| `SUPABASE_SERVICE_ROLE_KEY` | Opcional, apenas para operações administrativas no servidor |

## Banco de dados

As migrações ficam em `supabase/migrations`. Para aplicar em um projeto Supabase próprio:

```bash
npx supabase link --project-ref <seu-project-ref>
npx supabase db push
```

Também é necessário criar os buckets privados de storage `avatars` e `curriculos`.

## Scripts

```bash
npm run dev      # ambiente de desenvolvimento
npm run build    # build de produção
npm run preview  # pré-visualização do build
npm run lint     # análise estática
npm run format   # formatação com Prettier
```

## Enviar para o GitHub

```bash
git add .
git commit -m "Projeto completo"
git push
```

Nada no código depende de recursos internos do editor: imagens e a logo estão em `src/assets` e
`public`, todas as dependências estão declaradas em `package.json` e as credenciais vêm do `.env`.

## Publicação

O projeto usa renderização no servidor (SSR) e funções de servidor, portanto precisa de uma
hospedagem que execute Node/edge — Vercel, Netlify, Cloudflare Workers ou um servidor próprio.
Configure as variáveis de ambiente na plataforma escolhida e use:

```bash
npm install
npm run build
```

GitHub Pages serve apenas arquivos estáticos e, por isso, não executa o SSR desta aplicação; o
repositório no GitHub funciona normalmente como fonte do código e para deploy automático via
GitHub Actions apontando para uma dessas hospedagens.

## Licença

Projeto de uso próprio. Ajuste esta seção conforme a licença desejada.
