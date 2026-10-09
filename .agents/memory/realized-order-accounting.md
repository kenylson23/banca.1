---
name: Realized-order accounting
description: Permanent inclusion rule for order-based sales revenue and financial reports.
---

Order-based realized-sales revenue and sales KPIs must include only orders whose current payment status is `pago`. Exclude `nao_pago` and `parcial` from sales revenue, average ticket, sold-product revenue, and financial sales summaries, including for historical dates. Evaluate the current payment status when reading data so old sessions and orders follow the same rule without destructive data rewrites.

Keep unpaid orders in operational order lists and table-session balances so they remain visible and collectible. Financial transaction reports are a separate source of truth for money actually received; recorded partial receipts remain valid cash-flow entries and must not be erased by this order-sales rule.

**Why:** The user explicitly set this as a permanent accounting rule and asked for it to apply to older sessions as well as future orders.

**How to apply:** Any new dashboard, report, export, or aggregate that derives realized sales from `orders` must filter for fully paid status. Preserve operational counts and pending balances outside financial sales metrics; use recorded transactions for actual-cash reporting.
