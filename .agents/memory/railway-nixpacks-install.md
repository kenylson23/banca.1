---
name: Railway Nixpacks installation
description: Railway build-install behavior for this Node application
---

Railway deployments should declare an explicit Nixpacks install phase using `npm install --include=dev --no-audit --no-fund` instead of relying on automatic `npm ci`.

**Why:** The automatic Railway/Nixpacks `npm ci` path failed during image creation even though the lockfile matched `package.json` and the production build completed with `npm install`.

**How to apply:** Keep the committed Nixpacks install and build phases aligned with the Railway JSON/TOML configuration, and pin the deployment runtime to Node 20 LTS.