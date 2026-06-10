-- Migration 002: Performance indexes

CREATE INDEX IF NOT EXISTS idx_perguntas_pesquisa_id ON perguntas(pesquisa_id);
CREATE INDEX IF NOT EXISTS idx_perguntas_ordenacao ON perguntas(pesquisa_id, ordenacao);
CREATE INDEX IF NOT EXISTS idx_entrevistados_pesquisa_id ON entrevistados(pesquisa_id);
CREATE INDEX IF NOT EXISTS idx_respostas_pesquisa_id ON respostas(pesquisa_id);
CREATE INDEX IF NOT EXISTS idx_respostas_pergunta_id ON respostas(pergunta_id);
CREATE INDEX IF NOT EXISTS idx_respostas_entrevistado_id ON respostas(entrevistado_id);
CREATE INDEX IF NOT EXISTS idx_auditoria_usuario_id ON auditoria(usuario_id);
CREATE INDEX IF NOT EXISTS idx_auditoria_entidade ON auditoria(entidade, entidade_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_telefone ON usuarios(telefone);
