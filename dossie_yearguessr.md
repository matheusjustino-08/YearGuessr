# 📖 DOSSIÊ COMPLETO E DOCUMENTAÇÃO DO PROJETO YEARGUESSR

> **Ano de Criação**: 2026  
> **Tecnologias**: Next.js 16 (App Router & Turbopack), React 19, TypeScript, Tailwind CSS, Supabase PostgreSQL, Next-Intl (i18n), Lucide Icons, Canvas Confetti.

---

## 📌 1. Visão Geral do Projeto
O **YearGuessr** é um jogo web educativo e interativo de adivinhação histórica. Os jogadores visualizam imagens marcantes, fotografias históricas e acontecimentos do mundo e devem adivinhar o **ano exato** em que o evento ocorreu deslizando uma régua temporal dinâmica.

O projeto combina uma estética retrô e moderna, ajustando as cores, fundos e elementos visuais da interface dinamicamente de acordo com a época do evento exibido na tela.

---

## 🛡️ 2. Arquitetura de Segurança & Anti-Cheat (Server-Driven Guessing)

Para blindar o jogo contra usuários que inspecionam o código-fonte, DevTools ou estado React no navegador:

- **Payload Limpo no Cliente**: O endpoint e a store Zustand omitem completamente o campo `ano_correto` durante a jogabilidade. O cliente recebe apenas `id`, `imagem_principal`, `categorias`, `dificuldade`, `conteudo_i18n` e os limites `minYear` / `maxYear`.
- **Processamento 100% no Servidor (`/api/guess/route.ts`)**:
  - O cliente envia: `{ challengeId, guessYear, timeInSeconds, attemptNumber }`.
  - O servidor consulta o ano real no Supabase DB, calcula a diferença ($\Delta = |\text{palpite} - \text{ano}|$), aplica a curva de pontuação e gera a direção (⬆️ MAIS RECENTE / ⬇️ MAIS ANTIGO) e a badge (`Super Perto`, `Perto`, `Longe`).
  - **Revelação Protegida**: O `correctYear` só é enviado de volta no JSON de resposta quando `gameOver === true` (quando o jogador acerta ou atinge a 3ª tentativa).

---

## 🎓 3. Onboarding Fluido e Tutorial Interativo (`OnboardingModal.tsx`)

Um modal interativo em 3 passos orienta novos visitantes de forma visual sem poluir a tela:

1. **Passo 1: Olhe a Imagem & Aponte o Ano**: Explica a observação da foto e o uso da régua temporal.
2. **Passo 2: Feedback de Proximidade & Direção**: Apresenta as badges de distância (🟩 Super Perto $\le 3$ anos, 🟧 Perto 4-15 anos, 🟥 Longe $>15$ anos) e as setas direcionais.
3. **Passo 3: 3 Tentativas & Pontuação**: Explica os multiplicadores por tentativa ($1,0\times$, $0,72\times$, $0,50\times$).
- Persistência no navegador via `localStorage.getItem('yearguessr_has_seen_onboarding')`.

---

## 🖼️ 4. Otimização de Imagens & Custos de CDN Storage

Para garantir alta velocidade e evitar custos excessivos com transferência de dados:

- **Otimização Nativa `next/image`**: Configurado em `next.config.ts` com formatos de última geração: `formats: ['image/avif', 'image/webp']`.
- **Compressão Client-Side WebP no CMS (`image-compressor.ts`)**:
  - No painel `/admin`, antes de enviar arquivos para o Supabase Storage, a imagem é processada via HTML5 Canvas client-side.
  - É redimensionada para largura máxima de 1200px e convertida para o formato **WebP (qualidade 0.82)**.
- **Cabeçalhos de Cache Agressivos**: Envio com `cacheControl: '31536000'` (`public, max-age=31536000, immutable`), permitindo que a CDN armazene em cache por 1 ano.

---

## 🏆 5. Ranking Global Ponderado (Média Bayesiana Ajustada)

