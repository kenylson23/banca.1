---
name: Legacy migration blockers
description: Existing startup migration failures unrelated to payment configuration.
---

Historical audit migrations must tolerate two schema generations: existing audit logs may use a different restaurant ID type than restaurants.id, and item audit timestamps may be named created_at or moved_at.

**Why:** These tables may already exist outside the migration ledger, so CREATE TABLE IF NOT EXISTS does not reconcile their columns before later constraints and indexes run.

**How to apply:** Align an existing audit foreign-key column with the referenced catalog type before adding the constraint; use NOT VALID when preserving legacy rows is more important than blocking startup, and choose timestamp indexes conditionally. Validate legacy constraints after data cleanup.