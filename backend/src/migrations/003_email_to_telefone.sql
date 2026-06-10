-- Migration 003: Replace email with telefone in usuarios

ALTER TABLE usuarios DROP COLUMN IF EXISTS email;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS telefone VARCHAR(20) NOT NULL DEFAULT '';

UPDATE usuarios SET telefone = 'temp_' || id WHERE telefone IS NULL OR telefone = '';

ALTER TABLE usuarios DROP CONSTRAINT IF EXISTS usuarios_telefone_key;
ALTER TABLE usuarios ADD CONSTRAINT usuarios_telefone_key UNIQUE (telefone);

ALTER TABLE usuarios ALTER COLUMN telefone DROP DEFAULT;

DROP INDEX IF EXISTS idx_usuarios_email;
