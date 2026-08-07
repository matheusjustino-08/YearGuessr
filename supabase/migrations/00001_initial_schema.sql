-- Tabela de Desafios Diários (Com suporte i18n)
CREATE TABLE desafios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data_publicacao DATE UNIQUE NOT NULL,
  ano_correto INT NOT NULL,
  janela_anos INT[] NOT NULL, -- Ex: [1500, 2026]
  conteudo_i18n JSONB NOT NULL, -- Contém títulos e dicas em {"pt": {...}, "en": {...}}
  imagem_principal TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Perfis de Jogadores
CREATE TABLE perfis (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username VARCHAR(50) UNIQUE,
  avatar_url TEXT,
  idioma_preferido VARCHAR(10) DEFAULT 'pt-BR',
  e_anonimo BOOLEAN DEFAULT true,
  streak_atual INT DEFAULT 0,
  maior_streak INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Partidas/Resultados (Para Rankings)
CREATE TABLE partidas (
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

-- Habilitar RLS
ALTER TABLE partidas ENABLE ROW LEVEL SECURITY;
ALTER TABLE perfis ENABLE ROW LEVEL SECURITY;
ALTER TABLE desafios ENABLE ROW LEVEL SECURITY;

-- RLS (Row Level Security)
-- Usuários só conseguem registrar palpites vinculados à sua própria sessão
CREATE POLICY "Inserção de palpites própria sessão" ON partidas 
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Usuários podem ver seus próprios palpites
CREATE POLICY "Leitura de palpites próprios" ON partidas
FOR SELECT USING (auth.uid() = user_id);

-- Leitura pública apenas para a tabela de líderes (todos os usuários podem ler)
-- Mas podemos restringir campos futuramente, ou usar uma view
CREATE POLICY "Leitura pública do ranking" ON partidas 
FOR SELECT USING (true);

-- Perfis: Usuários podem ler qualquer perfil (para o ranking) e atualizar o seu próprio
CREATE POLICY "Leitura pública de perfis" ON perfis
FOR SELECT USING (true);

CREATE POLICY "Atualização do próprio perfil" ON perfis
FOR UPDATE USING (auth.uid() = id);

-- Desafios: Leitura pública dos desafios passados e atuais (baseado na data de publicação)
CREATE POLICY "Leitura de desafios" ON desafios
FOR SELECT USING (data_publicacao <= current_date);
