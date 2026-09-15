---
name: Post-merge setup
description: Reliability rule for the automatic setup that runs after task merges.
---

The post-merge hook must be non-interactive, idempotent, and able to complete dependency installation and the application build even when the development database is unavailable. Database migration failures should be reported clearly without preventing workflow reconciliation.

**Why:** The merge automation runs with stdin closed and this workspace's database environment can expose connection variables without providing a usable connection during the hook.

**How to apply:** Keep the hook on a configured script path, use non-interactive package commands, attempt migrations only when configured, and retain a successful build as the minimum completion condition.