---
name: Public order notification timing
description: Timing requirement for notifications created by public menu orders.
---

Public menu order creation must persist its `new_order` notification before returning the successful order response; notification failures should be logged without cancelling the order.

**Why:** Staff can open the notification dropdown immediately after a customer submits an order. A fire-and-forget insert can race the first notifications query and show an empty list.

**How to apply:** Keep the public order route awaiting the notification service with an error boundary. Preserve fire-and-forget behavior only for independent operational events where the response does not promise that the event is already visible.