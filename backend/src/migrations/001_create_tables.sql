-- Migration 001: Create base tables

CREATE TABLE IF NOT EXISTS usuarios (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  senha VARCHAR(255) NOT NULL,
  perfil VARCHAR(50) DEFAULT 'entrevistador',
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pesquisas (
  id SERIAL PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT,
  status VARCHAR(50) DEFAULT 'rascunho',
  margem_erro DECIMAL(5,2),
  nivel_confianca DECIMAL(5,2),
  tamanho_amostra INTEGER,
  populacao_alvo INTEGER,
  data_inicio DATE,
  data_fim DATE,
  created_by INTEGER REFERENCES usuarios(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS perguntas (
  id SERIAL PRIMARY KEY,
  pesquisa_id INTEGER REFERENCES pesquisas(id) ON DELETE CASCADE,
  tipo VARCHAR(50) NOT NULL,
  titulo TEXT NOT NULL,
  descricao TEXT,
  opcoes JSONB,
  ordenacao INTEGER DEFAULT 0,
  obrigatoria BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS entrevistados (
  id SERIAL PRIMARY KEY,
  pesquisa_id INTEGER REFERENCES pesquisas(id) ON DELETE CASCADE,
  nome VARCHAR(255),
  idade INTEGER,
  genero VARCHAR(50),
  cidade VARCHAR(255),
  estado VARCHAR(2),
  escolaridade VARCHAR(100),
  renda_familiar VARCHAR(100),
  ocupacao VARCHAR(255),
  zona_eleitoral VARCHAR(100),
  sessao_eleitoral VARCHAR(100),
  consentimento_lgpd BOOLEAN DEFAULT false,
  token_anonimizacao VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS respostas (
  id SERIAL PRIMARY KEY,
  pesquisa_id INTEGER REFERENCES pesquisas(id) ON DELETE CASCADE,
  pergunta_id INTEGER REFERENCES perguntas(id) ON DELETE CASCADE,
  entrevistado_id INTEGER REFERENCES entrevistados(id) ON DELETE CASCADE,
  resposta JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(pergunta_id, entrevistado_id)
);

CREATE TABLE IF NOT EXISTS auditoria (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER REFERENCES usuarios(id),
  acao VARCHAR(255) NOT NULL,
  entidade VARCHAR(100),
  entidade_id INTEGER,
  dados_antigos JSONB,
  dados_novos JSONB,
  ip VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);
