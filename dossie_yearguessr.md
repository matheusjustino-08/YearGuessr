# 📖 DOSSIÊ COMPLETO E DOCUMENTAÇÃO DO PROJETO YEARGUESSR

> **Ano de Criação**: 2026  
> **Tecnologias**: Next.js 16 (App Router & Turbopack), React 19, TypeScript, Tailwind CSS, Supabase PostgreSQL, Next-Intl (i18n), Lucide Icons, Canvas Confetti.

---

## 📌 1. Visão Geral do Projeto
O **YearGuessr** é um jogo web educativo e interativo de adivinhação histórica. Os jogadores visualizam imagens marcantes, fotografias históricas e acontecimentos do mundo e devem adivinhar o **ano exato** em que o evento ocorreu deslizando uma régua temporal dinâmica.

O projeto combina uma estética retrô e moderna, ajustando as cores, fundos e elementos visuais da interface dinamicamente de acordo com a época do evento exibido na tela.

---

## 🎮 2. Modos de Jogo e Regras

### 📅 A. Desafio Diário (`daily`)
- **Frequência**: 1 desafio inédito por dia, liberado exatamente à meia-noite (`data_publicacao = YYYY-MM-DD`).
- **Integridade Competitiva**: O desafio do dia é exclusivo do modo diário. Ele só entra na reserva do Modo Treino a partir do dia seguinte.
- **Bloqueio de Replay**: Quando concluído, o progresso é registrado localmente e no Supabase. O jogador visualiza uma tela avisando que já concluiu a rodada do dia e pode prosseguir para o Modo Treino.

### 🎯 B. Modo Treino (`practice`)
- **Jogabilidade Ilimitada**: Carrega desafios ilimitados sorteados aleatoriamente do banco de dados.
- **Filtros por Categoria**: O jogador pode filtrar desafios por **Guerra & Conflitos**, **Ciência & Tecnologia**, **Arte & Cultura**, **Cinema & Música**, **Esportes**, **Política & História**.
- **Filtros por Dificuldade**: Permite escolher entre nível **Fácil**, **Normal** ou **Difícil**.

---

## 🎯 3. Sistema de Jogabilidade (3 Tentativas e Dicas)

Cada desafio concede ao jogador **3 tentativas consecutivas** para acertar o ano correto:

1. **Indicador de Tentativas**: Exibe o contador visual `Tentativa X de 3`.
2. **Dicas Direcionais por Cor**:
   - ⬆️ **MAIS RECENTE** (Azul): O ano correto é maior que o palpite atual.
   - ⬇️ **MAIS ANTIGO** (Laranja): O ano correto é menor que o palpite atual.
3. **Badges de Proximidade Sem Spoilers**:
   - 🟩 **Super Perto**: Diferença de $\le 3$ anos.
   - 🟧 **Perto**: Diferença de $4 \text{ a } 15$ anos.
   - 🟥 **Longe**: Diferença $> 15$ anos.
4. **Histórico de Palpites**: Exibe os palpites anteriores da rodada para auxiliar no raciocínio.

---

## 🧮 4. Algoritmo de Pontuação (Curva Exponencial Gaussiana)

A pontuação é calculada de forma matemática e contínua via API (`/api/guess/route.ts`), sem números estáticos genéricos:

$$S_{\text{base}} = 5000 \cdot e^{-0,018 \cdot d}$$

- **\(d\)**: Diferença em anos entre o palpite e o ano correto ($|\text{palpite} - \text{ano}|$).
- **Penalidade de Tempo**: $- (\text{tempo em segundos} \times 3)$ (máx. 300 pts).
- **Penalidade de Dicas**: $- (\text{dicas utilizadas} \times 400)$.

### Multiplicadores por Tentativa:
- **1ª Tentativa**: $1,0\times$ ($100\%$ do valor máximo - até 5000 pts).
- **2ª Tentativa**: $0,72\times$ ($72\%$ do valor máximo - até 3600 pts).
- **3ª Tentativa**: $0,50\times$ ($50\%$ do valor máximo - até 2500 pts).

---

## 📐 5. Motor de Régua Orgânica (IA / Calculador de Escala)

Localizado em `src/lib/ruler-calculator.ts`, o algoritmo calcula a régua temporal de forma orgânica e imprevisível a cada desafio, evitando que o jogador deduza o ano central pelo tamanho fixo da régua:

