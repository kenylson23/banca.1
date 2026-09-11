---
name: Enterprise plan normalization
description: Stable Enterprise detection across legacy subscription shapes.
---

Enterprise access must recognize the canonical `enterprise` identifier, legacy names containing Enterprise, and the `tudo_ilimitado` marker when identifiers are missing or non-specific. Explicit lower-tier identifiers such as `basico`, `profissional`, and `empresarial` must continue to use their own feature and limit rules.

**Why:** Subscription rows and cached responses can preserve older name/slug/feature formats after a plan change. Relying on only one field can make a valid Enterprise restaurant appear blocked, while an unconditional unlimited-feature fallback could accidentally unlock Empresarial.

**How to apply:** Keep the frontend feature guard and backend plan-limit check aligned. Treat known lower-tier identifiers as authoritative; use the unlimited marker only as a fallback for legacy or incomplete Enterprise data.