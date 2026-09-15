import { db } from "./db";
import { sql } from "drizzle-orm";

/**
 * The sequence scope is the branch when one exists. Orders created without a
 * branch (for example older public/table orders) use the restaurant scope.
 */
function getInvoiceSequenceScope(restaurantId: string, branchId?: string | null): string {
  return branchId ? `branch:${branchId}` : `restaurant:${restaurantId}`;
}

export async function allocateInvoiceNumber(
  restaurantId: string,
  branchId?: string | null,
): Promise<number> {
  const scopeKey = getInvoiceSequenceScope(restaurantId, branchId);
  const result = await db.execute(sql`
    INSERT INTO invoice_sequences (scope_key, restaurant_id, branch_id, next_number)
    VALUES (${scopeKey}, ${restaurantId}, ${branchId ?? null}, 2)
    ON CONFLICT (scope_key)
    DO UPDATE SET next_number = invoice_sequences.next_number + 1
    RETURNING next_number - 1 AS invoice_number
  `);

  const invoiceNumber = Number((result.rows?.[0] as { invoice_number?: number | string } | undefined)?.invoice_number);
  if (!Number.isInteger(invoiceNumber) || invoiceNumber < 1) {
    throw new Error("Não foi possível reservar o número da fatura");
  }

  return invoiceNumber;
}

/**
 * Session invoices share the same branch-scoped sequence as order invoices.
 * This keeps every financial document reference unique within a branch while
 * allowing a table session to have one stable number across reprints.
 */
export async function allocateTableSessionInvoiceNumber(
  restaurantId: string,
  branchId?: string | null,
): Promise<number> {
  return allocateInvoiceNumber(restaurantId, branchId);
}