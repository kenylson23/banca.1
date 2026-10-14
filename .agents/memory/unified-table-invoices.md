---
name: Unified table invoices
description: Architectural rule for table-session invoice data and output formats.
---

All table-session invoice and receipt outputs should consume one assembled `TableInvoiceDocument` contract containing restaurant, branch, table, session, customer, guests, items, adjustments, payments, totals, and validation. Take issuer data from the restaurant attached to the session's table; reject session/table/restaurant/branch mismatches. When a caller knows the active table, verify the document's table and restaurant IDs before rendering or printing. Use the shared fiscal-details and completeness helpers consistently; a completeness result means required values are present, not that legal compliance was certified.

**Why:** Rebuilding totals and line items independently for browser print, thermal print, PDF, and screen display caused format drift and made payment/discount corrections inconsistent. Separate fiscal-field lists also caused configured NIF, VAT, contact, and series data to disappear from some invoice formats. A mismatched session can otherwise display another table's issuer, and operators need to see missing settings without confusing a presence check with legal validation.

**How to apply:** Extend the server document builder when invoice data changes, including branch, cash-shift, operator, and session-lifecycle metadata, then keep visual, browser, thermal, and PDF renderers as consumers of that document instead of querying or recalculating session data independently. Pass complete restaurant settings into order invoices too, and use the shared fiscal helpers rather than maintaining per-renderer field lists. Persist invoice-recipient choices on the table session and keep the table's primary customer separate from the billed recipient.

On mobile, opening a table invoice or receipt must not strand the operator in a top-level document viewer with no way back to table management.

**Why:** The operator otherwise has to close and reopen the app to return to the table.

**How to apply:** Keep document previews inside the table-management screen with a clear return control; treat printing or saving a file as a separate action.