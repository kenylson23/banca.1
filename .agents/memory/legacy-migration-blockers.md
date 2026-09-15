---
name: Legacy migration blockers
description: Existing startup migration failures unrelated to payment configuration.
---

The startup migration runner still reports two historical schema mismatches: the audit-log migration expects a restaurant foreign key type that does not match the current restaurants table, and the order-item audit migration references a missing moved_at column.

**Why:** These failures predate the restaurant payment-method work and can obscure whether newer migrations succeeded; the runner continues and applies compatible migrations.

**How to apply:** Treat successful newer migrations and these legacy errors separately. Do not rewrite the historical migrations as part of unrelated feature work; investigate them in a dedicated schema-maintenance task.