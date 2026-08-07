# 3. Modelagem de Dados e Segurança

## Padrões de Segurança & Anti-Cheat

*   **Validação Estrita via Serverless (Edge Functions):**
    *   O cliente nunca recebe o ano correto (`anoCorreto`) ao carregar a página.
    *   Cada palpite envia uma requisição `POST /api/guess` com o ID da partida e o ano escolhido.
    *   A Edge Function valida a resposta no banco, calcula o erro e retorna apenas a diferença (ex: `-4` anos) e a liberação da próxima dica.

*   **Proteção de Banco de Dados (Supabase RLS):**
    *   Regras rigorosas para inserção e leitura de dados, garantindo que o usuário só altere seus próprios dados e a tabela de líderes seja pública.

*   **Limitação de Taxa (Rate Limiting):**
    *   Integração com Upstash Redis nas Edge Functions para limitar o envio de palpites a no máximo 10 por minuto por IP, bloqueando brute-force.

## Modelagem do Banco de Dados (PostgreSQL)

```sql
-- 1. TABELA DE DESAFIOS DIÁRIOS (Com suporte i18n)
CREATE TABLE IF NOT EXISTS desafios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data_publicacao DATE UNIQUE NOT NULL,
  ano_correto INT NOT NULL,
  janela_anos INT[] NOT NULL, -- Ex: [1500, 2026]
  conteudo_i18n JSONB NOT NULL, -- Contém títulos e dicas em {"pt": {...}, "en": {...}, "es": {...}}
  imagem_principal TEXT NOT NULL, -- URL direta da imagem (Unsplash, Imgur, Wikipedia etc.)
  categorias TEXT[] DEFAULT '{}', -- Ex: ['guerra', 'tecnologia', 'arte', 'cinema']
  dificuldade TEXT DEFAULT 'normal', -- 'facil' | 'normal' | 'dificil'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. TABELA DE PERFIS DE JOGADORES
CREATE TABLE IF NOT EXISTS perfis (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username VARCHAR(50) UNIQUE,
  avatar_url TEXT,
  role VARCHAR(20) DEFAULT 'user',
  idioma_preferido VARCHAR(10) DEFAULT 'pt-BR',
  e_anonimo BOOLEAN DEFAULT true,
  streak_atual INT DEFAULT 0,
  maior_streak INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. TABELA DE PARTIDAS/RESULTADOS (Para Rankings)
CREATE TABLE IF NOT EXISTS partidas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES perfis(id) ON DELETE CASCADE,
  desafio_id UUID REFERENCES desafios(id),
  tentativas INT NOT NULL,
  acertou BOOLEAN NOT NULL,
  pontos INT NOT NULL,
  tempo_segundos INT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT partida_unica_por_dia UNIQUE(user_id, desafio_id)
);

-- 4. TABELA DE ANÚNCIOS E LETREIROS (Gerenciador do Admin)
CREATE TABLE IF NOT EXISTS anuncios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  subtitulo TEXT,
  link_destino TEXT DEFAULT 'https://wa.me/5511999999999',
  imagem_url TEXT, -- URL direta da imagem do banner/letreiro
  formato TEXT DEFAULT '300x50', -- '300x50' | '728x90'
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================================
-- TRIGGER DE AUTOMAÇÃO: AUTH.USERS -> PUBLIC.PERFIS
-- ========================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.perfis (id, username, avatar_url, e_anonimo)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url',
    false
  )
  ON CONFLICT (id) DO UPDATE SET
    avatar_url = EXCLUDED.avatar_url,
    username = COALESCE(public.perfis.username, EXCLUDED.username),
    e_anonimo = false;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- BACKFILL: Copiar usuários anteriores que já existiam em auth.users
INSERT INTO public.perfis (id, username, avatar_url, e_anonimo)
SELECT 
  id,
  COALESCE(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name', email),
  raw_user_meta_data->>'avatar_url',
  false
FROM auth.users
ON CONFLICT (id) DO UPDATE SET
  avatar_url = EXCLUDED.avatar_url,
  username = COALESCE(public.perfis.username, EXCLUDED.username),
  e_anonimo = false;

-- ========================================================
-- POLÍTICAS DE SEGURANÇA (ROW LEVEL SECURITY - RLS)
-- ========================================================
ALTER TABLE desafios ENABLE ROW LEVEL SECURITY;
ALTER TABLE perfis ENABLE ROW LEVEL SECURITY;
ALTER TABLE partidas ENABLE ROW LEVEL SECURITY;

-- Leitura pública dos desafios
DROP POLICY IF EXISTS "Leitura pública de desafios" ON desafios;
CREATE POLICY "Leitura pública de desafios" ON desafios FOR SELECT USING (true);

-- Permissões de perfis
DROP POLICY IF EXISTS "Leitura pública de perfis" ON perfis;
CREATE POLICY "Leitura pública de perfis" ON perfis FOR SELECT USING (true);

DROP POLICY IF EXISTS "Usuário insere próprio perfil" ON perfis;
CREATE POLICY "Usuário insere próprio perfil" ON perfis FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Usuário atualiza próprio perfil" ON perfis;
CREATE POLICY "Usuário atualiza próprio perfil" ON perfis FOR UPDATE USING (auth.uid() = id);

-- Permissões de partidas (Rankings)
DROP POLICY IF EXISTS "Inserção de palpites própria sessão" ON partidas;
CREATE POLICY "Inserção de palpites própria sessão" ON partidas FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Leitura pública do ranking" ON partidas;
CREATE POLICY "Leitura pública do ranking" ON partidas FOR SELECT USING (true);

-- Permissões de anúncios (leitura pública + admin pode escrever)
DROP POLICY IF EXISTS "Leitura pública de anúncios" ON anuncios;
CREATE POLICY "Leitura pública de anúncios" ON anuncios FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin insere anúncios" ON anuncios;
CREATE POLICY "Admin insere anúncios" ON anuncios FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM perfis WHERE perfis.id = auth.uid() AND perfis.role = 'admin'
  )
);

DROP POLICY IF EXISTS "Admin atualiza anúncios" ON anuncios;
CREATE POLICY "Admin atualiza anúncios" ON anuncios FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM perfis WHERE perfis.id = auth.uid() AND perfis.role = 'admin'
  )
);

DROP POLICY IF EXISTS "Admin deleta anúncios" ON anuncios;
CREATE POLICY "Admin deleta anúncios" ON anuncios FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM perfis WHERE perfis.id = auth.uid() AND perfis.role = 'admin'
  )
);

-- ========================================================
-- ARMAZENAMENTO DE IMAGENS (SUPABASE STORAGE BUCKETS)
-- ========================================================
-- 1. Crie o bucket público 'desafios' no menu Storage do Supabase (Marcar: Public Bucket)
-- 2. Execute a política de leitura pública das imagens abaixo:

DROP POLICY IF EXISTS "Leitura pública de imagens no bucket desafios" ON storage.objects;
CREATE POLICY "Leitura pública de imagens no bucket desafios"
ON storage.objects FOR SELECT
USING (bucket_id = 'desafios');
```

