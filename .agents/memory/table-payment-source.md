---
name: Table payment source of truth
description: How table-session totals and payment status must be reconciled after checkout.
---

For complete table checkout, the recorded payment lives in `table_payments`, while guest subtotals may be stale or zero. Session totals must be recalculated from active session orders first, with guest subtotals only as a legacy fallback; the UI must include the session paid amount when determining whether the table is paid.

**Why:** A complete checkout could be recorded successfully while stale guest subtotals recalculated the session total to a small service fee, leaving the table visibly pending.

**How to apply:** Any new table-payment or table-status endpoint must preserve an existing valid total when order data is temporarily unavailable, reconcile `paid_amount` against recorded table payments after recalculation, and avoid requiring every guest to have an individual payment for a general table payment to count.

For cash-register reconciliation, every supported payment method (`dinheiro`, `multicaixa`, `transferencia`, and `cartao`) must be attached to the active register/shift and included in its balance and shift totals. The payment method check remains appropriate only for cash-specific validations such as change received.

**Why:** Restricting register updates and shift summaries to `dinheiro` made financial transactions visible in Financeiro but absent from the operational cash-register balance.

**How to apply:** When recording a sale, table payment, or refund, resolve the active register independently of payment method; when calculating an open or closing shift, aggregate all transactions linked to that shift.