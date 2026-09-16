---
name: Invoice numbering and validation
description: Rules for stable branch-scoped invoice numbers and printed validation codes.
---

Invoice numbers are allocated atomically per branch and stored on the document. Table-session validation codes are deterministic and calculated from the invoice number, session ID, closing date, final displayed total, restaurant ID, and branch ID.

**Why:** Order/session totals can change after creation through discounts, fees, or payment reconciliation; persisting a code from the initial total could make a later reprint validate against stale data. Including the restaurant and branch prevents the same document inputs from validating across tenants.

**How to apply:** Keep the invoice number immutable after allocation, use the session closing timestamp for a final table invoice, and always derive the validation code from the same current total shown on the document. Expose the document's verification path alongside the code.