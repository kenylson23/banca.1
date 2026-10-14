---
name: Unified table invoices
description: Architectural rule for table-session invoice data and output formats.
---

All table-session invoice and receipt outputs should consume one assembled `TableInvoiceDocument` contract containing restaurant, branch, table, session, customer, guests, items, adjustments, payments, totals, and validation. Take issuer data from the restaurant attached to the session's table; reject session/table/restaurant/branch mismatches. When a caller knows the active table, verify the document's table and restaurant IDs before rendering or printing. Use the shared fiscal-details and completeness helpers consistently; a completeness result means required values are present, not that legal compliance was certified.

**Why:** Rebuilding totals and line items independently for browser print, thermal print, PDF, and screen display caused format drift and made payment/discount corrections inconsistent. Separate fiscal-field lists also caused configured NIF, VAT, contact, and series data to disappear from some invoice formats. A mismatched session can otherwise display another table's issuer, and operators need to see missing settings without confusing a presence check with legal validation. The user also expects the full-checkout success dialog to receive the same fiscal details and complete invoice data as the final-invoice tab.

**How to apply:** Extend the server document builder when invoice data changes, including branch, cash-shift, operator, and session-lifecycle metadata, then keep visual, browser, thermal, and PDF renderers as consumers of that document instead of querying or recalculating session data independently. Pass the validated document from full checkout into the payment-success dialog so it does not depend on reconstructing session identity from payment response fields. Pass complete restaurant settings into order invoices too, and use the shared fiscal helpers rather than maintaining per-renderer field lists. Persist invoice-recipient choices on the table session and keep the table's primary customer separate from the billed recipient.

Payment-receipt print layouts should be compact without dropping fiscal fields, product details, payment information, or other document data.

**Why:** The user requested a shorter payment receipt while explicitly requiring all fiscal and product information to remain.

**How to apply:** Reduce print margins, blank lines, and section spacing before considering removal of any content; preserve all source fields and calculations unless the user approves a content change.

When operators open a table invoice or payment receipt, show the document in a separate browser tab rather than an embedded app preview. Keep a clear link back to table management; printing remains a separate action.

**Why:** The user explicitly requested browser-based invoice and receipt viewing instead of opening documents inside the app.

**How to apply:** Open the rendered document directly from the user action so popup blockers do not prevent it, include a return link where appropriate, and do not start printing just to view a document.