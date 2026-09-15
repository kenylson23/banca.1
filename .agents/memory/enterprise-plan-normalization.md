---
name: Enterprise plan normalization
description: Stable Enterprise detection across legacy subscription shapes.
---

Enterprise access must recognize the canonical `enterprise` identifier, legacy names containing Enterprise, and the `tudo_ilimitado` marker when identifiers are missing or non-specific. Explicit lower-tier identifiers such as `basico`, `profissional`, and `empresarial` must continue to use their own feature and limit rules.

**Why:** Subscription rows and cached responses can preserve older name/slug/feature formats after a plan change. Relying on only one field can make a valid Enterprise restaurant appear blocked, while an unconditional unlimited-feature fallback could accidentally unlock Empresarial.

**How to apply:** Keep the frontend feature guard and backend plan-limit check aligned. Treat known lower-tier identifiers as authoritative; use the unlimited marker only as a fallback for legacy or incomplete Enterprise data.

Legacy Enterprise rows must be repaired as a complete plan definition: feature list, unlimited resource limits, and module flags. Updating only `features` leaves direct flag checks and subscription usage screens inconsistent for existing subscriptions.

**Why:** Existing subscriptions reference the persisted plan row, so stale columns continue to affect access even when Enterprise is recognized by name or slug.

**How to apply:** Run the complete Enterprise repair during database initialization and keep the seed definition aligned with it; never include the separate `empresarial` slug in that repair.