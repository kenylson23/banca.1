---
name: Cash payment guard
description: Durable rule for preventing table payments from bypassing cash-shift validation.
---

The open-cash-shift rule must be enforced at the shared payment-writing boundary as well as in individual routes. It applies to operational table and counter/PDV orders, including orders submitted through the public menu, regardless of whether the operator is a cashier, manager, administrator, or anonymous customer. Confirmation endpoints can bypass the normal cashier payment route and otherwise create payment records while the cash register is closed.

**Why:** A route-only guard missed manual confirmation of public table orders, and a role-only guard allowed manager/admin PDV orders to bypass the cash-register check.

**How to apply:** Resolve the table's branch or the order's branch from its menu items, require an active register with an open shift for that branch, and return the business error as HTTP 409 before payment, totals, discounts, fees, loyalty redemption, order creation, or session mutations.