## Sistema de Calibração de Pontuação (A "Fórmula do Acerto")

Como o jogo não é apenas "ganhou ou perdeu", a pontuação precisa ser justa e gratificante. Uma fórmula recomendada para o cálculo de pontos por partida (máximo de 5.000 pontos por dia, no estilo GeoGuessr):

$$ \text{Pontuação} = \max\left(0, 5000 - (\text{Erro em Anos} \times 150) - (\text{Dicas Usadas} \times 500) - (\text{Tempo em Segundos} \times 2)\right) $$

*   **Tolerância (Bullseye):** Errar por $\pm 1$ ano ainda concede 5.000 pontos (evita frustração por bobeira).
*   **Fator Tempo:** Desencoraja o jogador a pesquisar a resposta no Google em outra aba.

## Mecânica de "Edições Especiais" ou "Modo Infinito"

O desafio diário garante que a pessoa jogue 2 minutos por dia. Mas o que acontece quando o jogador quer continuar jogando?
*   **Modo Diário (Padrão):** 1 evento por dia (mantém a retenção diária e a escassez).
*   **Modo Prática / Arquivo:** Permite jogar desafios de dias anteriores (bloqueado ou liberado para quem faz login).
*   **Edições Temáticas (Futuro):** "Modo Hollywood" (só cinema), "Modo Jogos", "Modo Brasil", etc.
