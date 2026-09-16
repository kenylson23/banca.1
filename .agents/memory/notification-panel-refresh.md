---
name: Notification panel refresh
description: Client refresh behavior required for live admin notifications.
---

The notification count and list must override the app-wide infinite stale-time and disabled window-focus defaults with explicit refresh behavior.

**Why:** The admin panel can mount before an event arrives, and the WebSocket is only an acceleration layer. Without an explicit refresh on open and while visible, an initially empty cached result can remain visible.

**How to apply:** Keep a short polling fallback for the count and open list, refetch when the dropdown opens, and refetch on reconnect/focus. Use the database API as the authoritative source.