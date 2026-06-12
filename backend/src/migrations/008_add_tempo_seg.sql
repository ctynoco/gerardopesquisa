ALTER TABLE respostas ADD COLUMN IF NOT EXISTS tempo_seg INTEGER DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_respostas_tempo_seg ON respostas(tempo_seg);