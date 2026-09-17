---
name: PDV error messages
description: UI rule for preserving actionable server errors in operational workflows.
---

PDV mutation error alerts should display the message returned by the server, especially for business-rule failures such as a closed cash-register shift. Use a specific title only when the error is recognizable, while keeping the server message as the description.

**Why:** The closed-shift rule was working on the server, but the order dialog discarded the 409 message and showed only a generic failure alert.

**How to apply:** When adding or changing payment/order mutations, pass the mutation error into the toast handler and preserve its `message` rather than replacing it with a fixed generic description.