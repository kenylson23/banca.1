// Blueprint: javascript_log_in_with_replit - Auth routes
// Blueprint: javascript_websocket - WebSocket implementation
import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, hashPassword } from "./auth";
import passport from "passport";
import QRCode from "qrcode";
import PDFDocument from "pdfkit";
import {
  insertTableSchema,
  insertCategorySchema,
  insertMenuItemSchema,
  insertOrderSchema,
  publicOrderSchema,
  insertOrderItemSchema,
  publicOrderItemSchema,
  insertUserSchema,
  insertRestaurantSchema,
  loginSchema,
  updateUserSchema,
  updateProfileSchema,
  updatePasswordSchema,
  insertBranchSchema,
  updateBranchSchema,
  updateRestaurantSlugSchema,
  insertOptionGroupSchema,
  updateOptionGroupSchema,
  insertOptionSchema,
  updateOptionSchema,
  updateOrderMetadataSchema,
  updateOrderItemQuantitySchema,
  applyDiscountSchema,
  applyServiceChargeSchema,
  applyDeliveryFeeSchema,
  applyPackagingFeeSchema,
  recordPaymentSchema,
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

  // Add no-cache headers for all public API routes
  app.use('/api/public', (req, res, next) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    next();
  });

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
          activeBranchId: user.activeBranchId,
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
      req.session.destroy((destroyErr) => {
        res.clearCookie('connect.sid');
        res.json({ success: true });
      });
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
        activeBranchId: user.activeBranchId,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };
      
      res.json(userWithoutPassword);
    } catch (error) {
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
        activeBranchId: updatedUser.activeBranchId,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
      };

      res.json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
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
      res.status(500).json({ message: "Erro ao atualizar senha" });
    }
  });

  app.patch('/api/auth/active-branch', isAuthenticated, async (req, res) => {
    try {
      const currentUser = req.user as User;
      const { branchId } = req.body;
      
      if (branchId) {
        const branch = await storage.getBranchById(branchId);
        if (!branch) {
          return res.status(404).json({ message: "Filial não encontrada" });
        }
        if (branch.restaurantId !== currentUser.restaurantId) {
          return res.status(403).json({ message: "Filial não pertence ao seu restaurante" });
        }
      }

      const updatedUser = await storage.updateUserActiveBranch(currentUser.id, branchId || null);
      
      const userWithoutPassword = {
        id: updatedUser.id,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        role: updatedUser.role,
        restaurantId: updatedUser.restaurantId,
        activeBranchId: updatedUser.activeBranchId,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
      };

      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Erro ao atualizar filial ativa" });
    }
  });

  // ===== BRANCH MANAGEMENT ROUTES =====
  app.get('/api/branches', isAdmin, async (req, res) => {
    try {
      const currentUser = req.user as User;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usuário não associado a um restaurante" });
      }

      const branches = await storage.getBranches(currentUser.restaurantId);
      res.json(branches);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar filiais" });
    }
  });

  app.post('/api/branches', isAdmin, async (req, res) => {
    try {
      const currentUser = req.user as User;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usuário não associado a um restaurante" });
      }

      const data = insertBranchSchema.parse(req.body);
      const branch = await storage.createBranch(currentUser.restaurantId, data);
      res.json(branch);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Erro ao criar filial" });
    }
  });

  app.patch('/api/branches/:id', isAdmin, async (req, res) => {
    try {
      const currentUser = req.user as User;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usuário não associado a um restaurante" });
      }

      const data = updateBranchSchema.parse(req.body);
      const branch = await storage.updateBranch(currentUser.restaurantId, req.params.id, data);
      res.json(branch);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Erro ao atualizar filial" });
    }
  });

  app.delete('/api/branches/:id', isAdmin, async (req, res) => {
    try {
      const currentUser = req.user as User;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usuário não associado a um restaurante" });
      }

      await storage.deleteBranch(currentUser.restaurantId, req.params.id);
      res.json({ success: true });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro ao deletar filial";
      res.status(500).json({ message: errorMessage });
    }
  });

  // ===== SUPER ADMIN RESTAURANT MANAGEMENT ROUTES =====
  app.get('/api/superadmin/restaurants', isSuperAdmin, async (req, res) => {
    try {
      const restaurants = await storage.getRestaurants();
      res.json(restaurants);
    } catch (error) {
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
      res.status(500).json({ message: "Erro ao atualizar status do restaurante" });
    }
  });

  app.delete('/api/superadmin/restaurants/:id', isSuperAdmin, async (req, res) => {
    try {
      await storage.deleteRestaurant(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Erro ao deletar restaurante" });
    }
  });

  // Update restaurant slug (Admin only)
  app.patch('/api/restaurants/slug', isAdmin, async (req, res) => {
    try {
      const currentUser = req.user as User;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usuário não associado a um restaurante" });
      }

      const data = updateRestaurantSlugSchema.parse(req.body);
      
      const existingRestaurant = await storage.getRestaurantBySlug(data.slug);
      if (existingRestaurant && existingRestaurant.id !== currentUser.restaurantId) {
        return res.status(400).json({ message: "Este slug já está em uso por outro restaurante" });
      }

      const restaurant = await storage.updateRestaurantSlug(currentUser.restaurantId, data.slug);
      res.json(restaurant);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Erro ao atualizar slug do restaurante" });
    }
  });

  app.get('/api/superadmin/stats', isSuperAdmin, async (req, res) => {
    try {
      const stats = await storage.getSuperAdminStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar estatísticas" });
    }
  });

  // ===== MESSAGE ROUTES (Super Admin & Restaurant Admin) =====
  app.get('/api/superadmin/messages', isSuperAdmin, async (req, res) => {
    try {
      const messages = await storage.getAllMessages();
      res.json(messages);
    } catch (error) {
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
      res.status(500).json({ message: "Erro ao buscar mensagens" });
    }
  });

  app.patch('/api/messages/:id/read', isAdmin, async (req, res) => {
    try {
      const message = await storage.markMessageAsRead(req.params.id);
      res.json(message);
    } catch (error) {
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
      res.status(500).json({ message: "Erro ao atualizar usuário" });
    }
  });

  // ===== PUBLIC ROUTES (for customers) =====
  // These routes are used by customers scanning QR codes to view menus and place orders
  
  // Get option groups for a menu item (public route for customers)
  app.get("/api/public/menu-items/:menuItemId/option-groups", async (req, res) => {
    try {
      const groups = await storage.getOptionGroupsByMenuItem(req.params.menuItemId);
      res.json(groups);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar grupos de opções" });
    }
  });
  
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
      res.status(500).json({ message: "Erro ao buscar restaurante" });
    }
  });

  // Get restaurant details by slug
  app.get("/api/public/restaurants/slug/:slug", async (req, res) => {
    try {
      const slug = req.params.slug;
      const restaurant = await storage.getRestaurantBySlug(slug);
      
      if (!restaurant) {
        return res.status(404).json({ message: "Restaurante não encontrado" });
      }
      
      if (restaurant.status !== 'ativo') {
        return res.status(403).json({ message: "Restaurante não está ativo" });
      }
      
      res.json(restaurant);
    } catch (error) {
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
      res.status(500).json({ message: "Erro ao buscar mesa" });
    }
  });

  app.get("/api/public/menu-items/:restaurantId", async (req, res) => {
    try {
      const restaurantId = req.params.restaurantId;
      const menuItems = await storage.getMenuItems(restaurantId);
      const availableItems = menuItems.filter(item => item.isAvailable === 1);
      
      // Debug log
      if (menuItems.length > 0 && availableItems.length === 0) {
      }
      
      res.json(availableItems);
    } catch (error) {
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
      res.status(500).json({ message: "Erro ao buscar pedidos" });
    }
  });

  app.get("/api/public/restaurants/:slug/orders/search", async (req, res) => {
    try {
      const slug = req.params.slug;
      const searchTerm = req.query.q as string;
      
      if (!searchTerm || searchTerm.trim().length === 0) {
        return res.status(400).json({ message: "Termo de busca é obrigatório" });
      }

      const restaurant = await storage.getRestaurantBySlug(slug);
      if (!restaurant) {
        return res.status(404).json({ message: "Restaurante não encontrado" });
      }

      const orders = await storage.searchOrders(restaurant.id, searchTerm);
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar pedidos" });
    }
  });

  // Public order creation route (for customers)
  // This route does NOT require authentication and does NOT set createdBy
  // Customers use a simple checkout without advanced controls (discounts, service charges, payments)
  app.post("/api/public/orders", async (req, res) => {
    try {
      const { items, ...orderData } = req.body;
      
      // Use publicOrderSchema which automatically blocks professional fields
      // (discount, discountType, serviceCharge, deliveryFee, paymentMethod, createdBy)
      let validatedOrder = publicOrderSchema.parse(orderData);
      
      const validatedItems = z.array(publicOrderItemSchema).parse(items);

      // Derive orderType from context if not explicitly provided
      if (!validatedOrder.orderType) {
        if (validatedOrder.tableId) {
          validatedOrder = { ...validatedOrder, orderType: 'mesa' };
        } else if (validatedOrder.deliveryAddress) {
          validatedOrder = { ...validatedOrder, orderType: 'delivery' };
        } else {
          validatedOrder = { ...validatedOrder, orderType: 'takeout' };
        }
      }

      // Validate based on order type
      if (validatedOrder.orderType === 'mesa') {
        if (!validatedOrder.tableId) {
          return res.status(400).json({ message: "Mesa é obrigatória para pedidos do tipo mesa" });
        }
        const table = await storage.getTableById(validatedOrder.tableId);
        if (!table) {
          return res.status(404).json({ message: "Mesa não encontrada" });
        }
      }

      if (validatedOrder.orderType === 'delivery') {
        if (!validatedOrder.deliveryAddress) {
          return res.status(400).json({ message: "Endereço de entrega é obrigatório para delivery" });
        }
        if (!validatedOrder.customerName?.trim()) {
          return res.status(400).json({ message: "Nome é obrigatório para delivery" });
        }
        if (!validatedOrder.customerPhone?.trim()) {
          return res.status(400).json({ message: "Telefone é obrigatório para delivery" });
        }
        if (validatedOrder.tableId) {
          return res.status(400).json({ message: "Pedidos delivery não podem estar associados a uma mesa" });
        }
      }

      if (validatedOrder.orderType === 'takeout') {
        if (!validatedOrder.customerName?.trim()) {
          return res.status(400).json({ message: "Nome é obrigatório para retirada" });
        }
        if (!validatedOrder.customerPhone?.trim()) {
          return res.status(400).json({ message: "Telefone é obrigatório para retirada" });
        }
        if (validatedOrder.tableId) {
          return res.status(400).json({ message: "Pedidos para retirada não podem estar associados a uma mesa" });
        }
      }

      const order = await storage.createOrder(validatedOrder, validatedItems);
      
      broadcastToClients({ type: 'new_order', data: order });

      res.json(order);
    } catch (error) {
      console.error('Erro ao criar pedido:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message, errors: error.errors });
      }
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
      const branchId = currentUser.activeBranchId || null;
      const tables = await storage.getTables(restaurantId, branchId);
      res.json(tables);
    } catch (error) {
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
      
      // Generate QR code with proper domain handling
      const baseUrl = process.env.REPLIT_DEV_DOMAIN 
        ? `https://${process.env.REPLIT_DEV_DOMAIN}` 
        : `https://${req.hostname}`;
      const qrCodeUrl = `${baseUrl}/mesa/${data.number}`;
      const qrCode = await QRCode.toDataURL(qrCodeUrl, {
        width: 300,
        margin: 2,
      });

      const branchId = currentUser.activeBranchId || null;
      const table = await storage.createTable(restaurantId, branchId, {
        number: data.number,
        capacity: data.capacity,
        area: data.area,
        qrCode,
      });

      // Broadcast to WebSocket clients
      broadcastToClients({ type: 'table_created', data: table });

      res.json(table);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      if (error instanceof Error) {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: "Erro ao criar mesa" });
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
      res.status(500).json({ message: "Failed to delete table" });
    }
  });

  app.get("/api/tables/with-orders", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user as User;
      if (!currentUser.restaurantId && currentUser.role !== 'superadmin') {
        return res.status(403).json({ message: "Usuário não associado a um restaurante" });
      }
      
      const restaurantId = currentUser.restaurantId!;
      const branchId = currentUser.activeBranchId || null;
      const tables = await storage.getTablesWithOrders(restaurantId, branchId);
      res.json(tables);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tables with orders" });
    }
  });

  app.patch("/api/tables/:id/status", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user as User;
      if (!currentUser.restaurantId && currentUser.role !== 'superadmin') {
        return res.status(403).json({ message: "Usuário não associado a um restaurante" });
      }
      
      const restaurantId = currentUser.restaurantId!;
      const { status, customerName, customerCount } = req.body;
      
      const updatedTable = await storage.updateTableStatus(
        restaurantId,
        req.params.id,
        status,
        { customerName, customerCount }
      );
      
      broadcastToClients({ type: 'table_status_updated', data: updatedTable });
      
      res.json(updatedTable);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to update table status" });
    }
  });

  app.post("/api/tables/:id/start-session", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user as User;
      if (!currentUser.restaurantId && currentUser.role !== 'superadmin') {
        return res.status(403).json({ message: "Usuário não associado a um restaurante" });
      }
      
      const restaurantId = currentUser.restaurantId!;
      const { customerName, customerCount } = req.body;
      
      const session = await storage.startTableSession(restaurantId, req.params.id, {
        customerName,
        customerCount,
      });
      
      await storage.calculateTableTotal(restaurantId, req.params.id);
      
      broadcastToClients({ type: 'table_session_started', data: session });
      
      res.json(session);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to start table session" });
    }
  });

  app.post("/api/tables/:id/end-session", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user as User;
      if (!currentUser.restaurantId && currentUser.role !== 'superadmin') {
        return res.status(403).json({ message: "Usuário não associado a um restaurante" });
      }
      
      const restaurantId = currentUser.restaurantId!;
      
      await storage.endTableSession(restaurantId, req.params.id);
      
      const updatedTable = await storage.getTableById(req.params.id);
      broadcastToClients({ type: 'table_session_ended', data: updatedTable });
      
      res.json({ success: true, table: updatedTable });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to end table session" });
    }
  });

  app.post("/api/tables/:id/payments", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user as User;
      if (!currentUser.restaurantId && currentUser.role !== 'superadmin') {
        return res.status(403).json({ message: "Usuário não associado a um restaurante" });
      }
      
      const restaurantId = currentUser.restaurantId!;
      const { amount, paymentMethod, notes, sessionId } = req.body;
      
      const table = await storage.getTableById(req.params.id);
      if (!table) {
        return res.status(404).json({ message: "Mesa não encontrada" });
      }
      
      const payment = await storage.addTablePayment(restaurantId, {
        tableId: req.params.id,
        sessionId: sessionId || table.currentSessionId,
        amount,
        paymentMethod,
        notes,
      });
      
      broadcastToClients({ type: 'table_payment_added', data: payment });
      
      res.json(payment);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to add payment" });
    }
  });

  app.get("/api/tables/:id/sessions", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user as User;
      if (!currentUser.restaurantId && currentUser.role !== 'superadmin') {
        return res.status(403).json({ message: "Usuário não associado a um restaurante" });
      }
      
      const restaurantId = currentUser.restaurantId!;
      const sessions = await storage.getTableSessions(restaurantId, req.params.id);
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch table sessions" });
    }
  });

  app.get("/api/tables/:id/payments", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user as User;
      if (!currentUser.restaurantId && currentUser.role !== 'superadmin') {
        return res.status(403).json({ message: "Usuário não associado a um restaurante" });
      }
      
      const restaurantId = currentUser.restaurantId!;
      const payments = await storage.getTablePayments(restaurantId, req.params.id);
      res.json(payments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch table payments" });
    }
  });

  // ===== FINANCIAL ROUTES (Admin Only) =====
  // 
  // IMPORTANT: Financial routes are designed ONLY for admins with restaurantId.
  // ALL financial routes block superadmins and users without restaurantId.
  // The financial management UI is hidden from superadmins in the frontend.
  //
  // SECURITY: All routes use ONLY currentUser.restaurantId - NEVER accept from request.
  // This prevents cross-tenant data leakage and ensures proper tenant isolation.
  //
  // Routes:
  // - GET /api/financial-shifts - List shifts for current user's restaurant
  // - GET /api/financial-shifts/:id - Get specific shift (validates ownership)
  // - POST /api/financial-shifts - Create new shift
  // - PATCH /api/financial-shifts/:id/close - Close shift (validates ownership)
  // - GET /api/financial-events - List financial events
  // - POST /api/financial-events - Create financial event
  // - GET /api/order-adjustments/:orderId - Get order adjustments
  // - POST /api/order-adjustments - Create order adjustment
  // - GET /api/payment-events - List payment events
  // - GET /api/report-aggregations - Get report aggregations
  
  // Financial Shifts
  app.get("/api/financial-shifts", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user as User;
      
      // Only admins with restaurantId can access financial data
      // Superadmins are blocked as they lack restaurant context
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Acesso negado. Funcionalidades financeiras requerem associação a um restaurante." });
      }
      
      // SECURITY: Always use currentUser.restaurantId - never accept from request
      const restaurantId = currentUser.restaurantId;
      const branchId = currentUser.activeBranchId || null;
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
      const shifts = await storage.getAllShifts(restaurantId, branchId, startDate, endDate);
      res.json(shifts);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar turnos" });
    }
  });

  app.get("/api/financial-shifts/:id", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user as User;
      
      // Only admins with restaurantId can access financial data
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Acesso negado. Funcionalidades financeiras requerem associação a um restaurante." });
      }
      
      const shift = await storage.getShiftById(req.params.id);
      
      if (!shift) {
        return res.status(404).json({ message: "Turno não encontrado" });
      }
      
      // SECURITY: Validate restaurant access
      if (shift.restaurantId !== currentUser.restaurantId) {
        return res.status(403).json({ message: "Acesso negado a este turno" });
      }
      
      res.json(shift);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar turno" });
    }
  });

  app.post("/api/financial-shifts", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user as User;
      
      // Only admins with restaurantId can access financial data
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Acesso negado. Funcionalidades financeiras requerem associação a um restaurante." });
      }
      
      // SECURITY: Always use currentUser.restaurantId - never accept from request
      const restaurantId = currentUser.restaurantId;
      const branchId = currentUser.activeBranchId || null;
      const { openingBalance, notes } = req.body;
      
      const shift = await storage.createShift(restaurantId, branchId, {
        operatorId: currentUser.id,
        branchId,
        openingBalance: openingBalance || '0',
        notes,
      });
      
      res.json(shift);
    } catch (error) {
      res.status(500).json({ message: "Erro ao criar turno" });
    }
  });

  app.patch("/api/financial-shifts/:id/close", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user as User;
      
      // Only admins with restaurantId can access financial data
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Acesso negado. Funcionalidades financeiras requerem associação a um restaurante." });
      }
      
      const { closingBalance, notes } = req.body;
      
      if (!closingBalance) {
        return res.status(400).json({ message: "Saldo de fechamento é obrigatório" });
      }
      
      // SECURITY: Validate restaurant access before closing
      const shift = await storage.getShiftById(req.params.id);
      if (!shift) {
        return res.status(404).json({ message: "Turno não encontrado" });
      }
      
      if (shift.restaurantId !== currentUser.restaurantId) {
        return res.status(403).json({ message: "Acesso negado a este turno" });
      }
      
      const closedShift = await storage.closeShift(req.params.id, closingBalance, notes);
      res.json(closedShift);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Erro ao fechar turno" });
    }
  });

  // Financial Events
  app.get("/api/financial-events", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user as User;
      
      // Only admins with restaurantId can access financial data
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Acesso negado. Funcionalidades financeiras requerem associação a um restaurante." });
      }
      
      // SECURITY: Always use currentUser.restaurantId - never accept from request
      const restaurantId = currentUser.restaurantId;
      const branchId = currentUser.activeBranchId || null;
      
      const filters: any = {};
      if (req.query.sessionId) filters.sessionId = req.query.sessionId as string;
      if (req.query.orderId) filters.orderId = req.query.orderId as string;
      if (req.query.tableId) filters.tableId = req.query.tableId as string;
      if (req.query.eventType) filters.eventType = req.query.eventType as string;
      if (req.query.startDate) filters.startDate = new Date(req.query.startDate as string);
      if (req.query.endDate) filters.endDate = new Date(req.query.endDate as string);
      
      const events = await storage.getFinancialEvents(restaurantId, branchId, filters);
      res.json(events);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar eventos financeiros" });
    }
  });

  app.post("/api/financial-events", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user as User;
      
      // Only admins with restaurantId can access financial data
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Acesso negado. Funcionalidades financeiras requerem associação a um restaurante." });
      }
      
      // SECURITY: Always use currentUser.restaurantId - never accept from request
      const restaurantId = currentUser.restaurantId;
      const event = await storage.createFinancialEvent(restaurantId, req.body);
      res.json(event);
    } catch (error) {
      res.status(500).json({ message: "Erro ao criar evento financeiro" });
    }
  });

  // Order Adjustments
  app.get("/api/order-adjustments/:orderId", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user as User;
      
      // Only admins with restaurantId can access financial data
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Acesso negado. Funcionalidades financeiras requerem associação a um restaurante." });
      }
      
      const adjustments = await storage.getOrderAdjustments(req.params.orderId);
      res.json(adjustments);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar ajustes" });
    }
  });

  app.post("/api/order-adjustments", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user as User;
      
      // Only admins with restaurantId can access financial data
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Acesso negado. Funcionalidades financeiras requerem associação a um restaurante." });
      }
      
      // SECURITY: Always use currentUser.restaurantId - never accept from request
      const restaurantId = currentUser.restaurantId;
      const adjustment = await storage.createOrderAdjustment(restaurantId, {
        ...req.body,
        appliedBy: currentUser.id,
      });
      res.json(adjustment);
    } catch (error) {
      res.status(500).json({ message: "Erro ao criar ajuste" });
    }
  });

  // Payment Events
  app.get("/api/payment-events", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user as User;
      
      // Only admins with restaurantId can access financial data
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Acesso negado. Funcionalidades financeiras requerem associação a um restaurante." });
      }
      
      // SECURITY: Always use currentUser.restaurantId - never accept from request
      const restaurantId = currentUser.restaurantId;
      
      const filters: any = {};
      if (req.query.orderId) filters.orderId = req.query.orderId as string;
      if (req.query.sessionId) filters.sessionId = req.query.sessionId as string;
      if (req.query.paymentMethod) filters.paymentMethod = req.query.paymentMethod as string;
      if (req.query.startDate) filters.startDate = new Date(req.query.startDate as string);
      if (req.query.endDate) filters.endDate = new Date(req.query.endDate as string);
      
      const paymentEvents = await storage.getPaymentEvents(restaurantId, filters);
      res.json(paymentEvents);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar eventos de pagamento" });
    }
  });

  // Report Aggregations
  app.get("/api/report-aggregations", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user as User;
      
      // Only admins with restaurantId can access financial data
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Acesso negado. Funcionalidades financeiras requerem associação a um restaurante." });
      }
      
      // SECURITY: Always use currentUser.restaurantId - never accept from request
      const restaurantId = currentUser.restaurantId;
      const branchId = currentUser.activeBranchId || null;
      
      const periodType = (req.query.periodType as 'daily' | 'weekly' | 'monthly') || 'daily';
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
      
      const aggregations = await storage.getReportAggregations(
        restaurantId,
        branchId,
        periodType,
        startDate,
        endDate
      );
      res.json(aggregations);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar agregações de relatório" });
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
      const branchId = currentUser.activeBranchId || null;
      const categories = await storage.getCategories(restaurantId, branchId);
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.post("/api/categories", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user as User;
      if (!currentUser.restaurantId && currentUser.role !== 'superadmin') {
        return res.status(403).json({ message: "Usuário não associado a um restaurante" });
      }
      
      const restaurantId = currentUser.restaurantId!;
      const branchId = currentUser.activeBranchId || null;
      const data = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(restaurantId, branchId, data);
      res.json(category);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
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
      const branchId = currentUser.activeBranchId || null;
      const menuItems = await storage.getMenuItems(restaurantId, branchId);
      res.json(menuItems);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch menu items" });
    }
  });

  app.post("/api/menu-items", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user as User;
      if (!currentUser.restaurantId && currentUser.role !== 'superadmin') {
        return res.status(403).json({ message: "Usuário não associado a um restaurante" });
      }
      
      const restaurantId = currentUser.restaurantId!;
      const branchId = currentUser.activeBranchId || null;
      const data = insertMenuItemSchema.parse(req.body);
      const menuItem = await storage.createMenuItem(restaurantId, branchId, data);
      res.json(menuItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
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
      res.status(500).json({ message: "Failed to delete menu item" });
    }
  });

  // ===== OPTION GROUP ROUTES (Admin Only) =====
  app.get("/api/menu-items/:menuItemId/option-groups", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user as User;
      if (!currentUser.restaurantId && currentUser.role !== 'superadmin') {
        return res.status(403).json({ message: "Usuário não associado a um restaurante" });
      }
      
      const menuItem = await storage.getMenuItemById(req.params.menuItemId);
      if (!menuItem) {
        return res.status(404).json({ message: "Prato não encontrado" });
      }
      if (menuItem.restaurantId !== currentUser.restaurantId) {
        return res.status(403).json({ message: "Não autorizado: Este prato não pertence ao seu restaurante" });
      }
      
      const groups = await storage.getOptionGroupsByMenuItem(req.params.menuItemId);
      res.json(groups);
    } catch (error) {
      console.error('Error fetching option groups:', error);
      res.status(500).json({ message: "Erro ao buscar grupos de opções", error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  app.post("/api/menu-items/:menuItemId/option-groups", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user as User;
      if (!currentUser.restaurantId && currentUser.role !== 'superadmin') {
        return res.status(403).json({ message: "Usuário não associado a um restaurante" });
      }
      
      const menuItem = await storage.getMenuItemById(req.params.menuItemId);
      if (!menuItem) {
        return res.status(404).json({ message: "Prato não encontrado" });
      }
      if (menuItem.restaurantId !== currentUser.restaurantId) {
        return res.status(403).json({ message: "Não autorizado: Este prato não pertence ao seu restaurante" });
      }
      
      const data = insertOptionGroupSchema.parse(req.body);
      const group = await storage.createOptionGroup(req.params.menuItemId, data);
      res.json(group);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error('Validation error creating option group:', error.errors);
        return res.status(400).json({ message: error.errors[0].message, errors: error.errors });
      }
      console.error('Error creating option group:', error);
      res.status(500).json({ message: "Erro ao criar grupo de opções", error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  app.patch("/api/option-groups/:id", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user as User;
      if (!currentUser.restaurantId && currentUser.role !== 'superadmin') {
        return res.status(403).json({ message: "Usuário não associado a um restaurante" });
      }
      
      const group = await storage.getOptionGroupById(req.params.id);
      if (!group) {
        return res.status(404).json({ message: "Grupo de opções não encontrado" });
      }
      
      const menuItem = await storage.getMenuItemById(group.menuItemId);
      if (!menuItem) {
        return res.status(404).json({ message: "Prato não encontrado" });
      }
      if (menuItem.restaurantId !== currentUser.restaurantId) {
        return res.status(403).json({ message: "Não autorizado: Este grupo não pertence ao seu restaurante" });
      }
      
      const data = updateOptionGroupSchema.parse(req.body);
      const updatedGroup = await storage.updateOptionGroup(req.params.id, data);
      res.json(updatedGroup);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Erro ao atualizar grupo de opções" });
    }
  });

  app.delete("/api/option-groups/:id", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user as User;
      if (!currentUser.restaurantId && currentUser.role !== 'superadmin') {
        return res.status(403).json({ message: "Usuário não associado a um restaurante" });
      }
      
      const group = await storage.getOptionGroupById(req.params.id);
      if (!group) {
        return res.status(404).json({ message: "Grupo de opções não encontrado" });
      }
      
      const menuItem = await storage.getMenuItemById(group.menuItemId);
      if (!menuItem) {
        return res.status(404).json({ message: "Prato não encontrado" });
      }
      if (menuItem.restaurantId !== currentUser.restaurantId) {
        return res.status(403).json({ message: "Não autorizado: Este grupo não pertence ao seu restaurante" });
      }
      
      await storage.deleteOptionGroup(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Erro ao excluir grupo de opções" });
    }
  });

  // ===== OPTION ROUTES (Admin Only) =====
  app.get("/api/option-groups/:groupId/options", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user as User;
      if (!currentUser.restaurantId && currentUser.role !== 'superadmin') {
        return res.status(403).json({ message: "Usuário não associado a um restaurante" });
      }
      
      const group = await storage.getOptionGroupById(req.params.groupId);
      if (!group) {
        return res.status(404).json({ message: "Grupo de opções não encontrado" });
      }
      
      const menuItem = await storage.getMenuItemById(group.menuItemId);
      if (!menuItem) {
        return res.status(404).json({ message: "Prato não encontrado" });
      }
      if (menuItem.restaurantId !== currentUser.restaurantId) {
        return res.status(403).json({ message: "Não autorizado: Este grupo não pertence ao seu restaurante" });
      }
      
      const options = await storage.getOptionsByGroupId(req.params.groupId);
      res.json(options);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar opções" });
    }
  });

  app.post("/api/option-groups/:groupId/options", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user as User;
      if (!currentUser.restaurantId && currentUser.role !== 'superadmin') {
        return res.status(403).json({ message: "Usuário não associado a um restaurante" });
      }
      
      const group = await storage.getOptionGroupById(req.params.groupId);
      if (!group) {
        return res.status(404).json({ message: "Grupo de opções não encontrado" });
      }
      
      const menuItem = await storage.getMenuItemById(group.menuItemId);
      if (!menuItem) {
        return res.status(404).json({ message: "Prato não encontrado" });
      }
      if (menuItem.restaurantId !== currentUser.restaurantId) {
        return res.status(403).json({ message: "Não autorizado: Este grupo não pertence ao seu restaurante" });
      }
      
      const data = insertOptionSchema.parse(req.body);
      const option = await storage.createOption(req.params.groupId, data);
      res.json(option);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Erro ao criar opção" });
    }
  });

  app.patch("/api/options/:id", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user as User;
      if (!currentUser.restaurantId && currentUser.role !== 'superadmin') {
        return res.status(403).json({ message: "Usuário não associado a um restaurante" });
      }
      
      const option = await storage.getOptionById(req.params.id);
      if (!option) {
        return res.status(404).json({ message: "Opção não encontrada" });
      }
      
      const group = await storage.getOptionGroupById(option.optionGroupId);
      if (!group) {
        return res.status(404).json({ message: "Grupo de opções não encontrado" });
      }
      
      const menuItem = await storage.getMenuItemById(group.menuItemId);
      if (!menuItem) {
        return res.status(404).json({ message: "Prato não encontrado" });
      }
      if (menuItem.restaurantId !== currentUser.restaurantId) {
        return res.status(403).json({ message: "Não autorizado: Esta opção não pertence ao seu restaurante" });
      }
      
      const data = updateOptionSchema.parse(req.body);
      const updatedOption = await storage.updateOption(req.params.id, data);
      res.json(updatedOption);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Erro ao atualizar opção" });
    }
  });

  app.delete("/api/options/:id", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user as User;
      if (!currentUser.restaurantId && currentUser.role !== 'superadmin') {
        return res.status(403).json({ message: "Usuário não associado a um restaurante" });
      }
      
      const option = await storage.getOptionById(req.params.id);
      if (!option) {
        return res.status(404).json({ message: "Opção não encontrada" });
      }
      
      const group = await storage.getOptionGroupById(option.optionGroupId);
      if (!group) {
        return res.status(404).json({ message: "Grupo de opções não encontrado" });
      }
      
      const menuItem = await storage.getMenuItemById(group.menuItemId);
      if (!menuItem) {
        return res.status(404).json({ message: "Prato não encontrado" });
      }
      if (menuItem.restaurantId !== currentUser.restaurantId) {
        return res.status(403).json({ message: "Não autorizado: Esta opção não pertence ao seu restaurante" });
      }
      
      await storage.deleteOption(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Erro ao excluir opção" });
    }
  });

  // ===== ORDER ROUTES =====
  app.get("/api/orders/kitchen", isAuthenticated, async (req, res) => {
    try {
      const currentUser = req.user as User;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usuário não associado a um restaurante" });
      }
      
      const restaurantId = currentUser.restaurantId;
      const branchId = currentUser.activeBranchId || null;
      const orders = await storage.getKitchenOrders(restaurantId, branchId);
      res.json(orders);
    } catch (error) {
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
      const branchId = currentUser.activeBranchId || null;
      const orders = await storage.getRecentOrders(restaurantId, branchId, 10);
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch recent orders" });
    }
  });

  app.get("/api/orders", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user as User;
      if (!currentUser.restaurantId && currentUser.role !== 'superadmin') {
        return res.status(403).json({ message: "Usuário não associado a um restaurante" });
      }
      
      const restaurantId = currentUser.restaurantId!;
      const branchId = currentUser.activeBranchId || null;
      const orders = await storage.getKitchenOrders(restaurantId, branchId);
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  // Professional order creation route (for POS/PDV - Admin only)
  // This route requires admin authentication and automatically sets createdBy
  // Admins have access to advanced controls (discounts, service charges, payment methods, etc.)
  app.post("/api/orders", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user as User;
      const { items, ...orderData } = req.body;
      
      console.log('Creating order with data:', JSON.stringify({ orderData, items }, null, 2));
      
      // Automatically set createdBy to track which admin created the order
      const validatedOrder = insertOrderSchema.parse({
        ...orderData,
        createdBy: currentUser.id,
      });
      const validatedItems = z.array(publicOrderItemSchema).parse(items);

      const order = await storage.createOrder(validatedOrder, validatedItems);
      
      // Broadcast new order to WebSocket clients
      broadcastToClients({ type: 'new_order', data: order });

      res.json(order);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error('Validation error:', error.errors);
        const firstError = error.errors[0];
        const field = firstError.path.join('.');
        return res.status(400).json({ 
          message: `${field}: ${firstError.message}`,
          errors: error.errors 
        });
      }
      console.error('Order creation error:', error);
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
      
      if (status === 'servido' && order.tableId) {
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
      res.status(500).json({ message: "Failed to update order status" });
    }
  });

  // Checkout routes
  app.get("/api/orders/:id", isAuthenticated, async (req, res) => {
    try {
      const currentUser = req.user as User;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usuário não associado a um restaurante" });
      }
      
      const restaurantId = currentUser.restaurantId;
      const order = await storage.getOrderById(restaurantId, req.params.id);
      
      if (!order) {
        return res.status(404).json({ message: "Pedido não encontrado" });
      }

      res.json(order);
    } catch (error) {
      console.error('Error fetching order:', error);
      res.status(500).json({ message: "Erro ao buscar pedido" });
    }
  });

  app.put("/api/orders/:id/metadata", isAuthenticated, async (req, res) => {
    try {
      const currentUser = req.user as User;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usuário não associado a um restaurante" });
      }
      
      const restaurantId = currentUser.restaurantId;
      const order = await storage.getOrderById(restaurantId, req.params.id);
      
      if (!order) {
        return res.status(404).json({ message: "Pedido não encontrado" });
      }

      if (order.status === 'servido') {
        return res.status(400).json({ message: "Não é possível editar pedido já servido" });
      }

      const data = updateOrderMetadataSchema.parse(req.body);
      const updated = await storage.updateOrderMetadata(restaurantId, req.params.id, data);
      
      broadcastToClients({ 
        type: 'order_updated', 
        data: { id: updated.id }
      });

      res.json(updated);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      console.error('Error updating order metadata:', error);
      res.status(500).json({ message: "Erro ao atualizar metadados do pedido" });
    }
  });

  app.post("/api/orders/:id/items", isAuthenticated, async (req, res) => {
    try {
      const currentUser = req.user as User;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usuário não associado a um restaurante" });
      }
      
      const restaurantId = currentUser.restaurantId;
      const order = await storage.getOrderById(restaurantId, req.params.id);
      
      if (!order) {
        return res.status(404).json({ message: "Pedido não encontrado" });
      }

      if (order.status === 'servido') {
        return res.status(400).json({ message: "Não é possível adicionar itens a pedido já servido" });
      }

      const item = publicOrderItemSchema.parse(req.body);
      const created = await storage.addOrderItem(restaurantId, req.params.id, item);
      
      broadcastToClients({ 
        type: 'order_items_changed', 
        data: { orderId: req.params.id }
      });

      res.json(created);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      console.error('Error adding order item:', error);
      res.status(500).json({ message: "Erro ao adicionar item ao pedido" });
    }
  });

  app.put("/api/orders/:id/items/:itemId", isAuthenticated, async (req, res) => {
    try {
      const currentUser = req.user as User;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usuário não associado a um restaurante" });
      }
      
      const restaurantId = currentUser.restaurantId;
      const order = await storage.getOrderById(restaurantId, req.params.id);
      
      if (!order) {
        return res.status(404).json({ message: "Pedido não encontrado" });
      }

      if (order.status === 'servido') {
        return res.status(400).json({ message: "Não é possível editar pedido já servido" });
      }

      const { quantity } = updateOrderItemQuantitySchema.parse(req.body);
      const updated = await storage.updateOrderItemQuantity(
        restaurantId, 
        req.params.id, 
        req.params.itemId, 
        quantity
      );
      
      broadcastToClients({ 
        type: 'order_items_changed', 
        data: { orderId: req.params.id }
      });

      res.json(updated);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      console.error('Error updating order item:', error);
      res.status(500).json({ message: "Erro ao atualizar item do pedido" });
    }
  });

  app.delete("/api/orders/:id/items/:itemId", isAuthenticated, async (req, res) => {
    try {
      const currentUser = req.user as User;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usuário não associado a um restaurante" });
      }
      
      const restaurantId = currentUser.restaurantId;
      const order = await storage.getOrderById(restaurantId, req.params.id);
      
      if (!order) {
        return res.status(404).json({ message: "Pedido não encontrado" });
      }

      if (order.status === 'servido') {
        return res.status(400).json({ message: "Não é possível remover itens de pedido já servido" });
      }

      await storage.removeOrderItem(restaurantId, req.params.id, req.params.itemId);
      
      broadcastToClients({ 
        type: 'order_items_changed', 
        data: { orderId: req.params.id }
      });

      res.json({ success: true });
    } catch (error) {
      console.error('Error removing order item:', error);
      res.status(500).json({ message: "Erro ao remover item do pedido" });
    }
  });

  app.put("/api/orders/:id/discount", isAuthenticated, async (req, res) => {
    try {
      const currentUser = req.user as User;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usuário não associado a um restaurante" });
      }
      
      const restaurantId = currentUser.restaurantId;
      const order = await storage.getOrderById(restaurantId, req.params.id);
      
      if (!order) {
        return res.status(404).json({ message: "Pedido não encontrado" });
      }

      if (order.status === 'servido') {
        return res.status(400).json({ message: "Não é possível aplicar desconto a pedido já servido" });
      }

      const { discount, discountType } = applyDiscountSchema.parse(req.body);
      const updated = await storage.applyDiscount(restaurantId, req.params.id, discount, discountType);
      
      broadcastToClients({ 
        type: 'order_totals_changed', 
        data: { orderId: req.params.id, totalAmount: updated.totalAmount }
      });

      res.json(updated);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      console.error('Error applying discount:', error);
      res.status(500).json({ message: "Erro ao aplicar desconto" });
    }
  });

  app.put("/api/orders/:id/service-charge", isAuthenticated, async (req, res) => {
    try {
      const currentUser = req.user as User;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usuário não associado a um restaurante" });
      }
      
      const restaurantId = currentUser.restaurantId;
      const order = await storage.getOrderById(restaurantId, req.params.id);
      
      if (!order) {
        return res.status(404).json({ message: "Pedido não encontrado" });
      }

      if (order.status === 'servido') {
        return res.status(400).json({ message: "Não é possível aplicar taxa de serviço a pedido já servido" });
      }

      const { serviceCharge, serviceName } = applyServiceChargeSchema.parse(req.body);
      const updated = await storage.applyServiceCharge(restaurantId, req.params.id, serviceCharge, serviceName);
      
      broadcastToClients({ 
        type: 'order_totals_changed', 
        data: { orderId: req.params.id, totalAmount: updated.totalAmount }
      });

      res.json(updated);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      console.error('Error applying service charge:', error);
      res.status(500).json({ message: "Erro ao aplicar taxa de serviço" });
    }
  });

  app.put("/api/orders/:id/delivery-fee", isAuthenticated, async (req, res) => {
    try {
      const currentUser = req.user as User;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usuário não associado a um restaurante" });
      }
      
      const restaurantId = currentUser.restaurantId;
      const order = await storage.getOrderById(restaurantId, req.params.id);
      
      if (!order) {
        return res.status(404).json({ message: "Pedido não encontrado" });
      }

      if (order.status === 'servido') {
        return res.status(400).json({ message: "Não é possível aplicar taxa de entrega a pedido já servido" });
      }

      const { deliveryFee } = applyDeliveryFeeSchema.parse(req.body);
      const updated = await storage.applyDeliveryFee(restaurantId, req.params.id, deliveryFee);
      
      broadcastToClients({ 
        type: 'order_totals_changed', 
        data: { orderId: req.params.id, totalAmount: updated.totalAmount }
      });

      res.json(updated);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      console.error('Error applying delivery fee:', error);
      res.status(500).json({ message: "Erro ao aplicar taxa de entrega" });
    }
  });

  app.put("/api/orders/:id/packaging-fee", isAuthenticated, async (req, res) => {
    try {
      const currentUser = req.user as User;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usuário não associado a um restaurante" });
      }
      
      const restaurantId = currentUser.restaurantId;
      const order = await storage.getOrderById(restaurantId, req.params.id);
      
      if (!order) {
        return res.status(404).json({ message: "Pedido não encontrado" });
      }

      if (order.status === 'servido') {
        return res.status(400).json({ message: "Não é possível aplicar taxa de embalagem a pedido já servido" });
      }

      const { packagingFee } = applyPackagingFeeSchema.parse(req.body);
      const updated = await storage.applyPackagingFee(restaurantId, req.params.id, packagingFee);
      
      broadcastToClients({ 
        type: 'order_totals_changed', 
        data: { orderId: req.params.id, totalAmount: updated.totalAmount }
      });

      res.json(updated);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      console.error('Error applying packaging fee:', error);
      res.status(500).json({ message: "Erro ao aplicar taxa de embalagem" });
    }
  });

  app.post("/api/orders/:id/payments", isAuthenticated, async (req, res) => {
    try {
      const currentUser = req.user as User;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usuário não associado a um restaurante" });
      }
      
      const restaurantId = currentUser.restaurantId;
      const order = await storage.getOrderById(restaurantId, req.params.id);
      
      if (!order) {
        return res.status(404).json({ message: "Pedido não encontrado" });
      }

      if (order.status === 'servido') {
        return res.status(400).json({ message: "Não é possível registrar pagamento para pedido já servido" });
      }

      const payment = recordPaymentSchema.parse(req.body);
      const updated = await storage.recordPayment(restaurantId, req.params.id, payment);
      
      if (updated.paymentStatus === 'pago') {
        broadcastToClients({ 
          type: 'order_payment_completed', 
          data: { 
            orderId: req.params.id, 
            totalAmount: updated.totalAmount,
            paymentMethod: updated.paymentMethod
          }
        });
      } else {
        broadcastToClients({ 
          type: 'order_payment_recorded', 
          data: { 
            orderId: req.params.id, 
            paidAmount: updated.paidAmount,
            paymentStatus: updated.paymentStatus
          }
        });
      }

      res.json(updated);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      console.error('Error recording payment:', error);
      res.status(500).json({ message: "Erro ao registrar pagamento" });
    }
  });

  app.get("/api/orders/:id/print", isAuthenticated, async (req, res) => {
    try {
      const currentUser = req.user as User;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usuário não associado a um restaurante" });
      }
      
      const restaurantId = currentUser.restaurantId;
      const branchId = currentUser.activeBranchId || null;
      
      const allOrders = await storage.getKitchenOrders(restaurantId, branchId);
      const order = allOrders.find(o => o.id === req.params.id);
      
      if (!order) {
        return res.status(404).json({ message: "Pedido não encontrado" });
      }

      const restaurant = await storage.getRestaurantById(restaurantId);
      if (!restaurant) {
        return res.status(404).json({ message: "Restaurante não encontrado" });
      }

      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=pedido-${order.id.slice(0, 8)}.pdf`);
      
      doc.pipe(res);

      const statusLabels: { [key: string]: string } = {
        'pendente': 'Pendente',
        'em_preparo': 'Em Preparo',
        'pronto': 'Pronto',
        'servido': 'Servido'
      };

      const typeLabels: { [key: string]: string } = {
        'mesa': 'Mesa',
        'delivery': 'Delivery',
        'takeout': 'Retirada'
      };

      doc.fontSize(20).font('Helvetica-Bold').text(restaurant.name.toUpperCase(), { align: 'center' });
      doc.fontSize(10).font('Helvetica').text('COMANDA DE PEDIDO', { align: 'center' });
      doc.moveDown(0.5);
      
      doc.fontSize(8).text('═'.repeat(85), { align: 'center' });
      doc.moveDown(0.5);

      doc.fontSize(12).font('Helvetica-Bold').text(`Pedido #${order.id.slice(0, 8).toUpperCase()}`, { align: 'left' });
      doc.fontSize(10).font('Helvetica');
      
      const orderDate = new Date(order.createdAt!);
      const dateStr = orderDate.toLocaleDateString('pt-AO', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
      });
      const timeStr = orderDate.toLocaleTimeString('pt-AO', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      
      doc.text(`Data: ${dateStr}  |  Hora: ${timeStr}`);
      doc.text(`Tipo: ${typeLabels[order.orderType] || order.orderType}`);
      doc.text(`Status: ${statusLabels[order.status] || order.status}`);
      
      if (order.table) {
        doc.text(`Mesa: ${order.table.number}`);
      }
      
      if (order.customerName) {
        doc.text(`Cliente: ${order.customerName}`);
      }
      
      if (order.customerPhone) {
        doc.text(`Telefone: ${order.customerPhone}`);
      }
      
      doc.moveDown(0.5);
      doc.fontSize(8).text('─'.repeat(85));
      doc.moveDown(0.5);

      doc.fontSize(11).font('Helvetica-Bold').text('ITENS DO PEDIDO');
      doc.moveDown(0.5);

      let totalAmount = 0;

      order.orderItems.forEach((item, index) => {
        const itemTotal = parseFloat(item.price) * item.quantity;
        totalAmount += itemTotal;
        
        doc.fontSize(10).font('Helvetica-Bold').text(`${item.quantity}x ${item.menuItem.name}`);
        doc.fontSize(9).font('Helvetica')
          .text(`   Kz ${parseFloat(item.price).toFixed(2)} cada`, { continued: true })
          .text(`Kz ${itemTotal.toFixed(2)}`, { align: 'right' });
        
        if (item.notes) {
          doc.fontSize(8).fillColor('#666666').text(`   Obs: ${item.notes}`);
          doc.fillColor('#000000');
        }
        
        if (index < order.orderItems.length - 1) {
          doc.moveDown(0.3);
        }
      });

      doc.moveDown(0.5);
      doc.fontSize(8).text('─'.repeat(85));
      doc.moveDown(0.5);

      doc.fontSize(12).font('Helvetica-Bold')
        .text('TOTAL:', { continued: true })
        .text(`Kz ${totalAmount.toFixed(2)}`, { align: 'right' });

      doc.moveDown(1);
      doc.fontSize(8).text('═'.repeat(85), { align: 'center' });
      doc.moveDown(0.5);

      doc.fontSize(8).font('Helvetica').fillColor('#666666')
        .text('Documento gerado automaticamente pelo sistema NaBancada', { align: 'center' });

      doc.end();
    } catch (error) {
      res.status(500).json({ message: "Erro ao gerar PDF do pedido" });
    }
  });

  app.delete("/api/orders/:id", isAuthenticated, async (req, res) => {
    try {
      const currentUser = req.user as User;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usuário não associado a um restaurante" });
      }
      
      const restaurantId = currentUser.restaurantId;
      
      try {
        await storage.deleteOrder(restaurantId, req.params.id);
        
        broadcastToClients({ 
          type: 'order_deleted', 
          data: { orderId: req.params.id }
        });
        
        res.json({ message: "Pedido cancelado com sucesso" });
      } catch (error: any) {
        if (error.message === 'Order not found') {
          return res.status(404).json({ message: "Pedido não encontrado" });
        }
        if (error.message.includes('Unauthorized') || error.message.includes('not belong')) {
          return res.status(403).json({ message: "Não autorizado a cancelar este pedido" });
        }
        if (error.message === 'Cannot delete paid orders') {
          return res.status(400).json({ message: "Não é possível cancelar pedidos já pagos" });
        }
        throw error;
      }
    } catch (error: any) {
      console.error('Error deleting order:', error);
      res.status(500).json({ message: "Erro ao cancelar pedido" });
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
      const branchId = currentUser.activeBranchId || null;
      const stats = await storage.getTodayStats(restaurantId, branchId);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  app.get("/api/stats/custom-range", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user as User;
      if (!currentUser.restaurantId && currentUser.role !== 'superadmin') {
        return res.status(403).json({ message: "Usuário não associado a um restaurante" });
      }
      
      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(400).json({ message: "startDate e endDate são obrigatórios" });
      }

      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(startDate as string) || !dateRegex.test(endDate as string)) {
        return res.status(400).json({ message: "Formato de data inválido. Use YYYY-MM-DD" });
      }

      const start = new Date(startDate as string + 'T00:00:00.000Z');
      const end = new Date(endDate as string + 'T23:59:59.999Z');

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res.status(400).json({ message: "Datas inválidas" });
      }

      if (start > end) {
        return res.status(400).json({ message: "A data inicial deve ser anterior à data final" });
      }
      
      const restaurantId = currentUser.restaurantId!;
      const branchId = currentUser.activeBranchId || null;
      const stats = await storage.getCustomDateRangeStats(restaurantId, branchId, start, end);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch custom range stats" });
    }
  });

  app.get("/api/stats/kitchen", isAuthenticated, async (req, res) => {
    try {
      const currentUser = req.user as User;
      if (!currentUser.restaurantId && currentUser.role !== 'superadmin') {
        return res.status(403).json({ message: "Usuário não associado a um restaurante" });
      }
      
      const restaurantId = currentUser.restaurantId!;
      const branchId = currentUser.activeBranchId || null;
      const period = req.query.period as 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' || 'daily';
      if (!['daily', 'weekly', 'monthly', 'quarterly', 'yearly'].includes(period)) {
        return res.status(400).json({ message: "Invalid period. Must be one of: daily, weekly, monthly, quarterly, yearly" });
      }
      const stats = await storage.getKitchenStats(restaurantId, branchId, period);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch kitchen stats" });
    }
  });

  // ===== REPORTS ROUTES (Admin Only) =====
  app.get("/api/reports/sales", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user as User;
      
      let restaurantId: string;
      if (currentUser.role === 'superadmin') {
        const queryRestaurantId = req.query.restaurantId as string;
        if (!queryRestaurantId) {
          return res.status(400).json({ message: "Super admin deve fornecer restaurantId como query parameter" });
        }
        restaurantId = queryRestaurantId;
      } else {
        if (!currentUser.restaurantId) {
          return res.status(403).json({ message: "Usuário não associado a um restaurante" });
        }
        restaurantId = currentUser.restaurantId;
      }

      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(400).json({ message: "startDate e endDate são obrigatórios" });
      }

      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(startDate as string) || !dateRegex.test(endDate as string)) {
        return res.status(400).json({ message: "Formato de data inválido. Use YYYY-MM-DD" });
      }

      const start = new Date(startDate as string + 'T00:00:00.000Z');
      const end = new Date(endDate as string + 'T23:59:59.999Z');

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res.status(400).json({ message: "Datas inválidas" });
      }

      if (start > end) {
        return res.status(400).json({ message: "A data inicial deve ser anterior à data final" });
      }

      const branchId = currentUser.role === 'superadmin' ? null : (currentUser.activeBranchId || null);
      const report = await storage.getSalesReport(restaurantId, branchId, start, end);
      res.json(report);
    } catch (error) {
      res.status(500).json({ message: "Erro ao gerar relatório de vendas" });
    }
  });

  app.get("/api/reports/orders", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user as User;
      
      let restaurantId: string;
      if (currentUser.role === 'superadmin') {
        const queryRestaurantId = req.query.restaurantId as string;
        if (!queryRestaurantId) {
          return res.status(400).json({ message: "Super admin deve fornecer restaurantId como query parameter" });
        }
        restaurantId = queryRestaurantId;
      } else {
        if (!currentUser.restaurantId) {
          return res.status(403).json({ message: "Usuário não associado a um restaurante" });
        }
        restaurantId = currentUser.restaurantId;
      }

      const { startDate, endDate, status, orderType } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(400).json({ message: "startDate e endDate são obrigatórios" });
      }

      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(startDate as string) || !dateRegex.test(endDate as string)) {
        return res.status(400).json({ message: "Formato de data inválido. Use YYYY-MM-DD" });
      }

      const start = new Date(startDate as string + 'T00:00:00.000Z');
      const end = new Date(endDate as string + 'T23:59:59.999Z');

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res.status(400).json({ message: "Datas inválidas" });
      }

      if (start > end) {
        return res.status(400).json({ message: "A data inicial deve ser anterior à data final" });
      }

      const branchId = currentUser.role === 'superadmin' ? null : (currentUser.activeBranchId || null);
      const report = await storage.getOrdersReport(
        restaurantId, 
        branchId, 
        start, 
        end, 
        status as string | undefined, 
        orderType as string | undefined
      );
      res.json(report);
    } catch (error) {
      res.status(500).json({ message: "Erro ao gerar relatório de pedidos" });
    }
  });

  app.get("/api/reports/products", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user as User;
      
      let restaurantId: string;
      if (currentUser.role === 'superadmin') {
        const queryRestaurantId = req.query.restaurantId as string;
        if (!queryRestaurantId) {
          return res.status(400).json({ message: "Super admin deve fornecer restaurantId como query parameter" });
        }
        restaurantId = queryRestaurantId;
      } else {
        if (!currentUser.restaurantId) {
          return res.status(403).json({ message: "Usuário não associado a um restaurante" });
        }
        restaurantId = currentUser.restaurantId;
      }

      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(400).json({ message: "startDate e endDate são obrigatórios" });
      }

      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(startDate as string) || !dateRegex.test(endDate as string)) {
        return res.status(400).json({ message: "Formato de data inválido. Use YYYY-MM-DD" });
      }

      const start = new Date(startDate as string + 'T00:00:00.000Z');
      const end = new Date(endDate as string + 'T23:59:59.999Z');

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res.status(400).json({ message: "Datas inválidas" });
      }

      if (start > end) {
        return res.status(400).json({ message: "A data inicial deve ser anterior à data final" });
      }

      const branchId = currentUser.role === 'superadmin' ? null : (currentUser.activeBranchId || null);
      const report = await storage.getProductsReport(restaurantId, branchId, start, end);
      res.json(report);
    } catch (error) {
      res.status(500).json({ message: "Erro ao gerar relatório de produtos" });
    }
  });

  app.get("/api/reports/performance", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user as User;
      
      let restaurantId: string;
      if (currentUser.role === 'superadmin') {
        const queryRestaurantId = req.query.restaurantId as string;
        if (!queryRestaurantId) {
          return res.status(400).json({ message: "Super admin deve fornecer restaurantId como query parameter" });
        }
        restaurantId = queryRestaurantId;
      } else {
        if (!currentUser.restaurantId) {
          return res.status(403).json({ message: "Usuário não associado a um restaurante" });
        }
        restaurantId = currentUser.restaurantId;
      }

      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(400).json({ message: "startDate e endDate são obrigatórios" });
      }

      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(startDate as string) || !dateRegex.test(endDate as string)) {
        return res.status(400).json({ message: "Formato de data inválido. Use YYYY-MM-DD" });
      }

      const start = new Date(startDate as string + 'T00:00:00.000Z');
      const end = new Date(endDate as string + 'T23:59:59.999Z');

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res.status(400).json({ message: "Datas inválidas" });
      }

      if (start > end) {
        return res.status(400).json({ message: "A data inicial deve ser anterior à data final" });
      }

      const branchId = currentUser.role === 'superadmin' ? null : (currentUser.activeBranchId || null);
      const report = await storage.getPerformanceReport(restaurantId, branchId, start, end);
      res.json(report);
    } catch (error) {
      res.status(500).json({ message: "Erro ao gerar relatório de performance" });
    }
  });

  // ===== SALES/VENDAS API ROUTES =====
  
  // Get sales list with filters
  app.get("/api/sales", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user as User;
      
      let restaurantId: string;
      if (currentUser.role === 'superadmin') {
        const queryRestaurantId = req.query.restaurantId as string;
        if (!queryRestaurantId) {
          return res.status(400).json({ message: "Super admin deve fornecer restaurantId como query parameter" });
        }
        restaurantId = queryRestaurantId;
      } else {
        if (!currentUser.restaurantId) {
          return res.status(403).json({ message: "Usuário não associado a um restaurante" });
        }
        restaurantId = currentUser.restaurantId;
      }

      const { 
        dateFilter, 
        periodFilter, 
        orderBy, 
        orderStatus, 
        paymentStatus, 
        orderType,
        customFrom,
        customTo
      } = req.query;

      // Calculate date range based on filter
      let startDate: Date;
      let endDate: Date;

      if (dateFilter === 'custom' && customFrom) {
        startDate = new Date(customFrom as string);
        endDate = customTo ? new Date(customTo as string) : new Date();
      } else if (dateFilter === 'today') {
        startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date();
        endDate.setHours(23, 59, 59, 999);
      } else if (dateFilter === 'yesterday') {
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 1);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date();
        endDate.setDate(endDate.getDate() - 1);
        endDate.setHours(23, 59, 59, 999);
      } else if (dateFilter === '7days') {
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date();
        endDate.setHours(23, 59, 59, 999);
      } else if (dateFilter === '30days') {
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date();
        endDate.setHours(23, 59, 59, 999);
      } else {
        // Default to today
        startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date();
        endDate.setHours(23, 59, 59, 999);
      }

      // Note: Period filter doesn't modify the date range itself
      // It will be applied in the database query as an additional condition

      const branchId = currentUser.role === 'superadmin' ? null : (currentUser.activeBranchId || null);
      
      // Get orders with table info
      const orders = await storage.getOrdersForSales(
        restaurantId,
        branchId,
        startDate,
        endDate,
        orderStatus as string || 'all',
        paymentStatus as string || 'all',
        orderType as string || 'all',
        orderBy as string || 'created',
        periodFilter as string
      );

      res.json(orders);
    } catch (error) {
      console.error('Sales API error:', error);
      res.status(500).json({ message: "Erro ao buscar vendas" });
    }
  });

  // Get sales statistics/KPIs
  app.get("/api/sales/stats", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user as User;
      
      let restaurantId: string;
      if (currentUser.role === 'superadmin') {
        const queryRestaurantId = req.query.restaurantId as string;
        if (!queryRestaurantId) {
          return res.status(400).json({ message: "Super admin deve fornecer restaurantId como query parameter" });
        }
        restaurantId = queryRestaurantId;
      } else {
        if (!currentUser.restaurantId) {
          return res.status(403).json({ message: "Usuário não associado a um restaurante" });
        }
        restaurantId = currentUser.restaurantId;
      }

      const { 
        dateFilter, 
        periodFilter, 
        orderBy, 
        orderStatus, 
        paymentStatus, 
        orderType,
        customFrom,
        customTo
      } = req.query;

      // Calculate date range (same logic as above)
      let startDate: Date;
      let endDate: Date;

      if (dateFilter === 'custom' && customFrom) {
        startDate = new Date(customFrom as string);
        endDate = customTo ? new Date(customTo as string) : new Date();
      } else if (dateFilter === 'today') {
        startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date();
        endDate.setHours(23, 59, 59, 999);
      } else if (dateFilter === 'yesterday') {
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 1);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date();
        endDate.setDate(endDate.getDate() - 1);
        endDate.setHours(23, 59, 59, 999);
      } else if (dateFilter === '7days') {
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date();
        endDate.setHours(23, 59, 59, 999);
      } else if (dateFilter === '30days') {
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date();
        endDate.setHours(23, 59, 59, 999);
      } else {
        startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date();
        endDate.setHours(23, 59, 59, 999);
      }

      // Apply period filter
      if (periodFilter && periodFilter !== 'all') {
        if (periodFilter === 'morning') {
          startDate.setHours(6, 0, 0, 0);
          endDate.setHours(11, 59, 59, 999);
        } else if (periodFilter === 'afternoon') {
          startDate.setHours(12, 0, 0, 0);
          endDate.setHours(17, 59, 59, 999);
        } else if (periodFilter === 'night') {
          startDate.setHours(18, 0, 0, 0);
          endDate.setHours(23, 59, 59, 999);
        }
      }

      const branchId = currentUser.role === 'superadmin' ? null : (currentUser.activeBranchId || null);
      
      const stats = await storage.getSalesStats(
        restaurantId,
        branchId,
        startDate,
        endDate,
        orderStatus as string || 'all',
        paymentStatus as string || 'all',
        orderType as string || 'all',
        periodFilter as string
      );

      res.json(stats);
    } catch (error) {
      console.error('Sales stats API error:', error);
      res.status(500).json({ message: "Erro ao buscar estatísticas" });
    }
  });

  const httpServer = createServer(app);

  // Setup WebSocket server for real-time updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  const clients = new Set<WebSocket>();

  wss.on('connection', (ws) => {
    clients.add(ws);

    ws.on('close', () => {
      clients.delete(ws);
    });

    ws.on('error', (error) => {
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
