---
name: Notification fan-out
description: In-app notifications are persisted per restaurant user so read state and preferences remain independent.
---

In-app operational notifications are fan-out records scoped to each restaurant user, with the WebSocket used only for delivery acceleration.

**Why:** A single restaurant-wide row makes one operator marking a notification read change the state for every other operator, and it cannot honor per-user notification preferences.

**How to apply:** Keep notification creation behind the notification service, apply the restaurant default plus user override before inserting, and treat database persistence as the source of truth when WebSocket delivery is unavailable.