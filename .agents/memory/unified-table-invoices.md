---
name: Unified table invoices
description: Architectural rule for table-session invoice data and output formats.
---

All table-session invoice outputs should consume one assembled `TableInvoiceDocument` contract containing restaurant, branch, table, session, customer, guests, items, adjustments, payments, totals, and validation.

**Why:** Rebuilding totals and line items independently for browser print, thermal print, PDF, and screen display caused format drift and made payment/discount corrections inconsistent.

**How to apply:** Extend the server document builder when invoice data changes, including branch, cash-shift, operator, and session-lifecycle metadata, then keep visual, browser, thermal, and PDF renderers as consumers of that document instead of querying or recalculating session data independently. Persist invoice-recipient choices on the table session and keep the table's primary customer separate from the billed recipient.