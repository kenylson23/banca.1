---
name: Node runtime path compatibility
description: Node version compatibility for ESM path resolution in Railway deployments
---

Deployable ESM code must not assume `import.meta.dirname` exists, because Railway may select Node 18 even when local development uses a newer Node release. Use `fileURLToPath(import.meta.url)` with `path.dirname` for portable path resolution.

**Why:** On Node 18, `import.meta.dirname` is undefined; passing it to `path.resolve` causes `ERR_INVALID_ARG_TYPE` during module loading, before the application can start.

**How to apply:** When adding path-based ESM code used by the production bundle, use the `fileURLToPath` pattern and verify the generated bundle starts on the deployment runtime.