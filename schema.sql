-- ====================================================================
-- YEARGUESSR - ESQUEMA DE BANCO DE DADOS OFICIAL SUPABASE (POSTGRESQL)
-- Arquivo: schema.sql
-- Descrição: Estrutura completa de tabelas, índices, colunas e permissões RLS.
-- ====================================================================

-- 1. TABELA DE DESAFIOS (HISTÓRIA E FOTOS)
CREATE TABLE IF NOT EXISTS public.desafios (
    id text PRIMARY KEY,
    data_publicacao date NOT NULL,
    ano_correto integer NOT NULL,
    janela_anos integer[] DEFAULT ARRAY[1900, 2026],
    conteudo_i18n jsonb NOT NULL DEFAULT '{}'::jsonb,
    imagem_principal text NOT NULL,
    categorias text[] DEFAULT ARRAY['historia']::text[],
    dificuldade text DEFAULT 'normal',
    created_at timestamp with time zone DEFAULT now()
);

-- Índices para buscas rápidas por data e categoria
CREATE INDEX IF NOT EXISTS idx_desafios_data_publicacao ON public.desafios (data_publicacao);
CREATE INDEX IF NOT EXISTS idx_desafios_dificuldade ON public.desafios (dificuldade);

-- 2. TABELA DE CATEGORIAS
CREATE TABLE IF NOT EXISTS public.categorias (
    id text PRIMARY KEY,
    nome_i18n jsonb NOT NULL DEFAULT '{}'::jsonb,
    icone text,
    icon_url text,
    created_at timestamp with time zone DEFAULT now()
);

-- 3. TABELA DE DIRETRIZES DE DIFICULDADE (RÉGUA)
CREATE TABLE IF NOT EXISTS public.dificuldades (
    id text PRIMARY KEY,
    dificuldade text UNIQUE NOT NULL,
    tamanho_regua_anos integer NOT NULL DEFAULT 100,
    descricao_i18n jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now()
);

-- 4. TABELA DE ANÚNCIOS / LETREIROS PUBLICITÁRIOS
CREATE TABLE IF NOT EXISTS public.anuncios (
    id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
    titulo text NOT NULL,
    subtitulo text,
    link_destino text,
    imagem_url text,
    formato text NOT NULL DEFAULT '300x50', -- '300x50', '728x90', etc.
    posicao text DEFAULT 'ambos', -- 'esquerda', 'direita', 'ambos'
    ativo boolean DEFAULT true,
    mostrar_botao boolean DEFAULT true,
    texto_botao text DEFAULT 'Acessar',
    visualizacoes integer DEFAULT 0,
    cliques integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now()
);

-- 5. TABELA DE PROPOSTAS DE ANUNCIANTES (INBOX ADMIN)
CREATE TABLE IF NOT EXISTS public.anuncios_propostas (
    id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
    nome text NOT NULL,
    email text NOT NULL,
    linkedin text,
    pacote text,
    mensagem text,
    data_desejada text,
    tema_pretendido text,
    lida boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now()
);

-- 6. TABELA DE PARTIDAS E HISTÓRICO DE JOGADAS
CREATE TABLE IF NOT EXISTS public.partidas (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    desafio_id text REFERENCES public.desafios(id) ON DELETE SET NULL,
    pontos integer NOT NULL,
    distancia_anos integer DEFAULT 0,
    tempo_segundos integer DEFAULT 0,
    tentativas integer DEFAULT 1,
    palpites jsonb DEFAULT '[]'::jsonb,
    created_at timestamp with time zone DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_partidas_user_id ON public.partidas (user_id);
CREATE INDEX IF NOT EXISTS idx_partidas_created_at ON public.partidas (created_at);

-- 7. TABELA DE PERFIS DE USUÁRIOS
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username text UNIQUE,
    avatar_url text,
    streak_atual integer DEFAULT 0,
    melhor_streak integer DEFAULT 0,
    ultima_partida_data date,
    partidas_jogadas integer DEFAULT 0,
    vitorias integer DEFAULT 0,
    pontuacao_total integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now()
);

-- ====================================================================
-- CONFIGURAÇÃO DE SEGURANÇA E POLÍTICAS RLS (ROW LEVEL SECURITY)
-- ====================================================================

ALTER TABLE public.desafios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dificuldades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anuncios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anuncios_propostas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partidas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Permissões de Leitura Pública
DROP POLICY IF EXISTS "Leitura publica de desafios" ON public.desafios;
CREATE POLICY "Leitura publica de desafios" ON public.desafios FOR SELECT USING (true);

DROP POLICY IF EXISTS "Leitura publica de categorias" ON public.categorias;
CREATE POLICY "Leitura publica de categorias" ON public.categorias FOR SELECT USING (true);

DROP POLICY IF EXISTS "Leitura publica de dificuldades" ON public.dificuldades;
CREATE POLICY "Leitura publica de dificuldades" ON public.dificuldades FOR SELECT USING (true);

DROP POLICY IF EXISTS "Leitura publica de anuncios" ON public.anuncios;
CREATE POLICY "Leitura publica de anuncios" ON public.anuncios FOR SELECT USING (true);

-- Permissões de Escrita / Inserção Pública
DROP POLICY IF EXISTS "Insercao de propostas" ON public.anuncios_propostas;
CREATE POLICY "Insercao de propostas" ON public.anuncios_propostas FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Gerenciamento de anuncios" ON public.anuncios;
CREATE POLICY "Gerenciamento de anuncios" ON public.anuncios FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Gerenciamento de desafios" ON public.desafios;
CREATE POLICY "Gerenciamento de desafios" ON public.desafios FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Partidas usuarios" ON public.partidas;
CREATE POLICY "Partidas usuarios" ON public.partidas FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Perfis usuarios" ON public.profiles;
CREATE POLICY "Perfis usuarios" ON public.profiles FOR ALL USING (true) WITH CHECK (true);
