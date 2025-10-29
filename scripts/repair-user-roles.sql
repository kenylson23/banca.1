-- Script para reparar roles de usuários no banco de dados
-- Execute este script se detectar usuários sem role definido
-- 
-- ⚠️ IMPORTANTE: Este script NÃO faz alterações automáticas
-- Ele apenas MOSTRA os usuários com problemas para que você possa corrigir manualmente
-- Isso evita escalação acidental de privilégios (kitchen → admin)

-- ========================================
-- PASSO 1: Identificar usuários com problemas
-- ========================================

SELECT 
  id, 
  email, 
  restaurant_id,
  role,
  first_name || ' ' || last_name as name,
  created_at
FROM users 
WHERE role IS NULL
ORDER BY created_at;

-- ========================================
-- PASSO 2: Identificar o super admin específico
-- ========================================

SELECT id, email, restaurant_id, role 
FROM users 
WHERE email = 'superadmin@nabancada.com';

-- ========================================
-- PASSO 3: Corrigir MANUALMENTE cada usuário
-- ========================================

-- Para o SUPER ADMIN específico:
-- UPDATE users SET role = 'superadmin' WHERE email = 'superadmin@nabancada.com';

-- Para um ADMIN específico (substitua <USER_EMAIL> pelo email real):
-- UPDATE users SET role = 'admin' WHERE email = '<USER_EMAIL>';

-- Para um KITCHEN staff específico (substitua <USER_EMAIL> pelo email real):
-- UPDATE users SET role = 'kitchen' WHERE email = '<USER_EMAIL>';

-- ⚠️ NÃO USE "WHERE role IS NULL AND restaurant_id IS NOT NULL"
-- Isso pode promover kitchen staff para admin inadvertidamente!
-- Kitchen staff TAMBÉM tem restaurant_id, então esse critério é INSEGURO

-- ========================================
-- PASSO 4: Verificação final
-- ========================================

-- Não deve retornar nenhum resultado:
SELECT id, email, restaurant_id, role 
FROM users 
WHERE role IS NULL;

-- ========================================
-- PASSO 5: Estatísticas
-- ========================================

SELECT 
  role, 
  COUNT(*) as count 
FROM users 
GROUP BY role 
ORDER BY role;

-- ========================================
-- EXEMPLO PRÁTICO DE CORREÇÃO SEGURA:
-- ========================================
--
-- 1. Execute o PASSO 1 para ver os usuários sem role
-- 2. Para cada usuário, PERGUNTE ao dono do sistema qual é o role correto
-- 3. Execute o UPDATE específico com o EMAIL do usuário:
--
--    UPDATE users SET role = 'admin' WHERE email = 'joao@restaurante.com';
--    UPDATE users SET role = 'kitchen' WHERE email = 'cozinha@restaurante.com';
--
-- 4. Execute o PASSO 4 para confirmar que não há mais usuários sem role
