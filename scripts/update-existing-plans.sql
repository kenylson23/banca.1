-- Script para atualizar planos existentes com as flags de features
-- Execute este script no banco de dados de PRODUÇÃO para atualizar os planos
-- sem perder dados existentes de restaurantes e assinaturas

-- ============================================================================
-- IMPORTANTE: Faça backup do banco antes de executar!
-- ============================================================================

-- Atualizar Plano Básico
UPDATE subscription_plans
SET 
  max_customers = 50,
  has_loyalty_program = 0,
  max_active_coupons = 0,
  has_coupon_system = 0,
  has_expense_tracking = 0,
  max_expense_categories = 0,
  has_inventory_module = 0,
  max_inventory_items = 0,
  has_stock_transfers = 0
WHERE slug = 'basico';

-- Atualizar Plano Profissional
UPDATE subscription_plans
SET 
  max_customers = 200,
  has_loyalty_program = 1,
  max_active_coupons = 50,
  has_coupon_system = 1,
  has_expense_tracking = 1,
  max_expense_categories = 50,
  has_inventory_module = 0,
  max_inventory_items = 0,
  has_stock_transfers = 0
WHERE slug = 'profissional';

-- Atualizar Plano Empresarial
UPDATE subscription_plans
SET 
  max_customers = 1000,
  has_loyalty_program = 1,
  max_active_coupons = 200,
  has_coupon_system = 1,
  has_expense_tracking = 1,
  max_expense_categories = 200,
  has_inventory_module = 1,
  max_inventory_items = 5000,
  has_stock_transfers = 1
WHERE slug = 'empresarial';

-- Atualizar Plano Enterprise
UPDATE subscription_plans
SET 
  max_customers = 999999,
  has_loyalty_program = 1,
  max_active_coupons = 999999,
  has_coupon_system = 1,
  has_expense_tracking = 1,
  max_expense_categories = 999999,
  has_inventory_module = 1,
  max_inventory_items = 999999,
  has_stock_transfers = 1
WHERE slug = 'enterprise';

-- Verificar os resultados
SELECT 
  name,
  slug,
  max_customers,
  has_loyalty_program,
  has_coupon_system,
  has_expense_tracking,
  has_inventory_module,
  has_stock_transfers
FROM subscription_plans
ORDER BY display_order;