Para evitar que contas que jogaram apenas 1 partida e obtiveram 5.000 pontos fiquem acima de jogadores dedicados que acumulam alta média em dezenas de partidas, o ranking por **Média de Pontos** utiliza a **Fórmula Ponderada Bayesiana**:

$$\text{Weighted Score} = \frac{(v \cdot m) + (k \cdot C)}{v + k}$$

- **\(v\)**: Partidas jogadas pelo usuário.
- **\(m\)**: Média simples de pontos do usuário.
- **\(k = 5\)**: Fator de peso e amostra mínima.
- **\(C = 2500\)**: Média global da plataforma.
- **Selo `✓ Consistente`**: Exibido no ranking para jogadores com $\ge 5$ partidas concluídas.

---

## 🎮 6. Modos de Jogo e Regras

### 📅 A. Desafio Diário (`daily`)
- **Frequência**: 1 desafio inédito por dia (`data_publicacao = YYYY-MM-DD`).
- **Bloqueio de Replay**: Progresso salvo localmente e no Supabase.

### 🎯 B. Modo Treino (`practice`)
- **Jogabilidade Ilimitada**: Desafios sorteados aleatoriamente do acervo.
- **Filtros por Categoria**: Guerra & Conflitos, Ciência & Tecnologia, Arte & Cultura, Cinema & Música, Esportes, Política & História.
- **Filtros por Dificuldade**: Fácil, Normal, Difícil.

---

## 🧮 7. Algoritmo de Pontuação (Curva Exponencial Gaussiana)

Calculado via `/api/guess/route.ts`:

$$S_{\text{base}} = 5000 \cdot e^{-0,018 \cdot d}$$

- **\(d\)**: $|\text{palpite} - \text{ano}|$.
- **Penalidade de Tempo**: $- (\text{tempo em segundos} \times 3)$.
- **Multiplicadores por Tentativa**: 1ª ($1,0\times$), 2ª ($0,72\times$), 3ª ($0,50\times$).

---

## 📐 8. Motor de Régua Orgânica (IA / Calculador de Escala)

Localizado em `src/lib/ruler-calculator.ts`:
- **Fácil**: Alcance amplo ($\sim 240$ anos).
- **Normal**: Alcance intermediário ($\sim 150$ anos).
- **Difícil**: Alcance estreito ($\sim 70$ anos).

---

## 🎨 9. Temas Imersivos por Época (`ThemeEngine.tsx`)

- **Idade Média** ($< 1500$)
- **Renascentista** ($1500 - 1799$)
- **Era Industrial** ($1800 - 1899$)
- **Início Século XX** ($1900 - 1949$)
- **Anos de Ouro** ($1950 - 1979$)
- **Retrô 80s e 90s** ($1980 - 1999$)
- **Era Digital / Moderna** ($\ge 2000$)
- **Tema Neutro Admin**: Rotas `/admin` em estilo dashboard profissional.

---

## 🌍 10. Internacionalização (i18n)

Suporte a 3 idiomas: **Português (`pt`)**, **Inglês (`en`)**, **Espanhol (`es`)** centralizados em `messages/*.json`.

---

## 🛠️ 11. Painel de Administração e CMS (`/admin`)

- **Gerenciador de Desafios**: Criação, edição, gerador de régua orgânica com IA e upload comprimido WebP.
- **Gerenciador de Categorias**: Edição inline de nomes e ícones SVG.
- **Gerenciador de Anúncios**: Métricas de Visualizações (deduplicadas de 1 em 1), Cliques, CTR % e controle de botão CTA (`mostrar_botao`).
- **Caixa de Entrada de Propostas**: Respostas rápidas via WhatsApp, E-mail e LinkedIn.

---

## 🗄️ 12. Esquema do Banco de Dados Supabase (`schema.sql`)

Tabelas: `desafios`, `categorias`, `dificuldades`, `anuncios`, `anuncios_propostas`, `partidas`, `profiles`.
