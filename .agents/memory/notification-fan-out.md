---
name: Notification fan-out
description: Delivery rules for restaurant notifications across users and WebSocket clients.
---

Persist notification rows independently for each eligible restaurant user, then send one restaurant-level cache invalidation event after persistence completes.

**Why:** A single failed recipient must not stop other users from receiving the notification, and broadcasting once per user creates duplicate toasts and can expose another user's row through real-time payloads.

**How to apply:** Treat the database rows as the source of truth. Use WebSocket only to accelerate refreshes, keep per-user preference checks on the server, and never depend on one recipient's insert or socket delivery succeeding for the rest.