-- Migration 003: Replace email with telefone in usuarios

ALTER TABLE usuarios DROP COLUMN IF EXISTS email;
ALTER TABLE usuarios ADD COLUMN telefone VARCHAR(20) UNIQUE NOT NULL DEFAULT '';
ALTER TABLE usuarios ALTER COLUMN telefone DROP DEFAULT;

DROP INDEX IF EXISTS idx_usuarios_email;
CREATE UNIQUE INDEX IF NOT EXISTS idx_usuarios_telefone ON usuarios(telefone);
