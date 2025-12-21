-- Adicionar coluna order_number à tabela orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_number VARCHAR(20);

-- Criar índice para melhor performance na busca por número
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);

-- Criar índice composto para geração de números por turno e restaurante
CREATE INDEX IF NOT EXISTS idx_orders_created_restaurant ON orders(restaurant_id, created_at DESC);

-- Comentário explicativo
COMMENT ON COLUMN orders.order_number IS 'Número de pedido legível (ex: M001, D023, B045) - Reinicia por turno';
