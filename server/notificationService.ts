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
  // Treat missing values from legacy preference rows as enabled. Only an
  // explicit zero disables in-app notifications.
  if (preferences.inAppEnabled === 0) return false;

  const typeKey = enabledByType[type];
  return !typeKey || preferences[typeKey] !== 0;
}

async function broadcastNotification(restaurantId: string, notification?: Notification): Promise<void> {
  const broadcast = (globalThis as typeof globalThis & {
    broadcastToRestaurant?: (targetRestaurantId: string, message: unknown) => void | Promise<void>;
  }).broadcastToRestaurant;

  if (typeof broadcast === 'function') {
    await broadcast(restaurantId, {
      type: 'new_notification',
      data: notification || undefined,
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
  // Preferences are optional. A legacy database can temporarily be missing a
  // column while migrations are being applied; that must not prevent the
  // notification row from being created.
  let defaultPreferences: NotificationPreferences | undefined;
  try {
    defaultPreferences = await storage.getNotificationPreferences(input.restaurantId);
  } catch (error) {
    console.error('[NOTIFICATION] Failed to load default preferences; using enabled defaults:', {
      restaurantId: input.restaurantId,
      error,
    });
  }
  const created: Notification[] = [];

  const results = await Promise.all(
    recipients.map(async (recipient): Promise<Notification | null> => {
      const userId = recipient.id || null;

      try {
        let preferences = defaultPreferences;
        if (userId) {
          try {
            preferences =
              (await storage.getNotificationPreferences(input.restaurantId, userId)) ||
              defaultPreferences;
          } catch (error) {
            console.error('[NOTIFICATION] Failed to load recipient preferences; using enabled defaults:', {
              restaurantId: input.restaurantId,
              userId,
              error,
            });
          }
        }

        if (!isEnabled(preferences, input.type)) return null;

        return await storage.createNotification(input.restaurantId, {
          type: input.type,
          title: input.title,
          message: input.message,
          data: input.data,
          branchId: input.branchId || undefined,
          userId: userId || undefined,
          channel: 'in_app',
        });
      } catch (error) {
        console.error('[NOTIFICATION] Failed to persist notification for recipient:', {
          restaurantId: input.restaurantId,
          userId,
          type: input.type,
          error,
        });
        return null;
      }
    }),
  );

  created.push(...results.filter((notification): notification is Notification => notification !== null));

  // All connected clients only need one cache invalidation per event. Sending
  // once per user caused duplicate toasts and exposed another user's row.
  if (created.length > 0) {
    try {
      await broadcastNotification(input.restaurantId, created[0]);
    } catch (error) {
      // WebSocket delivery is an acceleration layer; the database row is the
      // source of truth and remains available to the next API fetch.
      console.error('[NOTIFICATION] Failed to broadcast notification:', error);
    }
  }

  return created;
}