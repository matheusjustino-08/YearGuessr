# 1. Arquitetura de Sistema & Stack de Alta Performance

A arquitetura adota o modelo Jamstack com Edge Computing, focado em tempo de resposta sub-100ms em qualquer lugar do mundo e alta capacidade de escala.

## Diagrama da Arquitetura
```text
[ Cliente: React / Next.js / Framer Motion / i18n ]
       │
       ├── (Estado Local & Cache i18n) ──► LocalStorage / IndexedDB
       │
       ├── (API & Rotas de Borda) ────► Vercel Edge Functions + Cloudflare Proxies
       │
       └── (Backend & DB Relacional) ──► Supabase (Auth / PostgreSQL / RLS / Realtime)
```

## Tech Stack Detalhada

*   **Framework:** Next.js 14+ (App Router) com TypeScript (Modo estrito).
*   **Internacionalização (i18n):** `next-intl` ou `react-i18next`.
    *   Suporte nativo a múltiplos idiomas (PT-BR, EN-US, ES, JP, etc.) com detecção automática do idioma do navegador, roteamento por local (/pt/, /en/) e tradução de textos, formatos de data e unidades de medida.
*   **Estilização & UI:** Tailwind CSS + Shadcn/ui (componentes acessíveis e customizáveis).
*   **Engine de Animações & Shaders:**
    *   Framer Motion: Transições de layout, zoom dinâmico e animações da UI.
    *   HTML5 Canvas 2D / CSS Custom Properties: Para os efeitos visuais e filtros de fundo de cada época.
*   **Gerenciamento de Estado & Áudio:**
    *   Zustand (Estado do jogo e preferências)
    *   Howler.js (Efeitos sonoros adaptativos)
    *   Web Vibes API (retorno hápico no celular).
*   **Backend & Infraestrutura:** Supabase (Auth OIDC/Anônimo, PostgreSQL com RLS e Realtime) + ZOD (validação de schemas de dados).

## Arquitetura "Guest-First" & Progressão Sem Pânico

O jogo permite jogar instantaneamente sem barreiras, incentivando o login apenas para recursos sociais.

```text
[ Usuário entra no site ] ──► Cria Token Anônimo (Supabase Anon Auth)
                                              │
                                ┌─────────────┴─────────────┐
                                ▼                           ▼
                      Salva localmente (i18n)     Grava progresso no DB
                                │                           │
                                └─────────────┬─────────────┘
                                              ▼
                         [ Clique em "Entrar no Ranking" ]
                                              │
                         Autentica via OAuth (Google / Discord)
                                              │
                    Funde perfil anônimo ao perfil real (Link Account)
```

**Preservação de Dados:** Caso o jogador resolva criar uma conta após dias jogando, o histórico de vitórias, dados do i18n e a sequência de dias (streaks) são mesclados na conta definitiva sem perda de progresso.

## Painel Administrativo de Conteúdo (CMS Interno)

Cadastrar eventos manuais direto no JSON ou banco de dados via SQL se torna um pesadelo operacional no dia a dia. Você precisará de um painel de administração simples para:
*   Agendar os desafios dos próximos 30/60 dias.
*   Fazer upload e otimização automática de imagens (convertendo para WebP/AVIF).
*   Testar como a imagem fica com os filtros de cada era visual antes de publicar.
*   Inserir as traduções de i18n em blocos simples.

## Estratégia de SEO, Meta Tags & Open Graph Dinâmico

Para garantir que o jogo apareça bem no Google e fique bonito ao ser compartilhado no WhatsApp, X ou Discord:
*   **Open Graph Dinâmico (og:image):** A URL de compartilhamento deve gerar uma imagem estática contendo o resumo da jogada daquele usuário, para que a prévia da imagem apareça diretamente no chat das redes sociais quando ele colar o link.
*   **Schema Markup (Structured Data):** Tag de jogo HTML5 para indexação rápida no Google.
