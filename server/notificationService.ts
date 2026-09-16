import { storage } from './storage';
import type { InsertNotification, Notification, NotificationPreferences } from '@shared/schema';

export type RestaurantNotificationType =
  | 'new_order'
  | 'order_status'
  | 'order_cancelled'
  | 'low_stock'
  | 'new_customer'
  | 'payment_received'
  | 'subscription_alert'
  | 'system';

type NotificationInput = Omit<InsertNotification, 'userId' | 'restaurantId'> & {
  restaurantId: string;
  userId?: string | null;
};

const enabledByType: Record<RestaurantNotificationType, keyof NotificationPreferences | null> = {
  new_order: 'newOrderEnabled',
  order_status: 'orderStatusEnabled',
  order_cancelled: 'orderCancelledEnabled',
  low_stock: 'lowStockEnabled',
  new_customer: 'newCustomerEnabled',
  payment_received: 'paymentReceivedEnabled',
  subscription_alert: 'subscriptionAlertEnabled',
  system: null,
};

function isEnabled(preferences: NotificationPreferences | undefined, type: RestaurantNotificationType): boolean {
  if (!preferences) return true;
  if (preferences.inAppEnabled !== 1) return false;

  const typeKey = enabledByType[type];
  return !typeKey || preferences[typeKey] !== 0;
}

async function broadcastNotification(restaurantId: string, notification: Notification): Promise<void> {
  const broadcast = (globalThis as typeof globalThis & {
    broadcastToRestaurant?: (targetRestaurantId: string, message: unknown) => void | Promise<void>;
  }).broadcastToRestaurant;

  if (typeof broadcast === 'function') {
    await broadcast(restaurantId, {
      type: 'new_notification',
      data: notification,
    });
  }
}

/**
 * Persists an in-app notification for each user that should receive it and
 * broadcasts it to connected clients. User-scoped rows keep read state
 * independent between operators.
 */
export async function notifyRestaurant(input: NotificationInput): Promise<Notification[]> {
  const users = input.userId
    ? [{ id: input.userId }]
    : await storage.getAllUsers(input.restaurantId);

  const recipients = users.length > 0 ? users : [{ id: null }];
  const defaultPreferences = await storage.getNotificationPreferences(input.restaurantId);
  const created: Notification[] = [];

  for (const recipient of recipients) {
    const userId = recipient.id || null;
    const preferences = userId
      ? (await storage.getNotificationPreferences(input.restaurantId, userId)) || defaultPreferences
      : defaultPreferences;

    if (!isEnabled(preferences, input.type)) continue;

    const notification = await storage.createNotification(input.restaurantId, {
      type: input.type,
      title: input.title,
      message: input.message,
      data: input.data,
      branchId: input.branchId || undefined,
      userId: userId || undefined,
      channel: 'in_app',
    });

    created.push(notification);
    await broadcastNotification(input.restaurantId, notification);
  }

  return created;
}