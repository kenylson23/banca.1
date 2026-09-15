---
name: Unified table invoices
description: Architectural rule for table-session invoice data and output formats.
---

All table-session invoice outputs should consume one assembled `TableInvoiceDocument` contract containing restaurant, branch, table, session, customer, guests, items, adjustments, payments, totals, and validation.

**Why:** Rebuilding totals and line items independently for browser print, thermal print, PDF, and screen display caused format drift and made payment/discount corrections inconsistent.

**How to apply:** Extend the server document builder when invoice data changes, then keep visual, browser, thermal, and PDF renderers as consumers of that document instead of querying or recalculating session data independently.