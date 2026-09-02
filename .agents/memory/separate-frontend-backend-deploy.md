---
name: Separate frontend/backend deployment
description: Constraints for deploying this app's React frontend and Express API on different public domains.
---

The frontend and API must share one configurable public base URL for every API request and WebSocket connection. Cross-origin session cookies require an explicit CORS allowlist plus `SameSite=None; Secure` in production.

**Why:** Relative API calls and default `SameSite=Lax` cookies work locally but fail when Vercel and Railway use different domains.

**How to apply:** Keep the frontend URL in a public `VITE_API_URL` build variable, set the frontend origin in Railway's `CORS_ORIGINS`, and verify `/api/health`, login, session persistence, and `/ws` after both services are deployed.