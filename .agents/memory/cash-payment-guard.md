---
name: Cash payment guard
description: Durable rule for preventing table payments from bypassing cash-shift validation.
---

The open-cash-shift rule must be enforced at the shared payment-writing boundary as well as in individual routes. Confirmation endpoints can bypass the normal cashier payment route and otherwise create payment records while the cash register is closed.

**Why:** A route-only guard missed manual confirmation of public table orders, allowing a payment to be recorded despite a closed shift.

**How to apply:** Resolve the table's branch, require an active register with an open shift for that branch, and return the exact business error as HTTP 409 before payment, totals, discounts, fees, or session mutations.