---
name: Imported Node dependency setup
description: Replit package installation behavior for imported Node projects whose manifest should remain unchanged
---

When setting up an imported Node project without intentionally upgrading dependencies, preserve the repository's tracked package manifests after installing dependencies.

**Why:** The managed package installer can resolve caret ranges to newer releases and rewrite `package.json` and `package-lock.json`, creating unrelated dependency upgrades during a setup-only task.

**How to apply:** Install the declared dependencies so the workflow can run, then check the working tree and restore manifest/build-artifact changes that were caused only by installation. Keep the installed `node_modules` for the active workflow.

Deployment builds may not reach Replit's internal package firewall host. If a lockfile contains `package-firewall.replit.internal` tarball URLs, normalize those `resolved` URLs to the public npm registry without changing dependency versions or integrity hashes before relying on external `npm ci`.

**Why:** The Replit workspace can install those URLs locally, while an external deployment builder fails with a DNS/network error.

**How to apply:** Search the lockfile for `replit.internal` after setup and ensure no internal tarball URL remains; then validate with a clean `npm ci` using the public registry and run the production build.