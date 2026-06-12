ALTER TABLE entrevistados ADD COLUMN IF NOT EXISTS entrevistador_id INTEGER REFERENCES usuarios(id);

CREATE INDEX IF NOT EXISTS idx_entrevistados_entrevistador_id ON entrevistados(entrevistador_id);
