---
name: Invoice numbering and validation
description: Rules for stable branch-scoped invoice numbers and printed validation codes.
---

Invoice numbers are allocated atomically per branch and stored on the order. The validation code is deterministic but calculated at print time from the current invoice number, order ID, creation date, and current total.

**Why:** Order totals can change after creation through discounts, fees, or payment reconciliation; persisting a code from the initial total could make a later reprint validate against stale data.

**How to apply:** Keep the invoice number immutable after allocation, and always derive the validation code from the same current total shown on the document.