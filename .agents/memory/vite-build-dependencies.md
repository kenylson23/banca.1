---
name: Vite build dependencies
description: Deployment dependency rule for plugins imported by the Vite configuration.
---

Any package statically imported by `vite.config.ts` must be declared in the production dependency set when the deployment runs `npm ci --omit=dev` before `npm run build`. Vite resolves the configuration before bundling, even if the plugin is only invoked in development.

**Why:** A Replit runtime-error plugin was present in the lockfile and local node_modules but absent from package.json, so Railway pruned it and failed before the application bundle was created.

**How to apply:** Keep statically imported Vite config plugins in `dependencies` (or convert the import to a build-safe conditional dynamic import), then validate with a clean `npm ci --omit=dev && npm run build`.