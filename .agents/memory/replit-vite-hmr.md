---
name: Replit Vite HMR proxy
description: Development WebSocket behavior when Vite runs behind the Replit preview proxy.
---

The Replit preview proxy may not reliably forward the Vite development WebSocket from a middleware-mode server.

**Why:** Invalid or failed HMR handshakes repeatedly pollute the browser console even while the application itself renders correctly.

**How to apply:** Prefer the project's stable preview behavior over HMR when the proxy produces repeated WebSocket failures; restart the workflow after code changes.