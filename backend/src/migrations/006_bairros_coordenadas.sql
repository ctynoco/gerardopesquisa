CREATE TABLE IF NOT EXISTS bairros_coordenadas (
  id SERIAL PRIMARY KEY,
  bairro VARCHAR(255) NOT NULL,
  cidade VARCHAR(255) NOT NULL DEFAULT '',
  estado VARCHAR(2) NOT NULL DEFAULT 'CE',
  latitude DECIMAL(10,7),
  longitude DECIMAL(10,7),
  UNIQUE(bairro, cidade, estado)
);

INSERT INTO bairros_coordenadas (bairro, cidade, estado, latitude, longitude) VALUES
  ('Centro', 'Maracanaú', 'CE', -3.8770000, -38.6250000),
  ('Conjunto Industrial', 'Maracanaú', 'CE', -3.8580000, -38.6180000),
  ('Jereissati I', 'Maracanaú', 'CE', -3.8710000, -38.6330000),
  ('Jereissati II', 'Maracanaú', 'CE', -3.8790000, -38.6400000),
  ('Pajuçara', 'Maracanaú', 'CE', -3.8520000, -38.6080000),
  ('Alto da Mangueira', 'Maracanaú', 'CE', -3.8660000, -38.6220000),
  ('Novo Maracanaú', 'Maracanaú', 'CE', -3.8850000, -38.6450000),
  ('Mucunã', 'Maracanaú', 'CE', -3.8610000, -38.6120000),
  ('Pirangi', 'Maracanaú', 'CE', -3.8920000, -38.6500000),
  ('Sapupara', 'Maracanaú', 'CE', -3.8690000, -38.6300000),
  ('Siqueira', 'Maracanaú', 'CE', -3.8830000, -38.6280000),
  ('Timbó', 'Maracanaú', 'CE', -3.8750000, -38.6350000),
  ('Vila São João', 'Maracanaú', 'CE', -3.8780000, -38.6180000),
  ('Boqueirão', 'Maracanaú', 'CE', -3.8640000, -38.6050000),
  ('São Miguel', 'Maracanaú', 'CE', -3.8900000, -38.6420000)
ON CONFLICT (bairro, cidade, estado) DO NOTHING;
