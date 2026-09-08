---
name: Branch isolation
description: Active-branch data must not fall back to restaurant-wide records when showing operational data.
---

The active branch is an isolation boundary for operational data. Branch-scoped reads should select the active `branchId` only; records with `branchId = null` must not be treated as shared fallback data in menus, tables, orders, customers, services, coupons, visits, statistics, or reports.

**Why:** Showing shared or another branch's records makes branch switching look inconsistent and can expose or mix operational data.

**How to apply:** When adding a branch-scoped query or cache, require the active branch in the backend filter and clear/reset branch-scoped client queries when the active branch changes.