---
name: Notification preference schema
description: Compatibility rule for legacy notification preference tables.
---

The runtime notification preference model includes one column per notification type. Older databases may only have `payment_enabled` and a partial set of type columns, which can make every preference query fail before notifications are persisted.

**Why:** Notification fan-out catches recipient persistence errors and the UI then looks simply empty, hiding the underlying schema mismatch.

**How to apply:** Any notification schema expansion must include an idempotent migration for existing databases and update the startup table definition for new databases. Preserve old preference values when renaming or splitting a column.