import { db } from "./db";
import { orders } from "@shared/schema";
import { sql, and, gte, eq } from "drizzle-orm";

/**
 * Gera um número de pedido único baseado no tipo e turno
 * Formato: M001, D023, B045
 * M = Mesa, D = Delivery, B = Balcão
 * Reinicia a cada turno (manhã, tarde, noite)
 */

type OrderType = "mesa" | "delivery" | "balcao";

// Define os turnos
function getCurrentShift(): { start: Date; end: Date; name: string } {
  const now = new Date();
  const hour = now.getHours();
  
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  
  if (hour >= 6 && hour < 14) {
    // Manhã: 06:00 - 14:00
    return {
      start: new Date(today.setHours(6, 0, 0, 0)),
      end: new Date(today.setHours(14, 0, 0, 0)),
      name: "manha"
    };
  } else if (hour >= 14 && hour < 22) {
    // Tarde: 14:00 - 22:00
    return {
      start: new Date(today.setHours(14, 0, 0, 0)),
      end: new Date(today.setHours(22, 0, 0, 0)),
      name: "tarde"
    };
  } else {
    // Noite: 22:00 - 06:00
    const nightStart = new Date(today);
    nightStart.setHours(22, 0, 0, 0);
    
    const nightEnd = new Date(today);
    if (hour < 6) {
      // Ainda é a noite de ontem
      nightStart.setDate(nightStart.getDate() - 1);
    } else {
      // Vai até amanhã de manhã
      nightEnd.setDate(nightEnd.getDate() + 1);
    }
    nightEnd.setHours(6, 0, 0, 0);
    
    return {
      start: nightStart,
      end: nightEnd,
      name: "noite"
    };
  }
}

// Prefixos por tipo de pedido
const ORDER_TYPE_PREFIX: Record<OrderType, string> = {
  mesa: "M",
  delivery: "D",
  balcao: "B"
};

/**
 * Gera o próximo número de pedido para o turno atual
 */
export async function generateOrderNumber(
  restaurantId: string,
  orderType: OrderType
): Promise<string> {
  const prefix = ORDER_TYPE_PREFIX[orderType];
  const shift = getCurrentShift();
  
  try {
    // Busca o último pedido do mesmo tipo neste turno
    const lastOrder = await db
      .select({ orderNumber: orders.orderNumber })
      .from(orders)
      .where(
        and(
          eq(orders.restaurantId, restaurantId),
          eq(orders.orderType, orderType),
          gte(orders.createdAt, shift.start)
        )
      )
      .orderBy(sql`${orders.createdAt} DESC`)
      .limit(1);
    
    let nextNumber = 1;
    
    if (lastOrder.length > 0 && lastOrder[0].orderNumber) {
      // Extrai o número do último pedido
      const lastNumber = parseInt(lastOrder[0].orderNumber.substring(1));
      if (!isNaN(lastNumber)) {
        nextNumber = lastNumber + 1;
      }
    }
    
    // Formata com zeros à esquerda (ex: M001, D023, B456)
    const formattedNumber = `${prefix}${nextNumber.toString().padStart(3, '0')}`;
    
    return formattedNumber;
  } catch (error) {
    console.error('Error generating order number:', error);
    // Fallback para um número aleatório
    const randomNum = Math.floor(Math.random() * 999) + 1;
    return `${prefix}${randomNum.toString().padStart(3, '0')}`;
  }
}

/**
 * Formata o número do pedido para exibição com contexto
 */
export function formatOrderDisplay(
  orderNumber: string,
  orderType: OrderType,
  tableNumber?: number
): string {
  const typeLabels: Record<OrderType, string> = {
    mesa: tableNumber ? `Mesa ${tableNumber}` : "Mesa",
    delivery: "Delivery",
    balcao: "Balcão"
  };
  
  return `${typeLabels[orderType]} - #${orderNumber}`;
}

/**
 * Obtém apenas o número curto (ex: "M001")
 */
export function getShortOrderNumber(orderNumber: string | null | undefined): string {
  if (!orderNumber) return "---";
  return orderNumber;
}
