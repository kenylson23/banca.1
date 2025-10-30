-- Script para corrigir slugs nulos ou duplicados em restaurantes existentes
-- Execute este script antes de aplicar a migração do schema

-- Atualizar restaurantes sem slug com base no nome
-- Função para gerar slug básico
CREATE OR REPLACE FUNCTION generate_basic_slug(name TEXT) RETURNS TEXT AS $$
BEGIN
  RETURN lower(
    regexp_replace(
      regexp_replace(
        unaccent(name),
        '[^a-z0-9]+', '-', 'g'
      ),
      '^-+|-+$', '', 'g'
    )
  );
END;
$$ LANGUAGE plpgsql;

-- Atualizar cada restaurante sem slug
DO $$
DECLARE
  r RECORD;
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER;
BEGIN
  FOR r IN SELECT id, name FROM restaurants WHERE slug IS NULL ORDER BY created_at
  LOOP
    base_slug := generate_basic_slug(r.name);
    final_slug := base_slug;
    counter := 1;
    
    -- Encontrar um slug único
    WHILE EXISTS (SELECT 1 FROM restaurants WHERE slug = final_slug AND id != r.id) LOOP
      final_slug := base_slug || '-' || counter;
      counter := counter + 1;
    END LOOP;
    
    -- Atualizar o restaurante
    UPDATE restaurants SET slug = final_slug WHERE id = r.id;
    RAISE NOTICE 'Restaurante % atualizado com slug: %', r.name, final_slug;
  END LOOP;
END $$;

-- Remover a função temporária
DROP FUNCTION IF EXISTS generate_basic_slug;

-- Verificar se ainda há slugs nulos
SELECT id, name, slug FROM restaurants WHERE slug IS NULL;

-- Verificar se há slugs duplicados
SELECT slug, COUNT(*) as count 
FROM restaurants 
WHERE slug IS NOT NULL 
GROUP BY slug 
HAVING COUNT(*) > 1;
