---
name: Anonymous auth requests
description: Handling expected unauthenticated auth lookups in the frontend.
---

Expected unauthenticated requests should resolve to an anonymous state instead of being treated as application errors.

**Why:** Public entry points can load before a user signs in, so a 401 from the current-user endpoint is a normal state and should not create an error in the browser console.

**How to apply:** Use the query client's non-throwing 401 behavior specifically for current-user/session bootstrap queries; keep throwing behavior for protected data requests.