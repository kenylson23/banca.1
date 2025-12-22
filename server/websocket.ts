/**
 * WebSocket management with Redis Pub/Sub for horizontal scaling
 * 
 * When multiple app instances are running, WebSocket broadcasts need to be
 * synchronized across all instances. This module uses Redis Pub/Sub to enable
 * distributed real-time messaging.
 */

import { WebSocketServer, WebSocket } from "ws";
import type { Server } from "http";
import type Redis from 'ioredis';

// Redis clients (lazy loaded)
let pubClient: Redis | null = null;
let subClient: Redis | null = null;

async function getRedisClients(): Promise<{ pub: Redis; sub: Redis } | null> {
  if (pubClient && subClient) {
    return { pub: pubClient, sub: subClient };
  }

  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    return null; // No Redis configured
  }

  try {
    const { default: IORedis } = await import('ioredis');
    
    pubClient = new IORedis(redisUrl, { lazyConnect: true });
    subClient = new IORedis(redisUrl, { lazyConnect: true });

    await Promise.all([pubClient.connect(), subClient.connect()]);

    console.log('✅ Redis Pub/Sub connected for WebSocket');
    
    return { pub: pubClient, sub: subClient };
  } catch (error) {
    console.error('❌ Failed to initialize Redis Pub/Sub:', error);
    return null;
  }
}

export async function setupWebSocket(httpServer: Server) {
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  // Local connections (this instance only)
  const clientsByRestaurant = new Map<string, Set<WebSocket>>();
  const clients = new Set<WebSocket>();
  const clientRestaurantMap = new WeakMap<WebSocket, string>();

  // Check if Redis is available for distributed broadcasting
  const redis = await getRedisClients();
  const useRedis = redis !== null;

  if (useRedis) {
    console.log('🚀 WebSocket: Using Redis Pub/Sub (distributed)');
    
    // Subscribe to broadcasts from other instances
    redis!.sub.subscribe('ws:broadcast', 'ws:restaurant', (err) => {
      if (err) {
        console.error('❌ Redis subscribe error:', err);
      }
    });

    // Handle messages from other instances
    redis!.sub.on('message', (channel, message) => {
      try {
        const data = JSON.parse(message);
        
        if (channel === 'ws:broadcast') {
          // Global broadcast to all clients on this instance
          broadcastToClientsLocal(data.message);
        } else if (channel === 'ws:restaurant') {
          // Targeted broadcast to specific restaurant on this instance
          if (data.restaurantId) {
            broadcastToRestaurantLocal(data.restaurantId, data.message);
          }
        }
      } catch (error) {
        console.error('❌ Error processing Redis message:', error);
      }
    });
  } else {
    console.log('💾 WebSocket: Using local only (single instance)');
  }

  wss.on('connection', (ws) => {
    clients.add(ws);

    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());
        
        // Handle authentication message to associate connection with restaurant
        if (message.type === 'auth' && message.restaurantId) {
          const restaurantId = message.restaurantId;
          clientRestaurantMap.set(ws, restaurantId);
          
          if (!clientsByRestaurant.has(restaurantId)) {
            clientsByRestaurant.set(restaurantId, new Set());
          }
          clientsByRestaurant.get(restaurantId)!.add(ws);
          
          ws.send(JSON.stringify({ type: 'auth_success', restaurantId }));
        }
      } catch (error) {
        // Ignore parse errors
      }
    });

    ws.on('close', () => {
      clients.delete(ws);
      const restaurantId = clientRestaurantMap.get(ws);
      if (restaurantId) {
        const restaurantClients = clientsByRestaurant.get(restaurantId);
        if (restaurantClients) {
          restaurantClients.delete(ws);
          if (restaurantClients.size === 0) {
            clientsByRestaurant.delete(restaurantId);
          }
        }
      }
    });

    ws.on('error', (error) => {
      console.error('❌ WebSocket error:', error);
      clients.delete(ws);
      const restaurantId = clientRestaurantMap.get(ws);
      if (restaurantId) {
        const restaurantClients = clientsByRestaurant.get(restaurantId);
        if (restaurantClients) {
          restaurantClients.delete(ws);
        }
      }
    });
  });

  // Broadcast to all clients on THIS instance only
  function broadcastToClientsLocal(message: any) {
    const messageStr = JSON.stringify(message);
    clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(messageStr);
      }
    });
  }

  // Broadcast to specific restaurant clients on THIS instance only
  function broadcastToRestaurantLocal(restaurantId: string, message: any) {
    const restaurantClients = clientsByRestaurant.get(restaurantId);
    if (!restaurantClients) return;
    
    const messageStr = JSON.stringify(message);
    restaurantClients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(messageStr);
      }
    });
  }

  // Broadcast to ALL clients across ALL instances (via Redis)
  async function broadcastToClients(message: any) {
    // Send to local clients
    broadcastToClientsLocal(message);

    // Send to other instances via Redis
    if (useRedis && redis) {
      try {
        await redis.pub.publish('ws:broadcast', JSON.stringify({ message }));
      } catch (error) {
        console.error('❌ Redis publish error:', error);
      }
    }
  }

  // Broadcast to specific restaurant across ALL instances (via Redis)
  async function broadcastToRestaurant(restaurantId: string, message: any) {
    // Send to local clients
    broadcastToRestaurantLocal(restaurantId, message);

    // Send to other instances via Redis
    if (useRedis && redis) {
      try {
        await redis.pub.publish('ws:restaurant', JSON.stringify({
          restaurantId,
          message
        }));
      } catch (error) {
        console.error('❌ Redis publish error:', error);
      }
    }
  }

  // Make functions available globally for use in routes
  (global as any).broadcastToClients = broadcastToClients;
  (global as any).broadcastToRestaurant = broadcastToRestaurant;

  return wss;
}
