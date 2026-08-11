import fs from 'fs';
const contents = fs.readFileSync('server/storage.ts', 'utf8');
const interfaceLine = contents.indexOf('export interface IStorage {');
const insertPosI = contents.indexOf('\n', interfaceLine) + 1;
let newContents = contents.slice(0, insertPosI) + '  recalculateSessionTotals(sessionId: string): Promise<any>;\n' + contents.slice(insertPosI);

const classLine = newContents.indexOf('export class DatabaseStorage implements IStorage {');
const insertPosC = newContents.indexOf('\n', classLine) + 1;
newContents = newContents.slice(0, insertPosC) + `
  async recalculateSessionTotals(sessionId: string): Promise<any> {
    const session = await this.getSessionById(sessionId);
    if (!session) {
      return null;
    }

    const guests = await this.getTableGuests(sessionId);
    const sessionOrders = await this.getOrdersBySessionId(session.restaurantId, sessionId);
    const ordersSubtotal = sessionOrders
      .filter((order: any) => order.status !== 'cancelado')
      .reduce((sum: number, order: any) => {
        const storedTotal = parseFloat(order.totalAmount || '0');
        if (storedTotal > 0) return sum + storedTotal;
        return sum + (order.orderItems || []).reduce((itemSum: number, item: any) => {
          const price = parseFloat(item.price || item.menuItem?.price || '0');
          return itemSum + price * Number(item.quantity || 0);
        }, 0);
      }, 0);

    const sessionDiscount = parseFloat(session.discount || '0');
    const sessionDiscountType = session.discountType || 'valor';
    const sessionServiceCharge = parseFloat(session.serviceCharge || '0');
    const sessionServiceChargeType = session.serviceChargeType || 'percentual';

    const guestsSubtotal = guests.reduce((sum: any, g: any) => {
      return sum + parseFloat(g.subtotal || '0');
    }, 0);
    const subtotalBeforeAdjustments = ordersSubtotal > 0 ? ordersSubtotal : guestsSubtotal;

    let totalAmountAdjusted = subtotalBeforeAdjustments;

    if (sessionDiscount > 0) {
      totalAmountAdjusted = sessionDiscountType === 'percentual'
        ? totalAmountAdjusted * (1 - Math.min(sessionDiscount, 100) / 100)
        : Math.max(0, totalAmountAdjusted - sessionDiscount);
    }

    if (sessionServiceCharge > 0) {
      totalAmountAdjusted = sessionServiceChargeType === 'percentual'
        ? totalAmountAdjusted * (1 + sessionServiceCharge / 100)
        : totalAmountAdjusted + sessionServiceCharge;
    }

    const hasGuestAdjustments = guests.some((g: any) => {
      const d = parseFloat(g.discount || '0');
      const s = parseFloat(g.serviceCharge || '0');
      return (Number.isFinite(d) && d > 0) || (Number.isFinite(s) && s > 0);
    });

    if (hasGuestAdjustments) {
      totalAmountAdjusted = guests.reduce((sum: number, g: any) => {
        let adjusted = parseFloat(g.subtotal || '0');
        const gDiscount = parseFloat(g.discount || '0');
        const gDiscountType = g.discountType || 'valor';
        const gServiceCharge = parseFloat(g.serviceCharge || '0');
        const gServiceChargeType = g.serviceChargeType || 'valor';

        if (gDiscount > 0) {
          adjusted = gDiscountType === 'percentual'
            ? adjusted * (1 - Math.min(gDiscount, 100) / 100)
            : Math.max(0, adjusted - gDiscount);
        }

        if (gServiceCharge > 0) {
          adjusted = gServiceChargeType === 'percentual'
            ? adjusted * (1 + gServiceCharge / 100)
            : adjusted + gServiceCharge;
        }

        return sum + adjusted;
      }, 0);
    }

    const { db } = require('./db');
    const { tablePayments, tableSessions } = require('@shared/schema');
    const { eq } = require('drizzle-orm');

    const payments = await db.select()
      .from(tablePayments)
      .where(eq(tablePayments.sessionId, sessionId));

    const totalPaidFromPayments = payments.reduce(
      (sum: number, payment: any) => sum + parseFloat(payment.amount || '0'),
      0
    );

    await db.update(tableSessions)
      .set({
        totalAmount: totalAmountAdjusted.toFixed(2),
        paidAmount: totalPaidFromPayments.toFixed(2),
      })
      .where(eq(tableSessions.id, sessionId));

    return {
      sessionId,
      totalAmount: totalAmountAdjusted.toFixed(2),
      paidAmount: totalPaidFromPayments.toFixed(2),
      pendingAmount: Math.max(0, totalAmountAdjusted - totalPaidFromPayments).toFixed(2),
    };
  }
` + newContents.slice(insertPosC);

fs.writeFileSync('server/storage.ts', newContents);
