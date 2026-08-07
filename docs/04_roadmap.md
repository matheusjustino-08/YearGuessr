# 4. Roadmap de Desenvolvimento

O desenvolvimento do projeto "Chronos" (YearGuessr) será dividido em 3 fases principais:

## Fase 1: Engine Visual, Épocas e i18n (Semanas 1 e 2)
- [x] Configuração do Next.js + TypeScript + `next-intl` (suporte PT/EN/ES 100% via JSON).
- [x] Construção do componente da linha do tempo com Framer Motion e botões de ajuste fino (-10, -1, +1, +10).
- [x] Implementação dos 7 temas visuais de época (Medieval, Renascença, Industrial, Cinema Mudo, Anos de Ouro, Retrowave 80s e Era Digital) com suporte ao Modo Claro e Escuro.
- [x] Molduras customizadas por era no cartão de fotos com animação 3D no mouse hover.
- [x] Sistema de sons dinâmicos e retorno háptico (Web Vibes API).

## Fase 2: Backend, Segurança e API Confidential (Semana 3)
- [x] Configuração inicial do projeto no Supabase (PostgreSQL, Auth).
- [x] Criação e migração das tabelas do banco de dados (`perfis`, `desafios`, `partidas`, `anuncios`) com suporte a i18n JSONB e categorias.
- [x] Painel de Administração (CMS Interno) para cadastro e edição completa de desafios, categorias e gerenciador de letreiros (300x50px).
- [x] Configuração das políticas de segurança RLS (Row Level Security) no Supabase.
- [x] Sistema de sessão anônima e perfil de usuário.

## Fase 3: Social, Card SVG e Leaderboard (Semana 4)
- [x] Criação da página e tabela de Leaderboard (Ranking Global) em tempo real.
- [x] Integração de login progressivo OAuth (Google / GitHub).
- [x] Rodapé responsivo com integração ao Ko-fi e modal de anunciantes.

## Planejamento Concluído: Monetização Ética e Anúncios
- [x] **Sem Anúncios Invasivos:** Letreiros retrô no formato 300x50px e Leaderboard 728x90px integrados sem quebrar a imersão visual.
- [x] **Apoie o Projeto (Ko-fi):** Botão interativo no rodapé para suporte voluntário.
- [x] **Gerenciador de Letreiros no Admin:** Painel no CMS para atração, criação e ativação de patrocinadores via Supabase.
