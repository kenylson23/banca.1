---
name: Separate frontend/backend deployment
description: Constraints for deploying this app's React frontend and Express API on different public domains.
---

When the frontend and API use separate public domains, they must share one configurable API base URL for every API request and WebSocket connection. Cross-origin session cookies require an explicit CORS allowlist plus `SameSite=None; Secure` in production. Lockfiles generated inside Replit may also need public npm tarball URLs before Railway can install them.

**Why:** Relative API calls and default `SameSite=Lax` cookies work locally but fail when Vercel and Railway use different domains; Replit's internal package proxy is not resolvable in a Railway build, and Nixpacks cache mounts can make `npm ci` fail while removing `node_modules/.cache`.

**How to apply:** For a Railway-only deployment, leave `VITE_API_URL` unset so relative URLs stay same-origin and enable static serving. For a separate Vercel frontend, set `VITE_API_URL` and `CORS_ORIGINS` to the corresponding public URLs. Use `npm install --registry=https://registry.npmjs.org/` for Railway and verify `/api/health`, login, session persistence, and `/ws`.