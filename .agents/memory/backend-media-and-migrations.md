---
name: Backend media and migration ordering
description: Production constraints for uploaded files and automatic PostgreSQL migrations in split deployments.
---

Uploaded images must be owned and served by the API service when the frontend is deployed separately; frontend-relative media paths are not enough. Local service filesystems may still be ephemeral, so persistence requires a volume or object storage.

**Why:** Moving the frontend to Vercel makes `client/public/uploads` unavailable as the runtime owner of new media, and automatic migration discovery can run files alphabetically even when one migration references a table or column created later.

**How to apply:** Keep upload URLs rooted at the backend, preserve a legacy read path during migration, configure persistent storage before relying on uploads, and make each SQL migration idempotent while checking actual snake_case schema names and dependency order. In bundled ESM production builds, resolve migration files from the project source path as well as beside the compiled entrypoint because `__dirname` points into `dist`.