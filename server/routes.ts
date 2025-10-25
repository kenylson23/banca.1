// Blueprint: javascript_log_in_with_replit - Auth routes
// Blueprint: javascript_websocket - WebSocket implementation
import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, hashPassword } from "./auth";
import passport from "passport";
import QRCode from "qrcode";
import {
  insertTableSchema,
  insertCategorySchema,
  insertMenuItemSchema,
  insertOrderSchema,
  insertOrderItemSchema,
  publicOrderItemSchema,
  insertUserSchema,
  insertRestaurantSchema,
  loginSchema,
  updateUserSchema,
  updateProfileSchema,
  updatePasswordSchema,
  type User,
} from "@shared/schema";
import { z } from "zod";

// Middleware to check if user is admin (restaurant admin)
function isAdmin(req: any, res: any, next: any) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Não autenticado" });
  }
  const user = req.user as User;
  if (user.role !== 'admin' && user.role !== 'superadmin') {
    return res.status(403).json({ message: "Acesso negado. Apenas administradores podem realizar esta ação." });
  }
  if (user.role === 'admin' && !user.restaurantId) {
    return res.status(403).json({ message: "Administrador não associado a um restaurante" });
  }
  next();
}

// Middleware to check if user is super admin
function isSuperAdmin(req: any, res: any, next: any) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Não autenticado" });
  }
  const user = req.user as User;
  if (user.role !== 'superadmin') {
    return res.status(403).json({ message: "Acesso negado. Apenas super administradores podem realizar esta ação." });
  }
  next();
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  setupAuth(app);

  // ===== PUBLIC RESTAURANT REGISTRATION =====
  app.post('/api/restaurants/register', async (req, res) => {
    try {
      const data = insertRestaurantSchema.parse(req.body);
      
      const existingRestaurant = await storage.getRestaurantByEmail(data.email);
      if (existingRestaurant) {
        return res.status(400).json({ message: "Email já cadastrado" });
      }

      const { restaurant, adminUser } = await storage.createRestaurant(data);

      res.json({
        message: "Cadastro realizado com sucesso! Aguarde aprovação do super administrador.",
        restaurant: {
          id: restaurant.id,
          name: restaurant.name,
          email: restaurant.email,
          status: restaurant.status,
        }
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      console.error("Error registering restaurant:", error);
      res.status(500).json({ message: "Erro ao cadastrar restaurante" });
    }
  });

  // Auth routes
  app.post('/api/auth/login', (req, res, next) => {
    try {
      loginSchema.parse(req.body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
    }

    passport.authenticate('local', async (err: any, user: User | false, info: any) => {
      if (err) {
        return res.status(500).json({ message: "Erro ao fazer login" });
      }
      if (!user) {
        return res.status(401).json({ message: info?.message || "Email ou senha incorretos" });
      }

      // Check if user belongs to an approved restaurant (unless superadmin)
      if (user.role !== 'superadmin' && user.restaurantId) {
        const restaurant = await storage.getRestaurantById(user.restaurantId);
        if (!restaurant) {
          return res.status(403).json({ message: "Restaurante não encontrado" });
        }
        if (restaurant.status !== 'ativo') {
          return res.status(403).json({ message: "Restaurante ainda não foi aprovado ou está suspenso" });
        }
      }

      req.login(user, (loginErr) => {
        if (loginErr) {
          return res.status(500).json({ message: "Erro ao fazer login" });
        }

        const userWithoutPassword = {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          restaurantId: user.restaurantId,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        };

        return res.json(userWithoutPassword);
      });
    })(req, res, next);
  });

  app.post('/api/auth/logout', (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Erro ao fazer logout" });
      }
      res.json({ success: true });
    });
  });

  app.get('/api/auth/user', isAuthenticated, async (req, res) => {
    try {
      const user = req.user as User;
      const userWithoutPassword = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        restaurantId: user.restaurantId,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Erro ao buscar usuário" });
    }
  });

  app.patch('/api/auth/profile', isAuthenticated, async (req, res) => {
    try {
      const currentUser = req.user as User;
      const data = updateProfileSchema.parse(req.body);
      
      if (data.email) {
        const existingUser = await storage.getUserByEmail(data.email);
        if (existingUser && existingUser.id !== currentUser.id) {
          return res.status(400).json({ message: "Email já está em uso por outro usuário" });
        }
      }

      const restaurantId = currentUser.role === 'superadmin' ? null : currentUser.restaurantId || null;
      const updatedUser = await storage.updateUser(restaurantId, currentUser.id, data);
      
      const userWithoutPassword = {
        id: updatedUser.id,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        role: updatedUser.role,
        restaurantId: updatedUser.restaurantId,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
      };

      res.json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Erro ao atualizar perfil" });
    }
  });

  app.patch('/api/auth/password', isAuthenticated, async (req, res) => {
    try {
      const currentUser = req.user as User;
      const data = updatePasswordSchema.parse(req.body);
      
      const user = await storage.getUser(currentUser.id);
      if (!user) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }

      const { verifyPassword } = await import('./auth');
      const isValidPassword = await verifyPassword(data.currentPassword, user.password);
      
      if (!isValidPassword) {
        return res.status(400).json({ message: "Senha atual incorreta" });
      }

      const hashedPassword = await hashPassword(data.newPassword);
      await storage.updateUserPassword(currentUser.id, hashedPassword);

      res.json({ success: true, message: "Senha alterada com sucesso" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      console.error("Error updating password:", error);
      res.status(500).json({ message: "Erro ao atualizar senha" });
    }
  });

  // ===== SUPER ADMIN RESTAURANT MANAGEMENT ROUTES =====
  app.get('/api/superadmin/restaurants', isSuperAdmin, async (req, res) => {
    try {
      const restaurants = await storage.getRestaurants();
      res.json(restaurants);
    } catch (error) {
      console.error("Error fetching restaurants:", error);
      res.status(500).json({ message: "Erro ao buscar restaurantes" });
    }
  });

  app.patch('/api/superadmin/restaurants/:id/status', isSuperAdmin, async (req, res) => {
    try {
      const { status } = req.body;
      if (!['pendente', 'ativo', 'suspenso'].includes(status)) {
        return res.status(400).json({ message: "Status inválido" });
      }

      const restaurant = await storage.updateRestaurantStatus(req.params.id, status);
      res.json(restaurant);
    } catch (error) {
      console.error("Error updating restaurant status:", error);
      res.status(500).json({ message: "Erro ao atualizar status do restaurante" });
    }
  });

  app.delete('/api/superadmin/restaurants/:id', isSuperAdmin, async (req, res) => {
    try {
      await storage.deleteRestaurant(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting restaurant:", error);
      res.status(500).json({ message: "Erro ao deletar restaurante" });
    }
  });

  app.get('/api/superadmin/stats', isSuperAdmin, async (req, res) => {
    try {
      const stats = await storage.getSuperAdminStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching super admin stats:", error);
      res.status(500).json({ message: "Erro ao buscar estatísticas" });
    }
  });

  // ===== MESSAGE ROUTES (Super Admin & Restaurant Admin) =====
  app.get('/api/superadmin/messages', isSuperAdmin, async (req, res) => {
    try {
      const messages = await storage.getAllMessages();
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Erro ao buscar mensagens" });
    }
  });

  app.post('/api/superadmin/messages', isSuperAdmin, async (req, res) => {
    try {
      const currentUser = req.user as User;
      const { restaurantId, subject, content } = req.body;
      
      if (!restaurantId || !subject || !content) {
        return res.status(400).json({ message: "Dados incompletos" });
      }

      const message = await storage.createMessage({
        restaurantId,
        subject,
        content,
        sentBy: `${currentUser.firstName} ${currentUser.lastName || ''}`.trim(),
      });

      res.json(message);
    } catch (error) {
      console.error("Error creating message:", error);
      res.status(500).json({ message: "Erro ao criar mensagem" });
    }
  });

  app.get('/api/messages', isAdmin, async (req, res) => {
    try {
      const currentUser = req.user as User;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usuário não associado a um restaurante" });
      }

      const messages = await storage.getMessages(currentUser.restaurantId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Erro ao buscar mensagens" });
    }
  });

  app.patch('/api/messages/:id/read', isAdmin, async (req, res) => {
    try {
      const message = await storage.markMessageAsRead(req.params.id);
      res.json(message);
    } catch (error) {
      console.error("Error marking message as read:", error);
      res.status(500).json({ message: "Erro ao marcar mensagem como lida" });
    }
  });

  // ===== USER MANAGEMENT ROUTES (Admin Only) =====
  app.get('/api/users', isAdmin, async (req, res) => {
    try {
      const currentUser = req.user as User;
      const restaurantId = currentUser.role === 'superadmin' ? null : currentUser.restaurantId || null;
      
      const users = await storage.getAllUsers(restaurantId);
      const usersWithoutPassword = users.map(user => ({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        restaurantId: user.restaurantId,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      }));
      res.json(usersWithoutPassword);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Erro ao buscar usuários" });
    }
  });

  app.post('/api/users', isAdmin, async (req, res) => {
    try {
      const currentUser = req.user as User;
      const data = insertUserSchema.parse(req.body);
      
      // Restaurant admins can only create users for their own restaurant
      if (currentUser.role === 'admin') {
        data.restaurantId = currentUser.restaurantId;
      }
      
      const existingUser = await storage.getUserByEmail(data.email);
      if (existingUser) {
        return res.status(400).json({ message: "Email já cadastrado" });
      }

      const hashedPassword = await hashPassword(data.password);
      const user = await storage.createUser({
        ...data,
        password: hashedPassword,
      });

      const userWithoutPassword = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        restaurantId: user.restaurantId,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };

      res.json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Erro ao criar usuário" });
    }
  });

  app.delete('/api/users/:id', isAdmin, async (req, res) => {
    try {
      const currentUser = req.user as User;
      
      if (currentUser.id === req.params.id) {
        return res.status(400).json({ message: "Não é possível deletar o próprio usuário" });
      }

      const restaurantId = currentUser.role === 'superadmin' ? null : currentUser.restaurantId || null;
      await storage.deleteUser(restaurantId, req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Erro ao deletar usuário" });
    }
  });

  app.patch('/api/users/:id', isAdmin, async (req, res) => {
    try {
      const currentUser = req.user as User;
      const data = updateUserSchema.parse(req.body);
      
      if (data.email) {
        const existingUser = await storage.getUserByEmail(data.email);
        if (existingUser && existingUser.id !== req.params.id) {
          return res.status(400).json({ message: "Email já está em uso por outro usuário" });
        }
      }

      const restaurantId = currentUser.role === 'superadmin' ? null : currentUser.restaurantId || null;
      const updatedUser = await storage.updateUser(restaurantId, req.params.id, data);
      
      const userWithoutPassword = {
        id: updatedUser.id,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        role: updatedUser.role,
        restaurantId: updatedUser.restaurantId,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
      };

      res.json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Erro ao atualizar usuário" });
    }
  });

  // ===== PUBLIC ROUTES (for customers) =====
  // These routes are used by customers scanning QR codes to view menus and place orders
  
  // Get restaurant details by ID
  app.get("/api/public/restaurants/:restaurantId", async (req, res) => {
    try {
      const restaurantId = req.params.restaurantId;
      const restaurant = await storage.getRestaurantById(restaurantId);
      
      if (!restaurant) {
        return res.status(404).json({ message: "Restaurante não encontrado" });
      }
      
      res.json(restaurant);
    } catch (error) {
      console.error("Error fetching restaurant:", error);
      res.status(500).json({ message: "Erro ao buscar restaurante" });
    }
  });

  // Get table by number (used by QR code flow at /mesa/:tableNumber)
  // This finds the table by number alone. In multi-tenant systems with duplicate table numbers
  // across restaurants, consider using the restaurantId-scoped route below instead.
  app.get("/api/public/tables/:number", async (req, res) => {
    try {
      const tableNumber = parseInt(req.params.number);
      if (isNaN(tableNumber)) {
        return res.status(400).json({ message: "Número de mesa inválido" });
      }
      
      const table = await storage.getTableByNumber(tableNumber);
      
      if (!table) {
        return res.status(404).json({ message: "Mesa não encontrada" });
      }
      
      res.json(table);
    } catch (error) {
      console.error("Error fetching table:", error);
      res.status(500).json({ message: "Erro ao buscar mesa" });
    }
  });

  app.get("/api/public/menu-items/:restaurantId", async (req, res) => {
    try {
      const restaurantId = req.params.restaurantId;
      const menuItems = await storage.getMenuItems(restaurantId);
      const availableItems = menuItems.filter(item => item.isAvailable === 1);
      res.json(availableItems);
    } catch (error) {
      console.error("Error fetching menu items:", error);
      res.status(500).json({ message: "Erro ao carregar menu" });
    }
  });

  app.get("/api/public/orders/table/:tableId", async (req, res) => {
    try {
      const tableId = req.params.tableId;
      // Get table to find restaurant
      const table = await storage.getTableById(tableId);
      if (!table) {
        return res.status(404).json({ message: "Mesa não encontrada" });
      }
      
      const orders = await storage.getOrdersByTableId(table.restaurantId, tableId);
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders by table:", error);
      res.status(500).json({ message: "Erro ao buscar pedidos" });
    }
  });

  app.post("/api/public/orders", async (req, res) => {
    try {
      const { items, ...orderData } = req.body;
      
      const validatedOrder = insertOrderSchema.parse(orderData);
      const validatedItems = z.array(publicOrderItemSchema).parse(items);

      const table = await storage.getTableById(validatedOrder.tableId);
      if (!table) {
        return res.status(404).json({ message: "Mesa não encontrada" });
      }

      const order = await storage.createOrder(validatedOrder, validatedItems);
      
      broadcastToClients({ type: 'new_order', data: order });

      res.json(order);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message, errors: error.errors });
      }
      console.error("Error creating order:", error);
      res.status(500).json({ message: "Erro ao criar pedido" });
    }
  });

  // ===== TABLE ROUTES (Admin Only) =====
  app.get("/api/tables", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user as User;
      if (!currentUser.restaurantId && currentUser.role !== 'superadmin') {
        return res.status(403).json({ message: "Usuário não associado a um restaurante" });
      }
      
      const restaurantId = currentUser.restaurantId!;
      const tables = await storage.getTables(restaurantId);
      res.json(tables);
    } catch (error) {
      console.error("Error fetching tables:", error);
      res.status(500).json({ message: "Failed to fetch tables" });
    }
  });

  app.post("/api/tables", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user as User;
      if (!currentUser.restaurantId && currentUser.role !== 'superadmin') {
        return res.status(403).json({ message: "Usuário não associado a um restaurante" });
      }
      
      const restaurantId = currentUser.restaurantId!;
      const data = insertTableSchema.parse(req.body);
      
      // Generate QR code
      const qrCodeUrl = `https://${req.hostname}/mesa/${data.number}`;
      const qrCode = await QRCode.toDataURL(qrCodeUrl, {
        width: 300,
        margin: 2,
      });

      const table = await storage.createTable(restaurantId, {
        number: data.number,
        qrCode,
      });

      // Broadcast to WebSocket clients
      broadcastToClients({ type: 'table_created', data: table });

      res.json(table);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      console.error("Error creating table:", error);
      res.status(500).json({ message: "Failed to create table" });
    }
  });

  app.delete("/api/tables/:id", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user as User;
      if (!currentUser.restaurantId && currentUser.role !== 'superadmin') {
        return res.status(403).json({ message: "Usuário não associado a um restaurante" });
      }
      
      const restaurantId = currentUser.restaurantId!;
      await storage.deleteTable(restaurantId, req.params.id);
      
      // Broadcast to WebSocket clients
      broadcastToClients({ type: 'table_deleted', data: { id: req.params.id } });
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting table:", error);
      res.status(500).json({ message: "Failed to delete table" });
    }
  });

  // ===== CATEGORY ROUTES (Admin Only) =====
  app.get("/api/categories", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user as User;
      if (!currentUser.restaurantId && currentUser.role !== 'superadmin') {
        return res.status(403).json({ message: "Usuário não associado a um restaurante" });
      }
      
      const restaurantId = currentUser.restaurantId!;
      const categories = await storage.getCategories(restaurantId);
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.post("/api/categories", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user as User;
      if (!currentUser.restaurantId && currentUser.role !== 'superadmin') {
        return res.status(403).json({ message: "Usuário não associado a um restaurante" });
      }
      
      console.log("Category request body:", req.body);
      const restaurantId = currentUser.restaurantId!;
      const data = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(restaurantId, data);
      res.json(category);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error("Zod validation error:", error.errors);
        return res.status(400).json({ message: error.errors[0].message });
      }
      console.error("Error creating category:", error);
      res.status(500).json({ message: "Failed to create category" });
    }
  });

  app.delete("/api/categories/:id", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user as User;
      if (!currentUser.restaurantId && currentUser.role !== 'superadmin') {
        return res.status(403).json({ message: "Usuário não associado a um restaurante" });
      }
      
      const restaurantId = currentUser.restaurantId!;
      await storage.deleteCategory(restaurantId, req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting category:", error);
      res.status(500).json({ message: "Failed to delete category" });
    }
  });

  // ===== MENU ITEM ROUTES (Admin Only) =====
  app.get("/api/menu-items", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user as User;
      if (!currentUser.restaurantId && currentUser.role !== 'superadmin') {
        return res.status(403).json({ message: "Usuário não associado a um restaurante" });
      }
      
      const restaurantId = currentUser.restaurantId!;
      const menuItems = await storage.getMenuItems(restaurantId);
      res.json(menuItems);
    } catch (error) {
      console.error("Error fetching menu items:", error);
      res.status(500).json({ message: "Failed to fetch menu items" });
    }
  });

  app.post("/api/menu-items", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user as User;
      if (!currentUser.restaurantId && currentUser.role !== 'superadmin') {
        return res.status(403).json({ message: "Usuário não associado a um restaurante" });
      }
      
      console.log("Menu item request body:", req.body);
      const restaurantId = currentUser.restaurantId!;
      const data = insertMenuItemSchema.parse(req.body);
      const menuItem = await storage.createMenuItem(restaurantId, data);
      res.json(menuItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error("Zod validation error for menu item:", error.errors);
        return res.status(400).json({ message: error.errors[0].message });
      }
      console.error("Error creating menu item:", error);
      res.status(500).json({ message: "Failed to create menu item" });
    }
  });

  app.patch("/api/menu-items/:id", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user as User;
      if (!currentUser.restaurantId && currentUser.role !== 'superadmin') {
        return res.status(403).json({ message: "Usuário não associado a um restaurante" });
      }
      
      const restaurantId = currentUser.restaurantId!;
      const data = insertMenuItemSchema.partial().parse(req.body);
      const menuItem = await storage.updateMenuItem(restaurantId, req.params.id, data);
      res.json(menuItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      console.error("Error updating menu item:", error);
      res.status(500).json({ message: "Failed to update menu item" });
    }
  });

  app.delete("/api/menu-items/:id", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user as User;
      if (!currentUser.restaurantId && currentUser.role !== 'superadmin') {
        return res.status(403).json({ message: "Usuário não associado a um restaurante" });
      }
      
      const restaurantId = currentUser.restaurantId!;
      await storage.deleteMenuItem(restaurantId, req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting menu item:", error);
      res.status(500).json({ message: "Failed to delete menu item" });
    }
  });

  // ===== ORDER ROUTES =====
  app.get("/api/orders/kitchen", isAuthenticated, async (req, res) => {
    try {
      const currentUser = req.user as User;
      if (!currentUser.restaurantId && currentUser.role !== 'superadmin') {
        return res.status(403).json({ message: "Usuário não associado a um restaurante" });
      }
      
      const restaurantId = currentUser.restaurantId!;
      const orders = await storage.getKitchenOrders(restaurantId);
      res.json(orders);
    } catch (error) {
      console.error("Error fetching kitchen orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.get("/api/orders/recent", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user as User;
      if (!currentUser.restaurantId && currentUser.role !== 'superadmin') {
        return res.status(403).json({ message: "Usuário não associado a um restaurante" });
      }
      
      const restaurantId = currentUser.restaurantId!;
      const orders = await storage.getRecentOrders(restaurantId, 10);
      res.json(orders);
    } catch (error) {
      console.error("Error fetching recent orders:", error);
      res.status(500).json({ message: "Failed to fetch recent orders" });
    }
  });

  app.post("/api/orders", isAdmin, async (req, res) => {
    try {
      const { items, ...orderData } = req.body;
      const validatedOrder = insertOrderSchema.parse(orderData);
      const validatedItems = z.array(insertOrderItemSchema).parse(items);

      const order = await storage.createOrder(validatedOrder, validatedItems);
      
      // Broadcast new order to WebSocket clients
      broadcastToClients({ type: 'new_order', data: order });

      res.json(order);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      console.error("Error creating order:", error);
      res.status(500).json({ message: "Failed to create order" });
    }
  });

  app.patch("/api/orders/:id/status", isAuthenticated, async (req, res) => {
    try {
      const currentUser = req.user as User;
      if (!currentUser.restaurantId && currentUser.role !== 'superadmin') {
        return res.status(403).json({ message: "Usuário não associado a um restaurante" });
      }
      
      const restaurantId = currentUser.restaurantId!;
      const { status } = req.body;
      if (!['pendente', 'em_preparo', 'pronto', 'servido'].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      const order = await storage.updateOrderStatus(restaurantId, req.params.id, status);
      
      if (status === 'servido') {
        await storage.updateTableOccupancy(restaurantId, order.tableId, false);
        broadcastToClients({ 
          type: 'table_freed', 
          data: { tableId: order.tableId }
        });
      }
      
      broadcastToClients({ 
        type: 'order_status_updated', 
        data: { id: order.id, status: order.status }
      });

      res.json(order);
    } catch (error) {
      console.error("Error updating order status:", error);
      res.status(500).json({ message: "Failed to update order status" });
    }
  });

  // ===== STATS ROUTES (Admin Only) =====
  app.get("/api/stats/dashboard", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user as User;
      if (!currentUser.restaurantId && currentUser.role !== 'superadmin') {
        return res.status(403).json({ message: "Usuário não associado a um restaurante" });
      }
      
      const restaurantId = currentUser.restaurantId!;
      const stats = await storage.getTodayStats(restaurantId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  app.get("/api/stats/kitchen", isAuthenticated, async (req, res) => {
    try {
      const currentUser = req.user as User;
      if (!currentUser.restaurantId && currentUser.role !== 'superadmin') {
        return res.status(403).json({ message: "Usuário não associado a um restaurante" });
      }
      
      const restaurantId = currentUser.restaurantId!;
      const period = req.query.period as 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' || 'daily';
      if (!['daily', 'weekly', 'monthly', 'quarterly', 'yearly'].includes(period)) {
        return res.status(400).json({ message: "Invalid period. Must be one of: daily, weekly, monthly, quarterly, yearly" });
      }
      const stats = await storage.getKitchenStats(restaurantId, period);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching kitchen stats:", error);
      res.status(500).json({ message: "Failed to fetch kitchen stats" });
    }
  });

  const httpServer = createServer(app);

  // Setup WebSocket server for real-time updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  const clients = new Set<WebSocket>();

  wss.on('connection', (ws) => {
    console.log('New WebSocket client connected');
    clients.add(ws);

    ws.on('close', () => {
      console.log('WebSocket client disconnected');
      clients.delete(ws);
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      clients.delete(ws);
    });
  });

  function broadcastToClients(message: any) {
    const messageStr = JSON.stringify(message);
    clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(messageStr);
      }
    });
  }

  return httpServer;
}
