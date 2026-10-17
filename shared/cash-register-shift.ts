export type CashRegisterMovement = {
  shiftId?: string | null;
  type: string;
  amount: string | number;
  description?: string | null;
};

export type CashRegisterShiftSnapshot = {
  id: string;
  status: string;
  openedAt?: Date | string | null;
  openingAmount: string | number;
  closingAmountExpected?: string | number | null;
  closingAmountCounted?: string | number | null;
};

export type CashRegisterShiftTotals = {
  totalRevenues: string;
  totalExpenses: string;
  totalAdjustments: string;
  closingAmountExpected: string;
};

function amountToCents(amount: string | number): number {
  const value = typeof amount === 'number' ? amount : Number.parseFloat(amount);
  if (!Number.isFinite(value)) {
    throw new Error(`Invalid cash-register amount: ${String(amount)}`);
  }
  return Math.round(value * 100);
}

function centsToAmount(cents: number): string {
  return (cents / 100).toFixed(2);
}

function isOpeningBalanceMovement(movement: CashRegisterMovement): boolean {
  return movement.type === 'ajuste'
    && (movement.description || '').trim().toLocaleLowerCase('pt-BR') === 'abertura do caixa';
}

export function calculateExpectedCashBalance(
  openingAmount: string | number,
  totalRevenues: string | number,
  totalExpenses: string | number,
  totalAdjustments: string | number = 0,
): string {
  const expectedCents = amountToCents(openingAmount)
    + amountToCents(totalRevenues)
    - amountToCents(totalExpenses)
    + amountToCents(totalAdjustments);

  return centsToAmount(expectedCents);
}

export function calculateCashRegisterShiftTotals(
  openingAmount: string | number,
  movements: CashRegisterMovement[],
): CashRegisterShiftTotals {
  let revenueCents = 0;
  let expenseCents = 0;
  let adjustmentCents = 0;

  for (const movement of movements) {
    if (isOpeningBalanceMovement(movement)) continue;

    const amountCents = amountToCents(movement.amount);
    if (movement.type === 'receita') revenueCents += amountCents;
    if (movement.type === 'despesa') expenseCents += amountCents;
    if (movement.type === 'ajuste') adjustmentCents += amountCents;
  }

  return {
    totalRevenues: centsToAmount(revenueCents),
    totalExpenses: centsToAmount(expenseCents),
    totalAdjustments: centsToAmount(adjustmentCents),
    closingAmountExpected: calculateExpectedCashBalance(
      openingAmount,
      revenueCents / 100,
      expenseCents / 100,
      adjustmentCents / 100,
    ),
  };
}

export function calculateCashRegisterDifference(
  countedAmount: string | number,
  expectedAmount: string | number,
): string {
  return centsToAmount(amountToCents(countedAmount) - amountToCents(expectedAmount));
}

function openedAtMillis(shift: CashRegisterShiftSnapshot): number {
  if (!shift.openedAt) return 0;
  const timestamp = new Date(shift.openedAt).getTime();
  return Number.isFinite(timestamp) ? timestamp : 0;
}

export function calculateCashRegisterCurrentBalance(
  initialBalance: string | number,
  shifts: CashRegisterShiftSnapshot[],
  movements: CashRegisterMovement[],
): string {
  const newestFirst = [...shifts].sort((a, b) => openedAtMillis(b) - openedAtMillis(a));
  const activeShift = newestFirst.find((shift) => shift.status === 'aberto');

  if (activeShift) {
    const activeMovements = movements.filter((movement) => movement.shiftId === activeShift.id);
    return calculateCashRegisterShiftTotals(activeShift.openingAmount, activeMovements).closingAmountExpected;
  }

  const latestShift = newestFirst[0];
  if (latestShift) {
    const closingBalance = latestShift.closingAmountCounted ?? latestShift.closingAmountExpected;
    return closingBalance == null ? centsToAmount(amountToCents(initialBalance)) : centsToAmount(amountToCents(closingBalance));
  }

  return calculateCashRegisterShiftTotals(initialBalance, movements).closingAmountExpected;
}
