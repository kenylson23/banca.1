---
name: Legacy customer linkage
description: Compatibility rules for older paid orders that store a phone but no customer foreign key.
---

Paid cashier orders can exist with `customerPhone` populated while `customerId` is null. Customer-facing totals and visit counts must resolve those legacy rows by normalized phone, and a later payment should persist the recovered link.

**Why:** The cashier and public-menu order paths historically handled customer association differently, so existing paid takeout orders were absent from customer metrics.

**How to apply:** Normalize Angola phone formats consistently, avoid matching blank phones, and prefer an existing `customerId` over any phone fallback.