- **Fácil**: Alcance amplo ($\sim 240$ anos de span).
- **Normal**: Alcance intermediário ($\sim 150$ anos de span).
- **Difícil**: Alcance estreito e desafiador ($\sim 70$ anos de span).
- **Deslocamento Randômico**: O ano correto nunca fica exatamente no centro da régua.

---

## 🎨 6. Motor de Temas Imersivos por Época (`ThemeEngine.tsx`)

A interface do YearGuessr se transforma visualmente de acordo com a época do ano exibido:

| Época | Intervalo de Anos | Estilo Visual |
| :--- | :--- | :--- |
| **Idade Média** | Anos $< 1500$ | Tons pergaminho, brasões e brilho de brasas de tocha. |
| **Renascentista** | $1500 - 1799$ | Tons âmbar veneziano e detalhes dourados. |
| **Era Industrial** | $1800 - 1899$ | Tons ferro sepia, vapor e estética vitoriana. |
| **Início Século XX** | $1900 - 1949$ | Tons preto e branco / sepia clássico de jornal. |
| **Anos de Ouro** | $1950 - 1979$ | Tons quentes de TV a cores retro e vinil. |
| **Retrô 80s e 90s** | $1980 - 1999$ | Neon ciano e magenta com visual synthwave. |
| **Era Digital / Moderna**| $\ge 2000$ | Azul cibernético ultra-moderno e limpo. |
| **Tema Neutro Admin** | Rotas `/admin` | Visual neutral profissional de dashboard, sem sobreposição de temas de jogo. |

---

## 🌍 7. Sistema de Internacionalização (i18n)

O projeto é 100% bilíngue/trilíngue através do `next-intl`:
- 🇧🇷 **Português (`pt`)**
- 🇺🇸 **Inglês (`en`)**
- 🇪🇸 **Espanhol (`es`)**

Todas as telas, modais, mensagens de erro, botões, diretrizes e notificações seguem as chaves centralizadas em `messages/*.json`.

---

## 🛠️ 8. Painel de Administração e CMS (`/admin`)

Acessível em `/[locale]/admin`, o painel é dividido em seções funcionais:

1. **Gerenciador de Desafios (`ChallengeListSection.tsx` & `ChallengeFormSection.tsx`)**:
   - Cadastro e edição de desafios com imagem, ano correto, i18n, categorias e dificuldade.
   - Botão **"Gerar Régua Orgânica (IA)"** para definir início e fim da régua automaticamente.
2. **Gerenciador de Categorias (`CategoryManagerSection.tsx`)**:
   - Edição de rótulos e suporte a ícones SVG e URLs.
3. **Gerenciador de Anúncios (`AdManagerSection.tsx`)**:
   - Controle de letreiros (300x50, 728x90), ativação/desativação e chave do botão de ação CTA (`mostrar_botao`).
   - Rastreamento de **Visualizações**, **Cliques** e **CTR %** por anúncio.
   - Gerador de relatórios em formato texto para envio aos anunciantes.
4. **Caixa de Entrada de Propostas de Anunciantes**:
   - Recebimento de formulários enviados via `/anuncie` ou modal publicitário.
   - Links diretos com 1 clique para responder via **WhatsApp**, **E-mail** ou abrir o **LinkedIn da Empresa**.
5. **Diretrizes de Dificuldade (`DifficultyGuidelinesSection.tsx`)**.

---

## 🗄️ 9. Esquema do Banco de Dados Supabase (`schema.sql`)

Documentado no arquivo `schema.sql` na raiz do projeto:

- `desafios`: Tabela principal de desafios históricos.
- `categorias`: Categorias ativas.
- `dificuldades`: Tamanho e regras da régua por nível.
- `anuncios`: Banners e métricas de anúncios.
- `anuncios_propostas`: Inbox de propostas recebidas.
- `partidas`: Histórico de palpites e pontuações dos usuários.
- `profiles`: Estatísticas do jogador, avatar e contagem de streaks.

---

## 👤 10. Autenticação & Perfil de Jogador

- Login via **Google**, **GitHub** e **E-mail / Senha**.
- Rastreamento de **Streak de Dias Consecutivos Jogados**.
- Ranking Global (`/leaderboard`) por pontuação.
