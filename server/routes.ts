// Blueprint: javascript_log_in_with_replit - Auth routes
// Blueprint: javascript_websocket - WebSocket implementation
import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, hashPassword } from "./auth";
import {
  checkCanAddCustomer,
  checkCanCreateCoupon,
  checkCanUseCouponSystem,
  checkCanAddInventoryItem,
  checkCanUseExpenseTracking,
  checkCanUseLoyaltyProgram,
  checkCanUseInventoryModule,
} from "./planLimits";
import passport from "passport";
import QRCode from "qrcode";
import PDFDocument from "pdfkit";
import multer from "multer";
import path from "path";
import { nanoid } from "nanoid";
import fs from "fs/promises";
import twilio from "twilio";

// Twilio WhatsApp configuration
const twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

const TWILIO_WHATSAPP_NUMBER = process.env.TWILIO_WHATSAPP_NUMBER || '';

async function sendWhatsAppOTP(phoneNumber: string, otpCode: string, restaurantName: string): Promise<boolean> {
  if (!twilioClient) {
    console.log('[WHATSAPP] Twilio not configured, skipping WhatsApp message');
    return false;
  }

  try {
    // Format phone number for WhatsApp (must include country code)
    let formattedPhone = phoneNumber.replace(/[\s\-\(\)]/g, '');
    
    // Add Angola country code if not present
    if (!formattedPhone.startsWith('+')) {
      if (formattedPhone.startsWith('244')) {
        formattedPhone = '+' + formattedPhone;
      } else {
        formattedPhone = '+244' + formattedPhone;
      }
    }

    // Format the WhatsApp 'from' number
    let fromNumber = TWILIO_WHATSAPP_NUMBER;
    if (!fromNumber.startsWith('whatsapp:')) {
      fromNumber = 'whatsapp:' + (fromNumber.startsWith('+') ? fromNumber : '+' + fromNumber);
    }

    const message = await twilioClient.messages.create({
      body: `🔐 *${restaurantName}*\n\nSeu código de verificação é: *${otpCode}*\n\nEste código expira em 10 minutos.\n\nSe você não solicitou este código, ignore esta mensagem.`,
      from: fromNumber,
      to: `whatsapp:${formattedPhone}`,
    });

    console.log(`[WHATSAPP] OTP sent successfully to ${formattedPhone}, SID: ${message.sid}`);
    return true;
  } catch (error: any) {
    console.error('[WHATSAPP] Error sending OTP:', error.message);
    return false;
  }
}
import {
  insertTableSchema,
  insertCategorySchema,
  updateCategorySchema,
  insertMenuItemSchema,
  updateMenuItemSchema,
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
  updateRestaurantAppearanceSchema,
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
  linkCustomerSchema,
  applyCouponSchema,
  redeemLoyaltyPointsSchema,
  cancelOrderSchema,
  insertInventoryCategorySchema,
  updateInventoryCategorySchema,
  insertMeasurementUnitSchema,
  updateMeasurementUnitSchema,
  insertInventoryItemSchema,
  updateInventoryItemSchema,
  insertStockMovementSchema,
  insertCustomerSchema,
  updateCustomerSchema,
  insertLoyaltyProgramSchema,
  insertCouponSchema,
  updateCouponSchema,
  resetRestaurantAdminCredentialsSchema,
  insertSubscriptionSchema,
  updateSubscriptionSchema,
  updateSubscriptionPlanSchema,
  superAdminCreateSubscriptionSchema,
  superAdminUpdateSubscriptionSchema,
  insertSubscriptionPaymentSchema,
  type User,
} from "@shared/schema";
import { z } from "zod";

// Configure multer for file uploads
const restaurantStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'client/public/uploads/restaurants');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `${nanoid()}-${Date.now()}${ext}`;
    cb(null, filename);
  }
});

const uploadRestaurantImage = multer({
  storage: restaurantStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Reject SVG explicitly due to XSS risks (can contain embedded scripts)
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    // Additional check to reject SVG and other dangerous types
    if (file.mimetype === 'image/svg+xml' || path.extname(file.originalname).toLowerCase() === '.svg') {
      return cb(new Error('Arquivos SVG não são permitidos por motivos de segurança'));
    }
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Apenas imagens são permitidas (jpeg, jpg, png, gif, webp)'));
    }
  }
});

// Configure multer for menu item (product) images
const menuItemStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'client/public/uploads/menu-items');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `${nanoid()}-${Date.now()}${ext}`;
    cb(null, filename);
  }
});

const uploadMenuItemImage = multer({
  storage: menuItemStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Reject SVG explicitly due to XSS risks (can contain embedded scripts)
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    // Additional check to reject SVG and other dangerous types
    if (file.mimetype === 'image/svg+xml' || path.extname(file.originalname).toLowerCase() === '.svg') {
      return cb(new Error('Arquivos SVG não são permitidos por motivos de segurança'));
    }
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Apenas imagens são permitidas (jpeg, jpg, png, gif, webp)'));
    }
  }
});

// Configure multer for profile images
const profileImageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'client/public/uploads/profile-images');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `${nanoid()}-${Date.now()}${ext}`;
    cb(null, filename);
  }
});

const uploadProfileImage = multer({
  storage: profileImageStorage,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB limit for profile pictures
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (file.mimetype === 'image/svg+xml' || path.extname(file.originalname).toLowerCase() === '.svg') {
      return cb(new Error('Arquivos SVG não são permitidos por motivos de segurança'));
    }
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Apenas imagens são permitidas (jpeg, jpg, png, gif, webp)'));
    }
  }
});

// Helper function to delete old image files
async function deleteOldImage(imageUrl: string | null | undefined, type: 'restaurants' | 'menu-items' | 'profile-images' = 'restaurants') {
  if (!imageUrl) return;
  
  try {
    // Extract filename from URL (e.g., /uploads/restaurants/abc-123.jpg -> abc-123.jpg)
    const filename = imageUrl.split('/').pop();
    if (!filename) return;
    
    const filePath = path.join(`client/public/uploads/${type}`, filename);
    await fs.unlink(filePath);
  } catch (error) {
    // Ignore errors (file might not exist)
    console.log('Could not delete old image:', error);
  }
}

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

      // Validate selected plan exists and is active
      const selectedPlan = await storage.getSubscriptionPlanById(data.planId);
      if (!selectedPlan) {
        return res.status(400).json({ message: "Plano de subscrição não encontrado" });
      }
      if (!selectedPlan.isActive) {
        return res.status(400).json({ message: "Plano de subscrição não está ativo" });
      }

      const { restaurant, adminUser } = await storage.createRestaurant(data);

      // Create subscription automatically with trial period
      try {
        const currentDate = new Date();
        const trialEndDate = new Date(currentDate);
        trialEndDate.setDate(trialEndDate.getDate() + 30); // 30 days trial

        await storage.createSubscription(restaurant.id, {
          planId: data.planId,
          status: 'trial',
          billingInterval: 'mensal', // Default to monthly
          currency: 'AOA', // Default to AOA
          currentPeriodStart: currentDate,
          currentPeriodEnd: trialEndDate,
          trialEnd: trialEndDate,
        });
      } catch (subscriptionError) {
        console.error('Error creating subscription for new restaurant:', subscriptionError);
        // Rollback: delete admin user and restaurant if subscription creation fails
        try {
          await storage.deleteUser(restaurant.id, adminUser.id);
          await storage.deleteRestaurant(restaurant.id);
        } catch (rollbackError) {
          console.error('Error during rollback:', rollbackError);
        }
        return res.status(500).json({ message: "Erro ao criar subscrição. Por favor, tente novamente." });
      }

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
      console.error('Restaurant registration error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      res.status(500).json({ message: "Erro ao cadastrar restaurante", details: errorMessage });
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
        profileImageUrl: user.profileImageUrl,
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

  app.post('/api/auth/profile-image', isAuthenticated, uploadProfileImage.single('image'), async (req, res) => {
    try {
      const currentUser = req.user as User;
      
      if (!req.file) {
        return res.status(400).json({ message: "Nenhuma imagem foi enviada" });
      }

      const imageUrl = `/uploads/profile-images/${req.file.filename}`;
      
      const user = await storage.getUser(currentUser.id);
      if (user?.profileImageUrl) {
        await deleteOldImage(user.profileImageUrl, 'profile-images');
      }

      const restaurantId = currentUser.role === 'superadmin' ? null : currentUser.restaurantId || null;
      await storage.updateUser(restaurantId, currentUser.id, { profileImageUrl: imageUrl });

      res.json({ imageUrl });
    } catch (error: any) {
      if (req.file) {
        await fs.unlink(req.file.path).catch(() => {});
      }
      res.status(500).json({ message: error.message || "Erro ao fazer upload da imagem" });
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

      // Check subscription limits (only for non-superadmin users)
      if (currentUser.role !== 'superadmin') {
        const subscription = await storage.getSubscriptionByRestaurantId(currentUser.restaurantId);
        if (subscription) {
          const plan = await storage.getSubscriptionPlanById(subscription.planId);
          if (plan && plan.maxBranches !== null) {
            const currentBranches = await storage.getBranches(currentUser.restaurantId);
            if (currentBranches.length >= plan.maxBranches) {
              return res.status(403).json({ 
                message: `Limite de filiais atingido. Seu plano permite até ${plan.maxBranches} filiais. Faça upgrade para adicionar mais.` 
              });
            }
          }
        }
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
      
      // Enrich with subscription and plan information
      const enrichedRestaurants = await Promise.all(
        restaurants.map(async (restaurant) => {
          const subscription = await storage.getSubscriptionByRestaurantId(restaurant.id);
          if (subscription) {
            const plan = await storage.getSubscriptionPlanById(subscription.planId);
            return {
              ...restaurant,
              subscription: {
                id: subscription.id,
                status: subscription.status,
                billingInterval: subscription.billingInterval,
                currentPeriodEnd: subscription.currentPeriodEnd,
              },
              plan: plan ? {
                id: plan.id,
                name: plan.name,
                maxUsers: plan.maxUsers,
                maxBranches: plan.maxBranches,
                maxTables: plan.maxTables,
                maxMenuItems: plan.maxMenuItems,
              } : null,
            };
          }
          return {
            ...restaurant,
            subscription: null,
            plan: null,
          };
        })
      );
      
      res.json(enrichedRestaurants);
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

  app.get('/api/superadmin/restaurants/:id/admins', isSuperAdmin, async (req, res) => {
    try {
      const admins = await storage.getRestaurantAdmins(req.params.id);
      const adminsWithoutPassword = admins.map(admin => ({
        id: admin.id,
        email: admin.email,
        firstName: admin.firstName,
        lastName: admin.lastName,
        role: admin.role,
        restaurantId: admin.restaurantId,
        createdAt: admin.createdAt,
        updatedAt: admin.updatedAt,
      }));
      res.json(adminsWithoutPassword);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro ao buscar administradores do restaurante";
      res.status(500).json({ message: errorMessage });
    }
  });

  app.patch('/api/superadmin/restaurants/:restaurantId/admins/:userId/credentials', isSuperAdmin, async (req, res) => {
    try {
      const data = resetRestaurantAdminCredentialsSchema.parse(req.body);
      
      const updateData: { email?: string; password?: string } = {};
      if (data.email) updateData.email = data.email;
      if (data.newPassword) {
        updateData.password = await hashPassword(data.newPassword);
      }
      
      const updatedUser = await storage.resetRestaurantAdminCredentials(
        req.params.restaurantId,
        req.params.userId,
        updateData
      );
      
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
      
      res.json({ 
        success: true, 
        message: "Credenciais atualizadas com sucesso",
        user: userWithoutPassword
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      const errorMessage = error instanceof Error ? error.message : "Erro ao resetar credenciais";
      res.status(500).json({ message: errorMessage });
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

  app.patch('/api/restaurants/appearance', isAdmin, async (req, res) => {
    try {
      const currentUser = req.user as User;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usuário não associado a um restaurante" });
      }

      const data = updateRestaurantAppearanceSchema.parse(req.body);
      const restaurant = await storage.updateRestaurantAppearance(currentUser.restaurantId, data);
      res.json(restaurant);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Erro ao atualizar aparência do restaurante" });
    }
  });

  // Upload restaurant logo
  app.post('/api/restaurants/upload-logo', isAdmin, uploadRestaurantImage.single('logo'), async (req, res) => {
    try {
      const currentUser = req.user as User;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usuário não associado a um restaurante" });
      }

      if (!req.file) {
        return res.status(400).json({ message: "Nenhum arquivo enviado" });
      }

      // Get current restaurant to delete old logo
      const currentRestaurant = await storage.getRestaurantById(currentUser.restaurantId);
      if (currentRestaurant?.logoUrl) {
        await deleteOldImage(currentRestaurant.logoUrl);
      }

      const logoUrl = `/uploads/restaurants/${req.file.filename}`;
      const restaurant = await storage.updateRestaurantAppearance(currentUser.restaurantId, { logoUrl });
      
      res.json({ 
        message: "Logo atualizado com sucesso",
        logoUrl,
        restaurant 
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao fazer upload do logo';
      res.status(500).json({ message: errorMessage });
    }
  });

  // Upload restaurant hero image
  app.post('/api/restaurants/upload-hero', isAdmin, uploadRestaurantImage.single('heroImage'), async (req, res) => {
    try {
      const currentUser = req.user as User;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usuário não associado a um restaurante" });
      }

      if (!req.file) {
        return res.status(400).json({ message: "Nenhum arquivo enviado" });
      }

      // Get current restaurant to delete old hero image
      const currentRestaurant = await storage.getRestaurantById(currentUser.restaurantId);
      if (currentRestaurant?.heroImageUrl) {
        await deleteOldImage(currentRestaurant.heroImageUrl);
      }

      const heroImageUrl = `/uploads/restaurants/${req.file.filename}`;
      const restaurant = await storage.updateRestaurantAppearance(currentUser.restaurantId, { heroImageUrl });
      
      res.json({ 
        message: "Foto de capa atualizada com sucesso",
        heroImageUrl,
        restaurant 
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao fazer upload da foto de capa';
      res.status(500).json({ message: errorMessage });
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

  app.get('/api/superadmin/analytics', isSuperAdmin, async (req, res) => {
    try {
      const analytics = await storage.getSuperAdminAnalytics();
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar analytics" });
    }
  });

  app.get('/api/superadmin/rankings', isSuperAdmin, async (req, res) => {
    try {
      const rankings = await storage.getRestaurantRankings();
      res.json(rankings);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar rankings" });
    }
  });

  app.get('/api/superadmin/restaurants/:id/details', isSuperAdmin, async (req, res) => {
    try {
      const details = await storage.getRestaurantDetails(req.params.id);
      res.json(details);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro ao buscar detalhes do restaurante";
      res.status(500).json({ message: errorMessage });
    }
  });

  app.get('/api/superadmin/restaurants/:id/usage', isSuperAdmin, async (req, res) => {
    try {
      // Check if restaurant exists first
      const restaurant = await storage.getRestaurantById(req.params.id);
      if (!restaurant) {
        return res.status(404).json({ message: "Restaurante não encontrado" });
      }

      const usage = await storage.checkSubscriptionLimits(req.params.id);
      
      // Convert 999999 (unlimited) to null for frontend
      const normalizedPlan = {
        ...usage.plan,
        maxUsers: usage.plan.maxUsers >= 999999 ? null : usage.plan.maxUsers,
        maxBranches: usage.plan.maxBranches >= 999999 ? null : usage.plan.maxBranches,
        maxTables: usage.plan.maxTables >= 999999 ? null : usage.plan.maxTables,
        maxMenuItems: usage.plan.maxMenuItems >= 999999 ? null : usage.plan.maxMenuItems,
        maxOrdersPerMonth: usage.plan.maxOrdersPerMonth >= 999999 ? null : usage.plan.maxOrdersPerMonth,
      };
      
      // Recompute withinLimits based on normalized plan to ensure consistency
      const normalizedWithinLimits = {
        users: normalizedPlan.maxUsers === null ? true : usage.usage.users < normalizedPlan.maxUsers,
        branches: normalizedPlan.maxBranches === null ? true : usage.usage.branches < normalizedPlan.maxBranches,
        tables: normalizedPlan.maxTables === null ? true : usage.usage.tables < normalizedPlan.maxTables,
        menuItems: normalizedPlan.maxMenuItems === null ? true : usage.usage.menuItems < normalizedPlan.maxMenuItems,
        orders: normalizedPlan.maxOrdersPerMonth === null ? true : usage.usage.ordersThisMonth < normalizedPlan.maxOrdersPerMonth,
      };
      
      res.json({
        ...usage,
        plan: normalizedPlan,
        withinLimits: normalizedWithinLimits,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro ao buscar uso do restaurante";
      
      // Handle missing subscription specifically
      if (error instanceof Error && error.message.includes("não possui subscrição")) {
        return res.status(404).json({ message: "Restaurante não possui subscrição ativa" });
      }
      
      res.status(500).json({ message: errorMessage });
    }
  });

  app.get('/api/superadmin/financial-overview', isSuperAdmin, async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      const start = startDate ? new Date(startDate as string) : undefined;
      const end = endDate ? new Date(endDate as string) : undefined;
      
      const overview = await storage.getSuperAdminFinancialOverview(start, end);
      res.json(overview);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar visão financeira" });
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

  // ===== SUPERADMIN SUBSCRIPTION MANAGEMENT ROUTES =====
  app.get('/api/superadmin/subscriptions', isSuperAdmin, async (req, res) => {
    try {
      const subscriptions = await storage.getAllSubscriptions();
      res.json(subscriptions);
    } catch (error) {
      console.error('SuperAdmin subscriptions fetch error:', error);
      res.status(500).json({ message: "Erro ao buscar subscrições" });
    }
  });

  app.get('/api/superadmin/subscriptions/:id', isSuperAdmin, async (req, res) => {
    try {
      const subscription = await storage.getSubscriptionById(req.params.id);
      if (!subscription) {
        return res.status(404).json({ message: "Subscrição não encontrada" });
      }
      res.json(subscription);
    } catch (error) {
      console.error('SuperAdmin subscription fetch error:', error);
      res.status(500).json({ message: "Erro ao buscar subscrição" });
    }
  });

  app.post('/api/superadmin/restaurants/:restaurantId/subscription', isSuperAdmin, async (req, res) => {
    try {
      const { restaurantId } = req.params;
      
      // Check if restaurant exists
      const restaurant = await storage.getRestaurantById(restaurantId);
      if (!restaurant) {
        return res.status(404).json({ message: "Restaurante não encontrado" });
      }

      // Check if subscription already exists
      const existingSubscription = await storage.getSubscriptionByRestaurantId(restaurantId);
      if (existingSubscription) {
        return res.status(409).json({ message: "Restaurante já possui uma subscrição. Use PATCH para modificar." });
      }

      const validatedData = superAdminCreateSubscriptionSchema.parse(req.body);
      
      // Get plan details
      const plan = await storage.getSubscriptionPlanById(validatedData.planId);
      if (!plan) {
        return res.status(404).json({ message: "Plano não encontrado" });
      }

      // Calculate period dates
      const now = new Date();
      const trialDays = plan.trialDays || 0;
      const trialStart = trialDays > 0 && validatedData.status === 'trial' ? now : null;
      const trialEnd = trialDays > 0 && validatedData.status === 'trial' ? new Date(now.getTime() + trialDays * 24 * 60 * 60 * 1000) : null;
      
      const periodStart = trialEnd || now;
      const periodEnd = new Date(periodStart);
      if (validatedData.billingInterval === 'anual') {
        periodEnd.setFullYear(periodEnd.getFullYear() + 1);
      } else {
        periodEnd.setMonth(periodEnd.getMonth() + 1);
      }

      const subscriptionData: any = {
        planId: validatedData.planId,
        billingInterval: validatedData.billingInterval,
        currency: validatedData.currency,
        status: validatedData.status,
        currentPeriodStart: periodStart,
        currentPeriodEnd: periodEnd,
        trialStart,
        trialEnd,
        autoRenew: 1,
        cancelAtPeriodEnd: 0,
      };

      const subscription = await storage.createSubscription(restaurantId, subscriptionData);
      res.status(201).json(subscription);
    } catch (error: any) {
      console.error('SuperAdmin subscription creation error:', error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Erro ao criar subscrição" });
    }
  });

  app.patch('/api/superadmin/subscriptions/:id', isSuperAdmin, async (req, res) => {
    try {
      const subscription = await storage.getSubscriptionById(req.params.id);
      if (!subscription) {
        return res.status(404).json({ message: "Subscrição não encontrada" });
      }

      const cleanedBody = Object.fromEntries(
        Object.entries(req.body).filter(([_, value]) => value !== '' && value !== null && value !== undefined)
      );

      const validatedData = superAdminUpdateSubscriptionSchema.parse(cleanedBody);
      const updated = await storage.updateSubscriptionById(req.params.id, validatedData);
      res.json(updated);
    } catch (error: any) {
      console.error('SuperAdmin subscription update error:', error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Erro ao atualizar subscrição" });
    }
  });

  app.delete('/api/superadmin/subscriptions/:id', isSuperAdmin, async (req, res) => {
    try {
      const subscription = await storage.getSubscriptionById(req.params.id);
      if (!subscription) {
        return res.status(404).json({ message: "Subscrição não encontrada" });
      }

      const cancelled = await storage.cancelSubscriptionById(req.params.id);
      res.json(cancelled);
    } catch (error) {
      console.error('SuperAdmin subscription cancel error:', error);
      res.status(500).json({ message: "Erro ao cancelar subscrição" });
    }
  });

  app.post('/api/superadmin/subscriptions/:id/payments', isSuperAdmin, async (req, res) => {
    try {
      const subscription = await storage.getSubscriptionById(req.params.id);
      if (!subscription) {
        return res.status(404).json({ message: "Subscrição não encontrada" });
      }

      const validatedData = insertSubscriptionPaymentSchema.parse(req.body);
      const payment = await storage.createSubscriptionPayment(subscription.restaurantId, validatedData);
      res.status(201).json(payment);
    } catch (error: any) {
      console.error('SuperAdmin subscription payment creation error:', error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Erro ao registrar pagamento" });
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
      
      // Check subscription limits (only for non-superadmin users)
      if (currentUser.role !== 'superadmin' && data.restaurantId) {
        const subscription = await storage.getSubscriptionByRestaurantId(data.restaurantId);
        if (subscription) {
          const plan = await storage.getSubscriptionPlanById(subscription.planId);
          if (plan && plan.maxUsers !== null) {
            const currentUsers = await storage.getAllUsers(data.restaurantId);
            if (currentUsers.length >= plan.maxUsers) {
              return res.status(403).json({ 
                message: `Limite de usuários atingido. Seu plano permite até ${plan.maxUsers} usuários. Faça upgrade para adicionar mais.` 
              });
            }
          }
        }
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
      const { items, couponCode, redeemPoints, ...orderData } = req.body;
      
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

      // Auto-link customer by phone if not already provided
      if (!validatedOrder.customerId && validatedOrder.customerPhone) {
        const existingCustomer = await storage.getCustomerByPhone(
          validatedOrder.restaurantId,
          validatedOrder.customerPhone.trim()
        );
        if (existingCustomer) {
          validatedOrder = { ...validatedOrder, customerId: existingCustomer.id };
        }
      }

      // SERVER-SIDE PRICE VERIFICATION: Fetch menu items and calculate real prices
      // This prevents price manipulation attacks
      const verifiedItems: typeof validatedItems = [];
      let orderTotal = 0;
      
      for (const item of validatedItems) {
        const menuItem = await storage.getMenuItemById(item.menuItemId);
        if (!menuItem) {
          return res.status(400).json({ message: `Item do menu não encontrado: ${item.menuItemId}` });
        }
        
        // Use server-side price from database (ignore client-provided price)
        const serverPrice = parseFloat(menuItem.price);
        
        // Calculate options price if there are selected options
        let optionsPrice = 0;
        if (item.selectedOptions && item.selectedOptions.length > 0) {
          // Get option groups with options from database to verify option prices
          const optionGroups = await storage.getOptionGroupsByMenuItem(item.menuItemId);
          const allOptions = optionGroups.flatMap(group => group.options);
          
          for (const selectedOpt of item.selectedOptions) {
            // Find the option in database to get verified price
            const dbOption = allOptions.find(opt => opt.id === selectedOpt.optionId);
            if (dbOption) {
              const optionPrice = parseFloat(dbOption.priceAdjustment || '0');
              optionsPrice += optionPrice * (selectedOpt.quantity || 1);
            }
          }
        }
        
        // Calculate verified item total
        const verifiedItemPrice = (serverPrice + optionsPrice).toFixed(2);
        const itemTotal = parseFloat(verifiedItemPrice) * item.quantity;
        orderTotal += itemTotal;
        
        // Store verified item with server-calculated price
        verifiedItems.push({
          ...item,
          price: verifiedItemPrice, // Override with verified price
        });
      }

      // Validate and apply coupon if provided (server-side verification)
      let couponDiscount = 0;
      let appliedCouponId: string | null = null;
      if (couponCode && validatedOrder.restaurantId) {
        const couponResult = await storage.validateCoupon(
          validatedOrder.restaurantId,
          couponCode,
          orderTotal,
          validatedOrder.orderType,
          validatedOrder.customerId || undefined
        );
        
        if (couponResult.valid && couponResult.discountAmount) {
          // Limit coupon discount to order total
          couponDiscount = Math.min(couponResult.discountAmount, orderTotal);
          appliedCouponId = couponResult.coupon?.id || null;
          validatedOrder = { 
            ...validatedOrder, 
            couponId: appliedCouponId 
          };
        }
      }

      // Calculate loyalty points discount if customer wants to redeem (server-side enforcement)
      let loyaltyDiscount = 0;
      let pointsToRedeem = 0;
      if (redeemPoints && redeemPoints > 0 && validatedOrder.customerId && validatedOrder.restaurantId) {
        const customer = await storage.getCustomerById(validatedOrder.customerId);
        const loyaltyProgram = await storage.getLoyaltyProgram(validatedOrder.restaurantId);
        
        if (customer && loyaltyProgram && loyaltyProgram.isActive === 1) {
          const availablePoints = customer.loyaltyPoints || 0;
          const minPoints = loyaltyProgram.minPointsToRedeem || 100;
          const currencyPerPoint = parseFloat(loyaltyProgram.currencyPerPoint || '0.10');
          
          // SERVER-SIDE ENFORCEMENT: Limit points to what customer actually has
          const requestedPoints = Math.max(0, Math.floor(redeemPoints)); // Only positive integers
          const cappedPoints = Math.min(requestedPoints, availablePoints);
          
          // Check if enough points for minimum redemption
          if (cappedPoints >= minPoints) {
            // Calculate max points that can be redeemed (limited by remaining order total after coupon)
            const remainingTotal = orderTotal - couponDiscount;
            const maxPointsForOrder = Math.floor(remainingTotal / currencyPerPoint);
            
            pointsToRedeem = Math.min(cappedPoints, maxPointsForOrder);
            loyaltyDiscount = pointsToRedeem * currencyPerPoint;
            
            // Ensure discount doesn't exceed remaining total
            loyaltyDiscount = Math.min(loyaltyDiscount, remainingTotal);
          }
        }
      }

      // Use verified items with server-calculated prices
      const order = await storage.createOrder(validatedOrder, verifiedItems);

      // Apply coupon usage if valid
      if (appliedCouponId && couponDiscount > 0) {
        await storage.applyCoupon(
          validatedOrder.restaurantId,
          appliedCouponId,
          order.id,
          validatedOrder.customerId || undefined,
          couponDiscount
        );
      }

      // Redeem loyalty points if applicable
      if (pointsToRedeem > 0 && validatedOrder.customerId && loyaltyDiscount > 0) {
        await storage.redeemLoyaltyPointsForOrder(
          validatedOrder.restaurantId,
          validatedOrder.customerId,
          pointsToRedeem,
          order.id,
          '' // No user for public orders
        );
      }
      
      broadcastToClients({ type: 'new_order', data: order });

      // Return order with additional info about discounts applied
      res.json({
        ...order,
        couponDiscountApplied: couponDiscount,
        loyaltyDiscountApplied: loyaltyDiscount,
        pointsRedeemed: pointsToRedeem,
      });
    } catch (error) {
      console.error('Erro ao criar pedido:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message, errors: error.errors });
      }
      res.status(500).json({ message: "Erro ao criar pedido" });
    }
  });

  // Public customer registration route (for customer self-registration)
  app.post("/api/public/customers", async (req, res) => {
    try {
      const { restaurantId, ...customerData } = req.body;
      
      if (!restaurantId) {
        return res.status(400).json({ message: "ID do restaurante é obrigatório" });
      }

      const validatedData = insertCustomerSchema.parse(customerData);

      // Check if customer with phone already exists
      if (validatedData.phone) {
        const existing = await storage.getCustomerByPhone(restaurantId, validatedData.phone);
        if (existing) {
          return res.status(400).json({ message: "Já existe um cliente cadastrado com este telefone" });
        }
      }

      const customer = await storage.createCustomer(
        restaurantId,
        null,
        validatedData
      );

      res.json(customer);
    } catch (error: any) {
      console.error('Public customer registration error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Erro ao cadastrar cliente" });
    }
  });

  // Public customer lookup by phone - returns customer info and loyalty data
  app.get("/api/public/customers/lookup", async (req, res) => {
    try {
      const { restaurantId, phone } = req.query;
      
      if (!restaurantId || !phone) {
        return res.status(400).json({ message: "restaurantId e phone são obrigatórios" });
      }

      const customer = await storage.getCustomerByPhone(restaurantId as string, phone as string);
      
      if (!customer) {
        return res.json({ found: false });
      }

      // Get loyalty program info
      const loyaltyProgram = await storage.getLoyaltyProgram(restaurantId as string);
      
      // Calculate potential discount if points were redeemed
      let maxRedeemablePoints = 0;
      let maxDiscountAmount = 0;
      
      if (loyaltyProgram && loyaltyProgram.isActive === 1) {
        const minPoints = loyaltyProgram.minPointsToRedeem || 100;
        const currencyPerPoint = parseFloat(loyaltyProgram.currencyPerPoint || '0.10');
        
        if (customer.loyaltyPoints >= minPoints) {
          maxRedeemablePoints = customer.loyaltyPoints;
          maxDiscountAmount = maxRedeemablePoints * currencyPerPoint;
        }
      }

      res.json({
        found: true,
        customer: {
          id: customer.id,
          name: customer.name,
          phone: customer.phone,
          email: customer.email,
          loyaltyPoints: customer.loyaltyPoints,
          tier: customer.tier,
          totalSpent: customer.totalSpent,
          visitCount: customer.visitCount,
        },
        loyalty: loyaltyProgram ? {
          isActive: loyaltyProgram.isActive === 1,
          pointsPerCurrency: loyaltyProgram.pointsPerCurrency,
          currencyPerPoint: loyaltyProgram.currencyPerPoint,
          minPointsToRedeem: loyaltyProgram.minPointsToRedeem,
          maxRedeemablePoints,
          maxDiscountAmount,
        } : null,
      });
    } catch (error) {
      console.error('Customer lookup error:', error);
      res.status(500).json({ message: "Erro ao buscar cliente" });
    }
  });

  // Public coupon validation
  app.post("/api/public/coupons/validate", async (req, res) => {
    try {
      const { restaurantId, code, orderValue, orderType, customerId } = req.body;
      
      if (!restaurantId || !code || orderValue === undefined) {
        return res.status(400).json({ message: "restaurantId, code e orderValue são obrigatórios" });
      }

      const result = await storage.validateCoupon(
        restaurantId,
        code,
        parseFloat(orderValue),
        orderType,
        customerId
      );

      res.json(result);
    } catch (error) {
      console.error('Coupon validation error:', error);
      res.status(500).json({ message: "Erro ao validar cupom" });
    }
  });

  // Public loyalty points calculation - how many points will be earned
  app.get("/api/public/loyalty/calculate", async (req, res) => {
    try {
      const { restaurantId, orderValue } = req.query;
      
      if (!restaurantId || !orderValue) {
        return res.status(400).json({ message: "restaurantId e orderValue são obrigatórios" });
      }

      const loyaltyProgram = await storage.getLoyaltyProgram(restaurantId as string);
      
      if (!loyaltyProgram || loyaltyProgram.isActive !== 1) {
        return res.json({ 
          active: false, 
          pointsToEarn: 0,
          message: "Programa de fidelidade não está ativo" 
        });
      }

      const pointsPerCurrency = parseFloat(loyaltyProgram.pointsPerCurrency || '1');
      const orderValueNum = parseFloat(orderValue as string);
      const pointsToEarn = Math.floor(orderValueNum * pointsPerCurrency);

      res.json({
        active: true,
        pointsToEarn,
        pointsPerCurrency,
        currencyPerPoint: loyaltyProgram.currencyPerPoint,
        minPointsToRedeem: loyaltyProgram.minPointsToRedeem,
      });
    } catch (error) {
      console.error('Loyalty calculation error:', error);
      res.status(500).json({ message: "Erro ao calcular pontos" });
    }
  });

  // ===== CUSTOMER AUTHENTICATION (Multi-device login) =====
  
  // Request OTP code for customer login
  app.post("/api/public/customer-auth/request-otp", async (req, res) => {
    try {
      const { phone, restaurantId } = req.body;
      
      if (!phone || !restaurantId) {
        return res.status(400).json({ message: "Telefone e ID do restaurante são obrigatórios" });
      }
      
      // Check if restaurant exists
      const restaurant = await storage.getRestaurantById(restaurantId);
      if (!restaurant) {
        return res.status(404).json({ message: "Restaurante não encontrado" });
      }
      
      // Get or create customer by phone
      const customer = await storage.getOrCreateCustomerByPhone(restaurantId, phone);
      
      // Create session with OTP
      const deviceInfo = req.headers['user-agent'] || 'Unknown device';
      const ipAddress = req.ip || req.socket.remoteAddress || 'Unknown';
      const session = await storage.createCustomerSession(
        customer.id,
        restaurantId,
        deviceInfo,
        ipAddress
      );
      
      // Send OTP via WhatsApp
      const otpCode = session.otpCode || '';
      const whatsappSent = otpCode ? await sendWhatsAppOTP(phone, otpCode, restaurant.name) : false;
      
      console.log(`[CUSTOMER AUTH] OTP for ${phone}: ${otpCode}, WhatsApp sent: ${whatsappSent}`);
      
      res.json({
        success: true,
        message: whatsappSent 
          ? "Código de verificação enviado para o seu WhatsApp" 
          : "Código de verificação enviado",
        customerId: customer.id,
        whatsappSent,
        // DEV ONLY: Return OTP in response if WhatsApp failed (for testing)
        ...(!whatsappSent && process.env.NODE_ENV === 'development' && { otpCode }),
      });
    } catch (error) {
      console.error('Customer auth request error:', error);
      res.status(500).json({ message: "Erro ao solicitar código de verificação" });
    }
  });
  
  // Verify OTP and complete login
  app.post("/api/public/customer-auth/verify", async (req, res) => {
    try {
      const { phone, restaurantId, otpCode } = req.body;
      
      if (!phone || !restaurantId || !otpCode) {
        return res.status(400).json({ message: "Telefone, ID do restaurante e código são obrigatórios" });
      }
      
      // Find customer by phone
      const customer = await storage.getCustomerByPhone(restaurantId, phone.replace(/[\s\-\(\)]/g, ''));
      if (!customer) {
        return res.status(404).json({ message: "Cliente não encontrado" });
      }
      
      // Verify OTP
      const session = await storage.verifyCustomerOtp(customer.id, restaurantId, otpCode);
      if (!session) {
        return res.status(401).json({ message: "Código inválido ou expirado" });
      }
      
      // Get loyalty info
      const loyaltyProgram = await storage.getLoyaltyProgram(restaurantId);
      
      res.json({
        success: true,
        token: session.token,
        customer: {
          id: customer.id,
          name: customer.name,
          phone: customer.phone,
          email: customer.email,
          loyaltyPoints: customer.loyaltyPoints,
          tier: customer.tier,
          totalSpent: customer.totalSpent,
          visitCount: customer.visitCount,
        },
        loyalty: loyaltyProgram && loyaltyProgram.isActive === 1 ? {
          isActive: true,
          pointsPerCurrency: loyaltyProgram.pointsPerCurrency,
          currencyPerPoint: loyaltyProgram.currencyPerPoint,
          minPointsToRedeem: loyaltyProgram.minPointsToRedeem,
        } : null,
        expiresAt: session.expiresAt,
      });
    } catch (error) {
      console.error('Customer auth verify error:', error);
      res.status(500).json({ message: "Erro ao verificar código" });
    }
  });
  
  // Get current customer session (check if logged in)
  app.get("/api/public/customer-auth/me", async (req, res) => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return res.status(401).json({ authenticated: false, message: "Token não fornecido" });
      }
      
      const sessionData = await storage.getCustomerSessionByToken(token);
      if (!sessionData) {
        return res.status(401).json({ authenticated: false, message: "Sessão inválida ou expirada" });
      }
      
      const { customer } = sessionData;
      
      // Get loyalty info
      const loyaltyProgram = await storage.getLoyaltyProgram(sessionData.restaurantId);
      
      res.json({
        authenticated: true,
        customer: {
          id: customer.id,
          name: customer.name,
          phone: customer.phone,
          email: customer.email,
          loyaltyPoints: customer.loyaltyPoints,
          tier: customer.tier,
          totalSpent: customer.totalSpent,
          visitCount: customer.visitCount,
        },
        loyalty: loyaltyProgram && loyaltyProgram.isActive === 1 ? {
          isActive: true,
          pointsPerCurrency: loyaltyProgram.pointsPerCurrency,
          currencyPerPoint: loyaltyProgram.currencyPerPoint,
          minPointsToRedeem: loyaltyProgram.minPointsToRedeem,
        } : null,
      });
    } catch (error) {
      console.error('Customer auth check error:', error);
      res.status(500).json({ message: "Erro ao verificar sessão" });
    }
  });
  
  // Refresh customer session token
  app.post("/api/public/customer-auth/refresh", async (req, res) => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return res.status(401).json({ message: "Token não fornecido" });
      }
      
      const refreshedSession = await storage.refreshCustomerSession(token);
      if (!refreshedSession) {
        return res.status(401).json({ message: "Sessão inválida ou expirada" });
      }
      
      res.json({
        success: true,
        expiresAt: refreshedSession.expiresAt,
      });
    } catch (error) {
      console.error('Customer auth refresh error:', error);
      res.status(500).json({ message: "Erro ao renovar sessão" });
    }
  });
  
  // Logout customer (invalidate session)
  app.post("/api/public/customer-auth/logout", async (req, res) => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return res.status(400).json({ message: "Token não fornecido" });
      }
      
      await storage.invalidateCustomerSession(token);
      
      res.json({
        success: true,
        message: "Logout realizado com sucesso",
      });
    } catch (error) {
      console.error('Customer auth logout error:', error);
      res.status(500).json({ message: "Erro ao fazer logout" });
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
      
      // Check subscription limits (only for non-superadmin users)
      if (currentUser.role !== 'superadmin') {
        const subscription = await storage.getSubscriptionByRestaurantId(restaurantId);
        if (subscription) {
          const plan = await storage.getSubscriptionPlanById(subscription.planId);
          if (plan && plan.maxTables !== null) {
            const currentTables = await storage.getTables(restaurantId, null);
            if (currentTables.length >= plan.maxTables) {
              return res.status(403).json({ 
                message: `Limite de mesas atingido. Seu plano permite até ${plan.maxTables} mesas. Faça upgrade para adicionar mais.` 
              });
            }
          }
        }
      }
      
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

  app.patch("/api/categories/:id", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user as User;
      if (!currentUser.restaurantId && currentUser.role !== 'superadmin') {
        return res.status(403).json({ message: "Usuário não associado a um restaurante" });
      }
      
      const restaurantId = currentUser.restaurantId!;
      const data = updateCategorySchema.parse(req.body);
      const category = await storage.updateCategory(restaurantId, req.params.id, data);
      res.json(category);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Failed to update category" });
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

  app.post("/api/categories/reorder", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user as User;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usuário não associado a um restaurante" });
      }
      
      const restaurantId = currentUser.restaurantId;
      const { orderedIds } = req.body;
      
      if (!Array.isArray(orderedIds)) {
        return res.status(400).json({ message: "orderedIds must be an array" });
      }
      
      await storage.reorderCategories(restaurantId, orderedIds);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to reorder categories" });
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
      
      const restaurantId = currentUser.restaurantId!;
      
      // Check subscription limits (only for non-superadmin users)
      if (currentUser.role !== 'superadmin') {
        const subscription = await storage.getSubscriptionByRestaurantId(restaurantId);
        if (subscription) {
          const plan = await storage.getSubscriptionPlanById(subscription.planId);
          if (plan && plan.maxMenuItems !== null) {
            const currentMenuItems = await storage.getMenuItems(restaurantId, null);
            if (currentMenuItems.length >= plan.maxMenuItems) {
              return res.status(403).json({ 
                message: `Limite de produtos atingido. Seu plano permite até ${plan.maxMenuItems} produtos. Faça upgrade para adicionar mais.` 
              });
            }
          }
        }
      }
      
      const branchId = currentUser.activeBranchId || null;
      const data = insertMenuItemSchema.parse(req.body);
      const menuItem = await storage.createMenuItem(restaurantId, branchId, data);
      res.json(menuItem);
    } catch (error) {
      console.error("Error creating menu item:", error);
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
      const data = updateMenuItemSchema.parse(req.body);
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

  // Upload menu item image
  app.post("/api/menu-items/:id/image", isAdmin, uploadMenuItemImage.single('image'), async (req, res) => {
    try {
      const currentUser = req.user as User;
      if (!currentUser.restaurantId && currentUser.role !== 'superadmin') {
        return res.status(403).json({ message: "Usuário não associado a um restaurante" });
      }

      if (!req.file) {
        return res.status(400).json({ message: "Nenhuma imagem foi enviada" });
      }

      const restaurantId = currentUser.restaurantId!;
      const menuItemId = req.params.id;

      // Get current menu item to delete old image
      const menuItem = await storage.getMenuItemById(menuItemId);
      if (!menuItem) {
        return res.status(404).json({ message: "Item do menu não encontrado" });
      }

      // Verify menu item belongs to user's restaurant
      if (menuItem.restaurantId !== restaurantId) {
        return res.status(403).json({ message: "Acesso negado" });
      }

      // Delete old image if exists
      if (menuItem.imageUrl) {
        await deleteOldImage(menuItem.imageUrl, 'menu-items');
      }

      // Update menu item with new image URL
      const imageUrl = `/uploads/menu-items/${req.file.filename}`;
      const updated = await storage.updateMenuItem(restaurantId, menuItemId, { imageUrl });

      res.json({ imageUrl: updated.imageUrl });
    } catch (error) {
      console.error('Error uploading menu item image:', error);
      res.status(500).json({ message: "Erro ao fazer upload da imagem" });
    }
  });

  app.post("/api/menu-items/reorder", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user as User;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usuário não associado a um restaurante" });
      }
      
      const restaurantId = currentUser.restaurantId;
      const { categoryId, orderedIds } = req.body;
      
      if (!categoryId || !Array.isArray(orderedIds)) {
        return res.status(400).json({ message: "categoryId and orderedIds are required" });
      }
      
      await storage.reorderMenuItems(restaurantId, categoryId, orderedIds);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to reorder menu items" });
    }
  });

  // ===== RECIPE INGREDIENTS ROUTES (Admin Only) =====
  app.get("/api/menu-items/:id/recipe", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user as User;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usuário não associado a um restaurante" });
      }
      
      const menuItem = await storage.getMenuItemById(req.params.id);
      if (!menuItem) {
        return res.status(404).json({ message: "Prato não encontrado" });
      }
      if (menuItem.restaurantId !== currentUser.restaurantId) {
        return res.status(403).json({ message: "Não autorizado" });
      }
      
      const ingredients = await storage.getRecipeIngredients(currentUser.restaurantId, req.params.id);
      const cost = await storage.getMenuItemRecipeCost(currentUser.restaurantId, req.params.id);
      
      res.json({ ingredients, cost });
    } catch (error) {
      console.error('Error fetching recipe:', error);
      res.status(500).json({ message: "Erro ao buscar receita" });
    }
  });

  app.post("/api/menu-items/:id/recipe", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user as User;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usuário não associado a um restaurante" });
      }
      
      const menuItem = await storage.getMenuItemById(req.params.id);
      if (!menuItem) {
        return res.status(404).json({ message: "Prato não encontrado" });
      }
      if (menuItem.restaurantId !== currentUser.restaurantId) {
        return res.status(403).json({ message: "Não autorizado" });
      }
      
      const inventoryItem = await storage.getInventoryItemById(req.body.inventoryItemId);
      if (!inventoryItem) {
        return res.status(404).json({ message: "Ingrediente não encontrado" });
      }
      if (inventoryItem.restaurantId !== currentUser.restaurantId) {
        return res.status(403).json({ message: "Ingrediente não pertence ao seu restaurante" });
      }
      
      const data = {
        menuItemId: req.params.id,
        inventoryItemId: req.body.inventoryItemId,
        quantity: String(parseFloat(req.body.quantity || "0")),
      };
      
      if (parseFloat(data.quantity) <= 0) {
        return res.status(400).json({ message: "Quantidade deve ser maior que zero" });
      }
      
      const ingredient = await storage.addRecipeIngredient(currentUser.restaurantId, data);
      res.json(ingredient);
    } catch (error) {
      console.error('Error adding ingredient:', error);
      res.status(500).json({ message: "Erro ao adicionar ingrediente" });
    }
  });

  app.patch("/api/recipe-ingredients/:id", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user as User;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usuário não associado a um restaurante" });
      }
      
      const data = { quantity: req.body.quantity };
      const ingredient = await storage.updateRecipeIngredient(req.params.id, currentUser.restaurantId, data);
      res.json(ingredient);
    } catch (error) {
      console.error('Error updating ingredient:', error);
      res.status(500).json({ message: "Erro ao atualizar ingrediente" });
    }
  });

  app.delete("/api/recipe-ingredients/:id", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user as User;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usuário não associado a um restaurante" });
      }
      
      await storage.deleteRecipeIngredient(req.params.id, currentUser.restaurantId);
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting ingredient:', error);
      res.status(500).json({ message: "Erro ao deletar ingrediente" });
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
      
      // Automatically set createdBy and branchId to track which admin created the order
      const validatedOrder = insertOrderSchema.parse({
        ...orderData,
        createdBy: currentUser.id,
        branchId: currentUser.activeBranchId || null,
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

      const order = await storage.updateOrderStatus(restaurantId, req.params.id, status, currentUser.id);
      
      if (status === 'servido') {
        if (order.tableId) {
          await storage.updateTableOccupancy(restaurantId, order.tableId, false);
          broadcastToClients({ 
            type: 'table_freed', 
            data: { tableId: order.tableId }
          });
        }
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
      const updated = await storage.recordPayment(restaurantId, req.params.id, payment, currentUser.id);
      
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

  app.post("/api/orders/:id/cancel", isAuthenticated, async (req, res) => {
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

      if (order.status === 'cancelado' || (order.cancellationReason && order.cancellationReason !== '')) {
        return res.status(400).json({ message: "Pedido já está cancelado" });
      }

      const { cancellationReason } = cancelOrderSchema.parse(req.body);
      const cancelled = await storage.cancelOrder(restaurantId, req.params.id, cancellationReason, currentUser.id);
      
      broadcastToClients({ 
        type: 'order_cancelled', 
        data: { 
          orderId: req.params.id,
          cancellationReason,
        }
      });

      res.json(cancelled);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      console.error('Error cancelling order:', error);
      const errorMessage = error instanceof Error ? error.message : "Erro ao cancelar pedido";
      res.status(500).json({ message: errorMessage });
    }
  });

  app.put("/api/orders/:id/customer", isAuthenticated, async (req, res) => {
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
        return res.status(400).json({ message: "Não é possível vincular cliente a pedido já servido" });
      }

      const { customerId } = linkCustomerSchema.parse(req.body);
      
      const customer = await storage.getCustomerById(customerId);
      if (!customer || customer.restaurantId !== restaurantId) {
        return res.status(404).json({ message: "Cliente não encontrado" });
      }

      const updated = await storage.linkCustomerToOrder(restaurantId, req.params.id, customerId);
      
      broadcastToClients({ 
        type: 'order_customer_linked', 
        data: { orderId: req.params.id, customerId }
      });

      res.json(updated);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      console.error('Error linking customer:', error);
      res.status(500).json({ message: "Erro ao vincular cliente ao pedido" });
    }
  });

  app.post("/api/orders/:id/coupon", isAuthenticated, async (req, res) => {
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
        return res.status(400).json({ message: "Não é possível aplicar cupom a pedido já servido" });
      }

      const { couponCode } = applyCouponSchema.parse(req.body);
      
      const subtotal = parseFloat(order.subtotal || "0");
      const validation = await storage.validateCoupon(
        restaurantId, 
        couponCode, 
        subtotal, 
        order.orderType,
        order.customerId || undefined
      );

      if (!validation.valid || !validation.coupon) {
        return res.status(400).json({ message: validation.message || "Cupom inválido" });
      }

      const updated = await storage.applyCouponToOrder(restaurantId, req.params.id, validation.coupon.id, validation.discountAmount || 0);
      
      broadcastToClients({ 
        type: 'order_coupon_applied', 
        data: { 
          orderId: req.params.id, 
          couponId: validation.coupon.id,
          totalAmount: updated.totalAmount 
        }
      });

      res.json(updated);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      console.error('Error applying coupon:', error);
      res.status(500).json({ message: "Erro ao aplicar cupom" });
    }
  });

  app.post("/api/orders/:id/loyalty/redeem", isAuthenticated, async (req, res) => {
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
        return res.status(400).json({ message: "Não é possível resgatar pontos em pedido já servido" });
      }

      if (!order.customerId) {
        return res.status(400).json({ message: "Pedido não possui cliente vinculado" });
      }

      const { pointsToRedeem } = redeemLoyaltyPointsSchema.parse(req.body);

      const customer = await storage.getCustomerById(order.customerId);
      if (!customer || customer.restaurantId !== restaurantId) {
        return res.status(404).json({ message: "Cliente não encontrado" });
      }

      const availablePoints = customer.loyaltyPoints || 0;
      if (pointsToRedeem > availablePoints) {
        return res.status(400).json({ 
          message: `Pontos insuficientes. Disponível: ${availablePoints}, Solicitado: ${pointsToRedeem}` 
        });
      }

      const loyaltyProgram = await storage.getLoyaltyProgram(restaurantId);
      if (!loyaltyProgram || !loyaltyProgram.isActive) {
        return res.status(400).json({ message: "Programa de fidelidade não está ativo" });
      }

      const minPoints = loyaltyProgram.minPointsToRedeem || 100;
      if (pointsToRedeem < minPoints) {
        return res.status(400).json({ 
          message: `Mínimo de pontos para resgate: ${minPoints}` 
        });
      }

      const result = await storage.redeemLoyaltyPointsForOrder(
        restaurantId, 
        order.customerId, 
        pointsToRedeem,
        req.params.id,
        currentUser.id
      );

      const updated = result.order;
      
      broadcastToClients({ 
        type: 'loyalty_points_redeemed', 
        data: { 
          orderId: req.params.id, 
          customerId: order.customerId,
          pointsRedeemed: pointsToRedeem,
          totalAmount: updated.totalAmount 
        }
      });

      res.json(updated);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      console.error('Error redeeming loyalty points:', error);
      res.status(500).json({ message: "Erro ao resgatar pontos de fidelidade" });
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
      console.error('Error fetching dashboard stats:', error);
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

  app.get("/api/stats/historical", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user as User;
      if (!currentUser.restaurantId && currentUser.role !== 'superadmin') {
        return res.status(403).json({ message: "Usuário não associado a um restaurante" });
      }
      
      const days = parseInt(req.query.days as string) || 7;
      if (days < 1 || days > 365) {
        return res.status(400).json({ message: "Days must be between 1 and 365" });
      }
      
      const restaurantId = currentUser.restaurantId!;
      const branchId = currentUser.activeBranchId || null;
      const stats = await storage.getHistoricalStats(restaurantId, branchId, days);
      res.json(stats);
    } catch (error) {
      console.error('Historical stats error:', error);
      res.status(500).json({ message: "Failed to fetch historical stats" });
    }
  });

  app.get("/api/stats/heatmap", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user as User;
      if (!currentUser.restaurantId && currentUser.role !== 'superadmin') {
        return res.status(403).json({ message: "Usuário não associado a um restaurante" });
      }
      
      const days = parseInt(req.query.days as string) || 30;
      if (days < 1 || days > 365) {
        return res.status(400).json({ message: "Days must be between 1 and 365" });
      }
      
      const restaurantId = currentUser.restaurantId!;
      const branchId = currentUser.activeBranchId || null;
      const heatmapData = await storage.getSalesHeatmapData(restaurantId, branchId, days);
      res.json(heatmapData);
    } catch (error) {
      console.error('Heatmap data error:', error);
      res.status(500).json({ message: "Failed to fetch heatmap data" });
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

  app.get("/api/reports/cancelled", isAdmin, async (req, res) => {
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
      const stats = await storage.getCancelledOrdersStats(restaurantId, branchId, start, end);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Erro ao gerar estatísticas de cancelamentos" });
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

  // ===== DASHBOARD API ROUTES =====
  
  // Get dashboard statistics
  app.get("/api/dashboard/stats", isAdmin, async (req, res) => {
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
        orderType,
        customFrom,
        customTo
      } = req.query;

      const validOrderTypes = ['all', 'pdv', 'web'];
      const validatedOrderType = orderType as string || 'all';
      
      if (!validOrderTypes.includes(validatedOrderType)) {
        return res.status(400).json({ message: "orderType deve ser 'all', 'pdv' ou 'web'" });
      }

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

      const branchId = currentUser.role === 'superadmin' ? null : (currentUser.activeBranchId || null);
      
      const stats = await storage.getDashboardStats(
        restaurantId,
        branchId,
        startDate,
        endDate,
        validatedOrderType
      );

      res.json(stats);
    } catch (error) {
      console.error('Dashboard stats API error:', error);
      res.status(500).json({ message: "Erro ao buscar estatísticas do dashboard" });
    }
  });

  // Record menu visit
  app.post("/api/menu-visits", async (req, res) => {
    try {
      const visitSchema = z.object({
        restaurantId: z.string(),
        branchId: z.string().nullish(),
        visitSource: z.string().optional(),
        ipAddress: z.string().optional(),
        userAgent: z.string().optional(),
        referrer: z.string().optional(),
      });

      const validatedData = visitSchema.parse(req.body);

      const visit = await storage.recordMenuVisit(validatedData.restaurantId, {
        branchId: validatedData.branchId || null,
        visitSource: validatedData.visitSource || 'qr_code',
        ipAddress: validatedData.ipAddress,
        userAgent: validatedData.userAgent,
        referrer: validatedData.referrer,
      });

      res.json(visit);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      }
      console.error('Menu visit recording error:', error);
      res.status(500).json({ message: "Erro ao registrar visita" });
    }
  });

  // Get menu visit stats
  app.get("/api/menu-visits/stats", isAdmin, async (req, res) => {
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

      const { dateFilter, customFrom, customTo } = req.query;

      let startDate: Date;
      let endDate: Date;

      if (dateFilter === 'custom' && customFrom) {
        startDate = new Date(customFrom as string);
        endDate = customTo ? new Date(customTo as string) : new Date();
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

      const branchId = currentUser.role === 'superadmin' ? null : (currentUser.activeBranchId || null);
      const stats = await storage.getMenuVisitStats(restaurantId, branchId, startDate, endDate);
      
      res.json(stats);
    } catch (error) {
      console.error('Menu visit stats error:', error);
      res.status(500).json({ message: "Erro ao buscar estatísticas de visitas" });
    }
  });

  // Create customer review
  app.post("/api/reviews", async (req, res) => {
    try {
      const reviewSchema = z.object({
        restaurantId: z.string(),
        branchId: z.string().nullish(),
        orderId: z.string().nullish(),
        customerName: z.string().optional(),
        rating: z.number().int().min(1).max(5),
        comment: z.string().optional(),
      });

      const validatedData = reviewSchema.parse(req.body);

      const review = await storage.createCustomerReview(validatedData.restaurantId, {
        branchId: validatedData.branchId || null,
        orderId: validatedData.orderId || null,
        customerName: validatedData.customerName,
        rating: validatedData.rating,
        comment: validatedData.comment,
      });

      res.json(review);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      }
      console.error('Review creation error:', error);
      res.status(500).json({ message: "Erro ao criar avaliação" });
    }
  });

  // Get customer reviews
  app.get("/api/reviews", isAdmin, async (req, res) => {
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

      const { limit } = req.query;
      const branchId = currentUser.role === 'superadmin' ? null : (currentUser.activeBranchId || null);
      const reviews = await storage.getCustomerReviews(
        restaurantId, 
        branchId, 
        limit ? parseInt(limit as string) : undefined
      );
      
      res.json(reviews);
    } catch (error) {
      console.error('Reviews fetch error:', error);
      res.status(500).json({ message: "Erro ao buscar avaliações" });
    }
  });

  // Financial Module - Cash Registers
  app.get("/api/financial/cash-registers", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user as User;
      let restaurantId: string;
      
      if (currentUser.role === 'superadmin') {
        const queryRestaurantId = req.query.restaurantId as string;
        if (!queryRestaurantId) {
          return res.status(400).json({ message: "Super admin deve fornecer restaurantId" });
        }
        restaurantId = queryRestaurantId;
      } else {
        if (!currentUser.restaurantId) {
          return res.status(403).json({ message: "Usuário não associado a um restaurante" });
        }
        restaurantId = currentUser.restaurantId;
      }

      const branchId = currentUser.role === 'superadmin' ? null : (currentUser.activeBranchId || null);
      const registers = await storage.getCashRegisters(restaurantId, branchId);
      
      res.json(registers);
    } catch (error) {
      console.error('Cash registers fetch error:', error);
      res.status(500).json({ message: "Erro ao buscar caixas registradoras" });
    }
  });

  app.post("/api/financial/cash-registers", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user as User;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usuário não associado a um restaurante" });
      }

      const registerSchema = z.object({
        name: z.string().min(1, "Nome da caixa é obrigatório"),
        branchId: z.string().optional().nullable(),
        initialBalance: z.string().optional(),
        isActive: z.number().optional(),
      });

      const validatedData = registerSchema.parse(req.body);

      const newRegister = await storage.createCashRegister(currentUser.restaurantId, {
        name: validatedData.name,
        branchId: validatedData.branchId || currentUser.activeBranchId || null,
        initialBalance: validatedData.initialBalance,
        isActive: validatedData.isActive,
      });

      res.json(newRegister);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      }
      console.error('Cash register creation error:', error);
      res.status(500).json({ message: "Erro ao criar caixa registradora" });
    }
  });

  app.patch("/api/financial/cash-registers/:id", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user as User;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usuário não associado a um restaurante" });
      }

      const updatedRegister = await storage.updateCashRegister(
        req.params.id,
        currentUser.restaurantId,
        req.body
      );

      if (!updatedRegister) {
        return res.status(404).json({ message: "Caixa registradora não encontrada" });
      }

      res.json(updatedRegister);
    } catch (error) {
      console.error('Cash register update error:', error);
      res.status(500).json({ message: "Erro ao atualizar caixa registradora" });
    }
  });

  app.delete("/api/financial/cash-registers/:id", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user as User;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usuário não associado a um restaurante" });
      }

      await storage.deleteCashRegister(req.params.id, currentUser.restaurantId);

      res.json({ message: "Caixa registradora excluída com sucesso" });
    } catch (error) {
      console.error('Cash register delete error:', error);
      res.status(500).json({ message: "Erro ao excluir caixa registradora" });
    }
  });

  // Financial Module - Cash Register Shifts
  app.get("/api/cash-register-shifts", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user as User;
      let restaurantId: string;
      
      if (currentUser.role === 'superadmin') {
        const queryRestaurantId = req.query.restaurantId as string;
        if (!queryRestaurantId) {
          return res.status(400).json({ message: "Super admin deve fornecer restaurantId" });
        }
        restaurantId = queryRestaurantId;
      } else {
        if (!currentUser.restaurantId) {
          return res.status(403).json({ message: "Usuário não associado a um restaurante" });
        }
        restaurantId = currentUser.restaurantId;
      }

      const branchId = currentUser.role === 'superadmin' ? null : (currentUser.activeBranchId || null);
      const cashRegisterId = req.query.cashRegisterId as string | undefined;
      const status = req.query.status as 'aberto' | 'fechado' | undefined;
      
      const shifts = await storage.getCashRegisterShifts(restaurantId, branchId, {
        cashRegisterId,
        status,
      });
      
      res.json(shifts);
    } catch (error) {
      console.error('Cash register shifts fetch error:', error);
      res.status(500).json({ message: "Erro ao buscar turnos de caixa" });
    }
  });

  app.get("/api/cash-register-shifts/active-registers", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user as User;
      let restaurantId: string;
      
      if (currentUser.role === 'superadmin') {
        const queryRestaurantId = req.query.restaurantId as string;
        if (!queryRestaurantId) {
          return res.status(400).json({ message: "Super admin deve fornecer restaurantId" });
        }
        restaurantId = queryRestaurantId;
      } else {
        if (!currentUser.restaurantId) {
          return res.status(403).json({ message: "Usuário não associado a um restaurante" });
        }
        restaurantId = currentUser.restaurantId;
      }

      const branchId = currentUser.role === 'superadmin' ? null : (currentUser.activeBranchId || null);
      const registers = await storage.getCashRegistersWithActiveShift(restaurantId, branchId);
      
      res.json(registers);
    } catch (error) {
      console.error('Active cash registers fetch error:', error);
      res.status(500).json({ message: "Erro ao buscar caixas com turno aberto" });
    }
  });

  app.post("/api/cash-register-shifts", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user as User;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usuário não associado a um restaurante" });
      }

      const shiftSchema = z.object({
        cashRegisterId: z.string().min(1, "Caixa registradora é obrigatória"),
        openingAmount: z.string().regex(/^\d+(\.\d{1,2})?$/, "Valor de abertura inválido"),
        branchId: z.string().optional().nullable(),
        notes: z.string().optional(),
      });

      const validatedData = shiftSchema.parse(req.body);

      const newShift = await storage.openCashRegisterShift(
        currentUser.restaurantId,
        currentUser.id,
        {
          cashRegisterId: validatedData.cashRegisterId,
          openingAmount: validatedData.openingAmount,
          branchId: validatedData.branchId || currentUser.activeBranchId || null,
          notes: validatedData.notes,
        }
      );

      res.json(newShift);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      }
      console.error('Cash register shift open error:', error);
      res.status(500).json({ message: error instanceof Error ? error.message : "Erro ao abrir turno de caixa" });
    }
  });

  app.patch("/api/cash-register-shifts/:id/close", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user as User;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usuário não associado a um restaurante" });
      }

      const closeSchema = z.object({
        closingAmountCounted: z.string().regex(/^\d+(\.\d{1,2})?$/, "Valor contado inválido"),
        notes: z.string().optional(),
      });

      const validatedData = closeSchema.parse(req.body);

      const closedShift = await storage.closeCashRegisterShift(
        req.params.id,
        currentUser.restaurantId,
        currentUser.id,
        validatedData
      );

      res.json(closedShift);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      }
      console.error('Cash register shift close error:', error);
      res.status(500).json({ message: error instanceof Error ? error.message : "Erro ao fechar turno de caixa" });
    }
  });

  // Financial Module - Categories
  app.get("/api/financial/categories", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user as User;
      let restaurantId: string;
      
      if (currentUser.role === 'superadmin') {
        const queryRestaurantId = req.query.restaurantId as string;
        if (!queryRestaurantId) {
          return res.status(400).json({ message: "Super admin deve fornecer restaurantId" });
        }
        restaurantId = queryRestaurantId;
      } else {
        if (!currentUser.restaurantId) {
          return res.status(403).json({ message: "Usuário não associado a um restaurante" });
        }
        restaurantId = currentUser.restaurantId;
      }

      const branchId = currentUser.role === 'superadmin' ? null : (currentUser.activeBranchId || null);
      const type = req.query.type as 'receita' | 'despesa' | undefined;
      const categories = await storage.getFinancialCategories(restaurantId, branchId, type);
      
      res.json(categories);
    } catch (error) {
      console.error('Financial categories fetch error:', error);
      res.status(500).json({ message: "Erro ao buscar categorias" });
    }
  });

  app.post("/api/financial/categories", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user as User;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usuário não associado a um restaurante" });
      }

      const categorySchema = z.object({
        type: z.enum(['receita', 'despesa']),
        name: z.string().min(1, "Nome da categoria é obrigatório"),
        branchId: z.string().optional().nullable(),
        description: z.string().optional(),
        isDefault: z.number().optional(),
      });

      const validatedData = categorySchema.parse(req.body);

      const newCategory = await storage.createFinancialCategory(currentUser.restaurantId, {
        ...validatedData,
        branchId: validatedData.branchId || null,
      });

      res.json(newCategory);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      }
      console.error('Financial category creation error:', error);
      res.status(500).json({ message: "Erro ao criar categoria" });
    }
  });

  app.delete("/api/financial/categories/:id", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user as User;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usuário não associado a um restaurante" });
      }

      const result = await storage.deleteFinancialCategory(req.params.id, currentUser.restaurantId);

      if (!result.success) {
        return res.status(400).json({ message: result.message });
      }

      res.json({ message: "Categoria excluída com sucesso" });
    } catch (error) {
      console.error('Financial category delete error:', error);
      res.status(500).json({ message: "Erro ao excluir categoria" });
    }
  });

  // Financial Module - Transactions
  app.get("/api/financial/transactions", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user as User;
      let restaurantId: string;
      
      if (currentUser.role === 'superadmin') {
        const queryRestaurantId = req.query.restaurantId as string;
        if (!queryRestaurantId) {
          return res.status(400).json({ message: "Super admin deve fornecer restaurantId" });
        }
        restaurantId = queryRestaurantId;
      } else {
        if (!currentUser.restaurantId) {
          return res.status(403).json({ message: "Usuário não associado a um restaurante" });
        }
        restaurantId = currentUser.restaurantId;
      }

      const branchId = currentUser.role === 'superadmin' ? null : (currentUser.activeBranchId || null);
      
      const filters: any = {};
      
      if (req.query.startDate) {
        filters.startDate = new Date(req.query.startDate as string);
      }
      
      if (req.query.endDate) {
        filters.endDate = new Date(req.query.endDate as string);
      }
      
      if (req.query.cashRegisterId) {
        filters.cashRegisterId = req.query.cashRegisterId as string;
      }
      
      if (req.query.paymentMethod) {
        filters.paymentMethod = req.query.paymentMethod as 'dinheiro' | 'multicaixa' | 'transferencia' | 'cartao';
      }
      
      if (req.query.type) {
        filters.type = req.query.type as 'receita' | 'despesa';
      }

      const transactions = await storage.getFinancialTransactions(restaurantId, branchId, filters);
      
      res.json(transactions);
    } catch (error) {
      console.error('Financial transactions fetch error:', error);
      res.status(500).json({ message: "Erro ao buscar lançamentos" });
    }
  });

  app.post("/api/financial/transactions", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user as User;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usuário não associado a um restaurante" });
      }

      const transactionSchema = z.object({
        cashRegisterId: z.string().min(1, "Caixa registradora é obrigatória"),
        categoryId: z.string().min(1, "Categoria é obrigatória"),
        type: z.enum(['receita', 'despesa', 'ajuste']),
        origin: z.enum(['pdv', 'web', 'manual']).optional(),
        description: z.string().optional(),
        paymentMethod: z.enum(['dinheiro', 'multicaixa', 'transferencia', 'cartao']),
        amount: z.string().min(1, "Valor é obrigatório"),
        occurredAt: z.string().min(1, "Data e hora são obrigatórias"),
        note: z.string().optional(),
        branchId: z.string().optional().nullable(),
        installments: z.number().int().min(1).max(36).optional(),
      });

      const validatedData = transactionSchema.parse(req.body);
      const installments = validatedData.installments || 1;

      if (installments > 1) {
        const totalAmount = parseFloat(validatedData.amount);
        const installmentAmount = totalAmount / installments;
        const occurredAt = new Date(validatedData.occurredAt);
        const transactions = [];

        let parentTransactionId: string | null = null;

        for (let i = 1; i <= installments; i++) {
          const transaction = await storage.createFinancialTransaction(
            currentUser.restaurantId,
            currentUser.id,
            {
              cashRegisterId: validatedData.cashRegisterId,
              categoryId: validatedData.categoryId,
              type: validatedData.type,
              origin: validatedData.origin || 'manual',
              description: `${validatedData.description || ''} (Parte ${i}/${installments})`.trim(),
              paymentMethod: validatedData.paymentMethod,
              amount: installmentAmount.toFixed(2),
              occurredAt: occurredAt.toISOString(),
              note: validatedData.note,
              branchId: validatedData.branchId || currentUser.activeBranchId || null,
              totalInstallments: installments,
              installmentNumber: i,
              parentTransactionId: i === 1 ? null : parentTransactionId,
            }
          );

          if (i === 1) {
            parentTransactionId = transaction.id;
          }

          transactions.push(transaction);
        }

        res.json({ 
          success: true, 
          transactions, 
          message: `Pagamento dividido em ${installments} partes` 
        });
      } else {
        const newTransaction = await storage.createFinancialTransaction(
          currentUser.restaurantId,
          currentUser.id,
          {
            ...validatedData,
            branchId: validatedData.branchId || currentUser.activeBranchId || null,
            origin: validatedData.origin || 'manual',
            totalInstallments: 1,
            installmentNumber: 1,
            parentTransactionId: null,
          }
        );

        res.json(newTransaction);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      }
      console.error('Financial transaction creation error:', error);
      res.status(500).json({ message: "Erro ao criar lançamento" });
    }
  });

  app.delete("/api/financial/transactions/:id", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user as User;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usuário não associado a um restaurante" });
      }

      await storage.deleteFinancialTransaction(req.params.id, currentUser.restaurantId);

      res.json({ message: "Lançamento excluído e saldo revertido com sucesso" });
    } catch (error) {
      console.error('Financial transaction delete error:', error);
      res.status(500).json({ message: "Erro ao excluir lançamento" });
    }
  });

  // Financial Module - Summary
  app.get("/api/financial/summary", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user as User;
      let restaurantId: string;
      
      if (currentUser.role === 'superadmin') {
        const queryRestaurantId = req.query.restaurantId as string;
        if (!queryRestaurantId) {
          return res.status(400).json({ message: "Super admin deve fornecer restaurantId" });
        }
        restaurantId = queryRestaurantId;
      } else {
        if (!currentUser.restaurantId) {
          return res.status(403).json({ message: "Usuário não associado a um restaurante" });
        }
        restaurantId = currentUser.restaurantId;
      }

      const branchId = currentUser.role === 'superadmin' ? null : (currentUser.activeBranchId || null);
      
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
      const cashRegisterId = req.query.cashRegisterId as string | undefined;

      const summary = await storage.getFinancialSummary(
        restaurantId,
        branchId,
        startDate,
        endDate,
        cashRegisterId
      );
      
      res.json(summary);
    } catch (error) {
      console.error('Financial summary fetch error:', error);
      res.status(500).json({ message: "Erro ao buscar resumo financeiro" });
    }
  });

  // ===== EXPENSES MODULE =====

  app.get("/api/expenses", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user as User;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usuário não associado a um restaurante" });
      }

      await checkCanUseExpenseTracking(storage, currentUser.restaurantId);

      const branchId = currentUser.activeBranchId || null;
      const filters: any = {};

      if (req.query.categoryId) {
        filters.categoryId = req.query.categoryId as string;
      }

      if (req.query.startDate) {
        filters.startDate = new Date(req.query.startDate as string);
      }

      if (req.query.endDate) {
        filters.endDate = new Date(req.query.endDate as string);
      }

      const expenses = await storage.getExpenses(currentUser.restaurantId, branchId, filters);
      res.json(expenses);
    } catch (error: any) {
      if (error.name === 'PlanLimitError' || error.name === 'PlanFeatureError') {
        return res.status(403).json({ message: error.message });
      }
      console.error('Expenses fetch error:', error);
      res.status(500).json({ message: "Erro ao buscar despesas" });
    }
  });

  app.post("/api/expenses", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user as User;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usuário não associado a um restaurante" });
      }

      await checkCanUseExpenseTracking(storage, currentUser.restaurantId);

      const expenseSchema = z.object({
        categoryId: z.string().min(1, "Categoria é obrigatória"),
        description: z.string().min(1, "Descrição é obrigatória"),
        amount: z.string().regex(/^\d+(\.\d{1,2})?$/, "Valor inválido"),
        paymentMethod: z.enum(['dinheiro', 'multicaixa', 'transferencia', 'cartao']),
        occurredAt: z.string().min(1, "Data e hora são obrigatórias"),
        note: z.string().optional(),
      });

      const validatedData = expenseSchema.parse(req.body);
      const branchId = currentUser.activeBranchId || null;

      const newExpense = await storage.createExpense(
        currentUser.restaurantId,
        branchId,
        currentUser.id,
        validatedData
      );

      res.json(newExpense);
    } catch (error: any) {
      if (error.name === 'PlanLimitError' || error.name === 'PlanFeatureError') {
        return res.status(403).json({ message: error.message });
      }
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      console.error('Expense creation error:', error);
      res.status(500).json({ message: "Erro ao criar despesa" });
    }
  });

  app.put("/api/expenses/:id", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user as User;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usuário não associado a um restaurante" });
      }

      const updateSchema = z.object({
        categoryId: z.string().min(1).optional(),
        description: z.string().min(1).optional(),
        amount: z.string().regex(/^\d+(\.\d{1,2})?$/).optional(),
        paymentMethod: z.enum(['dinheiro', 'multicaixa', 'transferencia', 'cartao']).optional(),
        occurredAt: z.string().min(1).optional(),
        note: z.string().optional(),
      });

      const validatedData = updateSchema.parse(req.body);

      const updatedExpense = await storage.updateExpense(
        currentUser.restaurantId,
        req.params.id,
        validatedData
      );

      res.json(updatedExpense);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      console.error('Expense update error:', error);
      res.status(500).json({ message: "Erro ao atualizar despesa" });
    }
  });

  app.delete("/api/expenses/:id", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user as User;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usuário não associado a um restaurante" });
      }

      await storage.deleteExpense(currentUser.restaurantId, req.params.id);

      res.json({ message: "Despesa excluída com sucesso" });
    } catch (error) {
      console.error('Expense delete error:', error);
      res.status(500).json({ message: "Erro ao excluir despesa" });
    }
  });

  // ===== FINANCIAL REPORTS =====

  app.get("/api/financial/reports", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user as User;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usuário não associado a um restaurante" });
      }

      if (!req.query.startDate || !req.query.endDate) {
        return res.status(400).json({ message: "Data inicial e final são obrigatórias" });
      }

      const branchId = currentUser.activeBranchId || null;
      const startDate = new Date(req.query.startDate as string);
      const endDate = new Date(req.query.endDate as string);

      const report = await storage.getFinancialReport(
        currentUser.restaurantId,
        branchId,
        startDate,
        endDate
      );

      res.json(report);
    } catch (error) {
      console.error('Financial report fetch error:', error);
      res.status(500).json({ message: "Erro ao buscar relatório financeiro" });
    }
  });

  // ===== INVENTORY ROUTES =====

  // Inventory Categories
  app.get("/api/inventory/categories", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user as User;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usuário não associado a um restaurante" });
      }

      await checkCanUseInventoryModule(storage, currentUser.restaurantId);

      const categories = await storage.getInventoryCategories(currentUser.restaurantId);
      res.json(categories);
    } catch (error: any) {
      if (error.name === 'PlanLimitError' || error.name === 'PlanFeatureError') {
        return res.status(403).json({ message: error.message });
      }
      console.error('Inventory categories fetch error:', error);
      res.status(500).json({ message: "Erro ao buscar categorias de inventário" });
    }
  });

  app.post("/api/inventory/categories", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user as User;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usuário não associado a um restaurante" });
      }

      await checkCanUseInventoryModule(storage, currentUser.restaurantId);

      const data = insertInventoryCategorySchema.parse(req.body);
      const category = await storage.createInventoryCategory(currentUser.restaurantId, data);
      res.json(category);
    } catch (error: any) {
      if (error.name === 'PlanLimitError' || error.name === 'PlanFeatureError') {
        return res.status(403).json({ message: error.message });
      }
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      console.error('Inventory category create error:', error);
      res.status(500).json({ message: "Erro ao criar categoria de inventário" });
    }
  });

  app.put("/api/inventory/categories/:id", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user as User;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usuário não associado a um restaurante" });
      }

      const data = updateInventoryCategorySchema.parse(req.body);
      const category = await storage.updateInventoryCategory(req.params.id, currentUser.restaurantId, data);
      res.json(category);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      console.error('Inventory category update error:', error);
      res.status(500).json({ message: "Erro ao atualizar categoria" });
    }
  });

  app.delete("/api/inventory/categories/:id", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user as User;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usuário não associado a um restaurante" });
      }

      await storage.deleteInventoryCategory(req.params.id, currentUser.restaurantId);
      res.json({ message: "Categoria deletada com sucesso" });
    } catch (error) {
      console.error('Inventory category delete error:', error);
      res.status(500).json({ message: "Erro ao deletar categoria" });
    }
  });

  // Measurement Units
  app.get("/api/inventory/units", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user as User;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usuário não associado a um restaurante" });
      }

      const units = await storage.getMeasurementUnits(currentUser.restaurantId);
      res.json(units);
    } catch (error) {
      console.error('Measurement units fetch error:', error);
      res.status(500).json({ message: "Erro ao buscar unidades de medida" });
    }
  });

  app.post("/api/inventory/units", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user as User;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usuário não associado a um restaurante" });
      }

      const data = insertMeasurementUnitSchema.parse(req.body);
      const unit = await storage.createMeasurementUnit(currentUser.restaurantId, data);
      res.json(unit);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      console.error('Measurement unit create error:', error);
      res.status(500).json({ message: "Erro ao criar unidade de medida" });
    }
  });

  app.put("/api/inventory/units/:id", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user as User;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usuário não associado a um restaurante" });
      }

      const data = updateMeasurementUnitSchema.parse(req.body);
      const unit = await storage.updateMeasurementUnit(req.params.id, currentUser.restaurantId, data);
      res.json(unit);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      console.error('Measurement unit update error:', error);
      res.status(500).json({ message: "Erro ao atualizar unidade" });
    }
  });

  app.delete("/api/inventory/units/:id", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user as User;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usuário não associado a um restaurante" });
      }

      await storage.deleteMeasurementUnit(req.params.id, currentUser.restaurantId);
      res.json({ message: "Unidade deletada com sucesso" });
    } catch (error) {
      console.error('Measurement unit delete error:', error);
      res.status(500).json({ message: "Erro ao deletar unidade" });
    }
  });

  // Inventory Items
  app.get("/api/inventory/items", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user as User;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usuário não associado a um restaurante" });
      }

      await checkCanUseInventoryModule(storage, currentUser.restaurantId);

      const filters: any = {};
      if (req.query.categoryId) filters.categoryId = req.query.categoryId as string;
      if (req.query.isActive) filters.isActive = parseInt(req.query.isActive as string);

      const items = await storage.getInventoryItems(currentUser.restaurantId, filters);
      res.json(items);
    } catch (error: any) {
      if (error.name === 'PlanLimitError' || error.name === 'PlanFeatureError') {
        return res.status(403).json({ message: error.message });
      }
      console.error('Inventory items fetch error:', error);
      res.status(500).json({ message: "Erro ao buscar itens de inventário" });
    }
  });

  app.get("/api/inventory/items/:id", isAdmin, async (req, res) => {
    try {
      const item = await storage.getInventoryItemById(req.params.id);
      if (!item) {
        return res.status(404).json({ message: "Item não encontrado" });
      }
      res.json(item);
    } catch (error) {
      console.error('Inventory item fetch error:', error);
      res.status(500).json({ message: "Erro ao buscar item" });
    }
  });

  app.post("/api/inventory/items", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user as User;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usuário não associado a um restaurante" });
      }

      await checkCanAddInventoryItem(storage, currentUser.restaurantId);

      const data = insertInventoryItemSchema.parse(req.body);
      const item = await storage.createInventoryItem(currentUser.restaurantId, data);
      res.json(item);
    } catch (error: any) {
      if (error.name === 'PlanLimitError' || error.name === 'PlanFeatureError') {
        return res.status(403).json({ message: error.message });
      }
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      console.error('Inventory item create error:', error);
      res.status(500).json({ message: "Erro ao criar item de inventário" });
    }
  });

  app.put("/api/inventory/items/:id", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user as User;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usuário não associado a um restaurante" });
      }

      const data = updateInventoryItemSchema.parse(req.body);
      const item = await storage.updateInventoryItem(req.params.id, currentUser.restaurantId, data);
      res.json(item);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      console.error('Inventory item update error:', error);
      res.status(500).json({ message: "Erro ao atualizar item" });
    }
  });

  app.delete("/api/inventory/items/:id", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user as User;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usuário não associado a um restaurante" });
      }

      await storage.deleteInventoryItem(req.params.id, currentUser.restaurantId);
      res.json({ message: "Item deletado com sucesso" });
    } catch (error) {
      console.error('Inventory item delete error:', error);
      res.status(500).json({ message: "Erro ao deletar item" });
    }
  });

  // Branch Stock
  app.get("/api/inventory/stock", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user as User;
      if (!currentUser.restaurantId || !currentUser.activeBranchId) {
        return res.status(403).json({ message: "Usuário não associado a um restaurante ou filial" });
      }

      const stocks = await storage.getBranchStock(currentUser.restaurantId, currentUser.activeBranchId);
      res.json(stocks);
    } catch (error) {
      console.error('Branch stock fetch error:', error);
      res.status(500).json({ message: "Erro ao buscar estoque" });
    }
  });

  // Stock Movements
  app.get("/api/inventory/movements", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user as User;
      if (!currentUser.restaurantId || !currentUser.activeBranchId) {
        return res.status(403).json({ message: "Usuário não associado a um restaurante ou filial" });
      }

      const filters: any = {};
      if (req.query.inventoryItemId) filters.inventoryItemId = req.query.inventoryItemId as string;
      if (req.query.movementType) filters.movementType = req.query.movementType as any;
      if (req.query.startDate) filters.startDate = new Date(req.query.startDate as string);
      if (req.query.endDate) filters.endDate = new Date(req.query.endDate as string);

      const movements = await storage.getStockMovements(
        currentUser.restaurantId,
        currentUser.activeBranchId,
        filters
      );
      res.json(movements);
    } catch (error) {
      console.error('Stock movements fetch error:', error);
      res.status(500).json({ message: "Erro ao buscar movimentações" });
    }
  });

  app.post("/api/inventory/movements", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user as User;
      if (!currentUser.restaurantId || !currentUser.activeBranchId) {
        return res.status(403).json({ message: "Usuário não associado a um restaurante ou filial" });
      }

      const data = insertStockMovementSchema.parse(req.body);
      
      if (!data.branchId) {
        data.branchId = currentUser.activeBranchId;
      }

      const movement = await storage.createStockMovement(
        currentUser.restaurantId,
        currentUser.id,
        data
      );
      res.json(movement);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      if (error instanceof Error) {
        return res.status(400).json({ message: error.message });
      }
      console.error('Stock movement create error:', error);
      res.status(500).json({ message: "Erro ao criar movimentação" });
    }
  });

  // Inventory Stats
  app.get("/api/inventory/stats", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user as User;
      if (!currentUser.restaurantId || !currentUser.activeBranchId) {
        return res.status(403).json({ message: "Usuário não associado a um restaurante ou filial" });
      }

      const stats = await storage.getInventoryStats(currentUser.restaurantId, currentUser.activeBranchId);
      res.json(stats);
    } catch (error) {
      console.error('Inventory stats fetch error:', error);
      res.status(500).json({ message: "Erro ao buscar estatísticas" });
    }
  });

  // ===== CUSTOMER ROUTES =====

  app.get("/api/customers", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user as User;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usuário não associado a um restaurante" });
      }

      const { search, isActive } = req.query;
      const filters: any = {};
      
      if (search) filters.search = search as string;
      if (isActive !== undefined) filters.isActive = parseInt(isActive as string);

      const customers = await storage.getCustomers(
        currentUser.restaurantId,
        currentUser.activeBranchId,
        filters
      );
      res.json(customers);
    } catch (error) {
      console.error('Customers fetch error:', error);
      res.status(500).json({ message: "Erro ao buscar clientes" });
    }
  });

  app.get("/api/customers/stats", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user as User;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usuário não associado a um restaurante" });
      }

      const stats = await storage.getCustomerStats(
        currentUser.restaurantId,
        currentUser.activeBranchId || null
      );
      res.json(stats);
    } catch (error) {
      console.error('Customer stats fetch error:', error);
      res.status(500).json({ message: "Erro ao buscar estatísticas de clientes" });
    }
  });

  app.get("/api/customers/:id", isAuthenticated, async (req, res) => {
    try {
      const customer = await storage.getCustomerById(req.params.id);
      if (!customer) {
        return res.status(404).json({ message: "Cliente não encontrado" });
      }
      res.json(customer);
    } catch (error) {
      console.error('Customer fetch error:', error);
      res.status(500).json({ message: "Erro ao buscar cliente" });
    }
  });

  app.post("/api/customers", isAuthenticated, async (req, res) => {
    try {
      const currentUser = req.user as User;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usuário não associado a um restaurante" });
      }

      await checkCanAddCustomer(storage, currentUser.restaurantId);

      const validatedData = insertCustomerSchema.parse(req.body);

      if (validatedData.phone) {
        const existing = await storage.getCustomerByPhone(currentUser.restaurantId, validatedData.phone);
        if (existing) {
          return res.status(400).json({ message: "Já existe um cliente com este telefone" });
        }
      }

      if (validatedData.cpf) {
        const existing = await storage.getCustomerByCpf(currentUser.restaurantId, validatedData.cpf);
        if (existing) {
          return res.status(400).json({ message: "Já existe um cliente com este CPF" });
        }
      }

      const customer = await storage.createCustomer(
        currentUser.restaurantId,
        currentUser.activeBranchId || null,
        validatedData
      );
      res.status(201).json(customer);
    } catch (error: any) {
      console.error('Customer creation error:', error);
      if (error.name === 'PlanLimitError' || error.name === 'PlanFeatureError') {
        return res.status(403).json({ message: error.message });
      }
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Erro ao criar cliente" });
    }
  });

  app.put("/api/customers/:id", isAuthenticated, async (req, res) => {
    try {
      const currentUser = req.user as User;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usuário não associado a um restaurante" });
      }

      const validatedData = updateCustomerSchema.parse(req.body);
      const customer = await storage.updateCustomer(req.params.id, currentUser.restaurantId, validatedData);
      res.json(customer);
    } catch (error: any) {
      console.error('Customer update error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Erro ao atualizar cliente" });
    }
  });

  app.delete("/api/customers/:id", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user as User;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usuário não associado a um restaurante" });
      }

      await storage.deleteCustomer(req.params.id, currentUser.restaurantId);
      res.status(204).send();
    } catch (error) {
      console.error('Customer deletion error:', error);
      res.status(500).json({ message: "Erro ao excluir cliente" });
    }
  });

  // ===== LOYALTY PROGRAM ROUTES =====

  app.get("/api/loyalty/program", isAuthenticated, async (req, res) => {
    try {
      const currentUser = req.user as User;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usuário não associado a um restaurante" });
      }

      await checkCanUseLoyaltyProgram(storage, currentUser.restaurantId);

      const program = await storage.getLoyaltyProgram(currentUser.restaurantId);
      res.json(program || null);
    } catch (error: any) {
      if (error.name === 'PlanLimitError' || error.name === 'PlanFeatureError') {
        return res.status(403).json({ message: error.message });
      }
      console.error('Loyalty program fetch error:', error);
      res.status(500).json({ message: "Erro ao buscar programa de fidelidade" });
    }
  });

  app.post("/api/loyalty/program", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user as User;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usuário não associado a um restaurante" });
      }

      await checkCanUseLoyaltyProgram(storage, currentUser.restaurantId);

      const validatedData = insertLoyaltyProgramSchema.parse(req.body);
      const program = await storage.createOrUpdateLoyaltyProgram(currentUser.restaurantId, validatedData);
      res.json(program);
    } catch (error: any) {
      if (error.name === 'PlanLimitError' || error.name === 'PlanFeatureError') {
        return res.status(403).json({ message: error.message });
      }
      console.error('Loyalty program creation error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Erro ao criar/atualizar programa de fidelidade" });
    }
  });

  app.get("/api/loyalty/transactions", isAuthenticated, async (req, res) => {
    try {
      const currentUser = req.user as User;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usuário não associado a um restaurante" });
      }

      await checkCanUseLoyaltyProgram(storage, currentUser.restaurantId);

      const { customerId, startDate, endDate } = req.query;
      const filters: any = {};
      
      if (startDate) filters.startDate = new Date(startDate as string);
      if (endDate) filters.endDate = new Date(endDate as string);

      const transactions = await storage.getLoyaltyTransactions(
        currentUser.restaurantId,
        customerId as string,
        filters
      );
      res.json(transactions);
    } catch (error: any) {
      if (error.name === 'PlanLimitError' || error.name === 'PlanFeatureError') {
        return res.status(403).json({ message: error.message });
      }
      console.error('Loyalty transactions fetch error:', error);
      res.status(500).json({ message: "Erro ao buscar transações de fidelidade" });
    }
  });

  app.get("/api/loyalty/stats", isAuthenticated, async (req, res) => {
    try {
      const currentUser = req.user as User;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usuário não associado a um restaurante" });
      }

      await checkCanUseLoyaltyProgram(storage, currentUser.restaurantId);

      const stats = await storage.getLoyaltyStats(currentUser.restaurantId);
      res.json(stats);
    } catch (error: any) {
      if (error.name === 'PlanLimitError' || error.name === 'PlanFeatureError') {
        return res.status(403).json({ message: error.message });
      }
      console.error('Loyalty stats fetch error:', error);
      res.status(500).json({ message: "Erro ao buscar estatísticas de fidelidade" });
    }
  });

  app.post("/api/loyalty/redeem", isAuthenticated, async (req, res) => {
    try {
      const currentUser = req.user as User;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usuário não associado a um restaurante" });
      }

      await checkCanUseLoyaltyProgram(storage, currentUser.restaurantId);

      const { customerId, points, orderId } = req.body;

      if (!customerId || !points) {
        return res.status(400).json({ message: "customerId e points são obrigatórios" });
      }

      const result = await storage.redeemLoyaltyPoints(
        currentUser.restaurantId,
        customerId,
        parseInt(points),
        orderId,
        currentUser.id
      );
      res.json(result);
    } catch (error: any) {
      if (error.name === 'PlanLimitError' || error.name === 'PlanFeatureError') {
        return res.status(403).json({ message: error.message });
      }
      console.error('Loyalty redeem error:', error);
      res.status(400).json({ message: error.message || "Erro ao resgatar pontos" });
    }
  });

  // ===== COUPON ROUTES =====

  app.get("/api/coupons", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user as User;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usuário não associado a um restaurante" });
      }

      await checkCanUseCouponSystem(storage, currentUser.restaurantId);

      const { isActive, code } = req.query;
      const filters: any = {};
      
      if (isActive !== undefined) filters.isActive = parseInt(isActive as string);
      if (code) filters.code = code as string;

      const coupons = await storage.getCoupons(
        currentUser.restaurantId,
        currentUser.activeBranchId,
        filters
      );
      res.json(coupons);
    } catch (error: any) {
      if (error.name === 'PlanLimitError' || error.name === 'PlanFeatureError') {
        return res.status(403).json({ message: error.message });
      }
      console.error('Coupons fetch error:', error);
      res.status(500).json({ message: "Erro ao buscar cupons" });
    }
  });

  app.get("/api/coupons/stats", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user as User;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usuário não associado a um restaurante" });
      }

      await checkCanUseCouponSystem(storage, currentUser.restaurantId);

      const stats = await storage.getCouponStats(
        currentUser.restaurantId,
        currentUser.activeBranchId || null
      );
      res.json(stats);
    } catch (error: any) {
      if (error.name === 'PlanLimitError' || error.name === 'PlanFeatureError') {
        return res.status(403).json({ message: error.message });
      }
      console.error('Coupon stats fetch error:', error);
      res.status(500).json({ message: "Erro ao buscar estatísticas de cupons" });
    }
  });

  app.get("/api/coupons/:id", isAuthenticated, async (req, res) => {
    try {
      const coupon = await storage.getCouponById(req.params.id);
      if (!coupon) {
        return res.status(404).json({ message: "Cupom não encontrado" });
      }
      res.json(coupon);
    } catch (error) {
      console.error('Coupon fetch error:', error);
      res.status(500).json({ message: "Erro ao buscar cupom" });
    }
  });

  app.post("/api/coupons", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user as User;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usuário não associado a um restaurante" });
      }

      await checkCanCreateCoupon(storage, currentUser.restaurantId);

      const validatedData = insertCouponSchema.parse(req.body);

      const existing = await storage.getCouponByCode(currentUser.restaurantId, validatedData.code);
      if (existing) {
        return res.status(400).json({ message: "Já existe um cupom com este código" });
      }

      const coupon = await storage.createCoupon(
        currentUser.restaurantId,
        currentUser.activeBranchId || null,
        validatedData,
        currentUser.id
      );
      res.status(201).json(coupon);
    } catch (error: any) {
      console.error('Coupon creation error:', error);
      if (error.name === 'PlanLimitError' || error.name === 'PlanFeatureError') {
        return res.status(403).json({ message: error.message });
      }
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Erro ao criar cupom" });
    }
  });

  app.put("/api/coupons/:id", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user as User;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usuário não associado a um restaurante" });
      }

      const validatedData = updateCouponSchema.parse(req.body);
      const coupon = await storage.updateCoupon(req.params.id, currentUser.restaurantId, validatedData);
      res.json(coupon);
    } catch (error: any) {
      console.error('Coupon update error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Erro ao atualizar cupom" });
    }
  });

  app.delete("/api/coupons/:id", isAdmin, async (req, res) => {
    try {
      const currentUser = req.user as User;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usuário não associado a um restaurante" });
      }

      await storage.deleteCoupon(req.params.id, currentUser.restaurantId);
      res.status(204).send();
    } catch (error) {
      console.error('Coupon deletion error:', error);
      res.status(500).json({ message: "Erro ao excluir cupom" });
    }
  });

  app.post("/api/coupons/validate", isAuthenticated, async (req, res) => {
    try {
      const currentUser = req.user as User;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usuário não associado a um restaurante" });
      }

      await checkCanUseCouponSystem(storage, currentUser.restaurantId);

      const { code, orderValue, orderType, customerId } = req.body;

      if (!code || orderValue === undefined) {
        return res.status(400).json({ message: "code e orderValue são obrigatórios" });
      }

      const result = await storage.validateCoupon(
        currentUser.restaurantId,
        code,
        parseFloat(orderValue),
        orderType,
        customerId
      );
      res.json(result);
    } catch (error: any) {
      if (error.name === 'PlanLimitError' || error.name === 'PlanFeatureError') {
        return res.status(403).json({ message: error.message });
      }
      console.error('Coupon validation error:', error);
      res.status(500).json({ message: "Erro ao validar cupom" });
    }
  });

  app.get("/api/coupon-usages", isAuthenticated, async (req, res) => {
    try {
      const currentUser = req.user as User;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usuário não associado a um restaurante" });
      }

      const { couponId, customerId, startDate, endDate } = req.query;
      const filters: any = {};
      
      if (couponId) filters.couponId = couponId as string;
      if (customerId) filters.customerId = customerId as string;
      if (startDate) filters.startDate = new Date(startDate as string);
      if (endDate) filters.endDate = new Date(endDate as string);

      const usages = await storage.getCouponUsages(currentUser.restaurantId, filters);
      res.json(usages);
    } catch (error) {
      console.error('Coupon usages fetch error:', error);
      res.status(500).json({ message: "Erro ao buscar usos de cupons" });
    }
  });

  // Subscription Plan routes
  app.get("/api/subscription-plans", async (req, res) => {
    try {
      let plans = await storage.getSubscriptionPlans();
      
      // Auto-seed plans if they don't exist
      if (plans.length === 0) {
        console.log('⚠️  No subscription plans found. Auto-seeding...');
        await storage.seedSubscriptionPlans();
        plans = await storage.getSubscriptionPlans();
        console.log(`✅ Auto-seeded ${plans.length} subscription plans`);
      }
      
      res.json(plans);
    } catch (error) {
      console.error('Subscription plans fetch error:', error);
      res.status(500).json({ message: "Erro ao buscar planos de subscrição" });
    }
  });

  app.get("/api/subscription-plans/:id", async (req, res) => {
    try {
      const plan = await storage.getSubscriptionPlanById(req.params.id);
      if (!plan) {
        return res.status(404).json({ message: "Plano não encontrado" });
      }
      res.json(plan);
    } catch (error) {
      console.error('Subscription plan fetch error:', error);
      res.status(500).json({ message: "Erro ao buscar plano de subscrição" });
    }
  });

  app.get("/api/superadmin/subscription-plans", isSuperAdmin, async (req, res) => {
    try {
      const plans = await storage.getAllSubscriptionPlans();
      res.json(plans);
    } catch (error) {
      console.error('Subscription plans fetch error:', error);
      res.status(500).json({ message: "Erro ao buscar planos de subscrição" });
    }
  });

  app.patch("/api/superadmin/subscription-plans/:id", isSuperAdmin, async (req, res) => {
    try {
      const plan = await storage.getSubscriptionPlanById(req.params.id);
      if (!plan) {
        return res.status(404).json({ message: "Plano não encontrado" });
      }

      const validatedData = updateSubscriptionPlanSchema.parse(req.body);
      const updatedPlan = await storage.updateSubscriptionPlan(req.params.id, validatedData);
      res.json(updatedPlan);
    } catch (error: any) {
      console.error('Subscription plan update error:', error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Erro ao atualizar plano" });
    }
  });

  // Subscription routes
  app.get("/api/subscription", isAuthenticated, async (req, res) => {
    try {
      const currentUser = req.user as User;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usuário não associado a um restaurante" });
      }

      const subscription = await storage.getSubscriptionByRestaurantId(currentUser.restaurantId);
      if (!subscription) {
        return res.status(404).json({ message: "Subscrição não encontrada" });
      }
      res.json(subscription);
    } catch (error) {
      console.error('Subscription fetch error:', error);
      res.status(500).json({ message: "Erro ao buscar subscrição" });
    }
  });

  app.post("/api/subscription", isAuthenticated, async (req, res) => {
    try {
      const currentUser = req.user as User;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usuário não associado a um restaurante" });
      }

      if (currentUser.role !== 'admin' && currentUser.role !== 'superadmin') {
        return res.status(403).json({ message: "Apenas administradores podem criar subscrições" });
      }

      // Check if subscription already exists
      const existingSubscription = await storage.getSubscriptionByRestaurantId(currentUser.restaurantId);
      if (existingSubscription) {
        return res.status(409).json({ message: "Restaurante já possui uma subscrição ativa. Use PATCH para alterar." });
      }

      const validatedData = insertSubscriptionSchema.parse(req.body);
      
      // Get plan to check trial days
      const plan = await storage.getSubscriptionPlanById(validatedData.planId);
      if (!plan) {
        return res.status(404).json({ message: "Plano não encontrado" });
      }

      // Calculate period dates
      const now = new Date();
      const trialDays = plan.trialDays || 0;
      const trialStart = trialDays > 0 ? now : null;
      const trialEnd = trialDays > 0 ? new Date(now.getTime() + trialDays * 24 * 60 * 60 * 1000) : null;
      
      // Period starts after trial or immediately
      const periodStart = trialEnd || now;
      const periodEnd = new Date(periodStart);
      if (validatedData.billingInterval === 'anual') {
        periodEnd.setFullYear(periodEnd.getFullYear() + 1);
      } else {
        periodEnd.setMonth(periodEnd.getMonth() + 1);
      }

      const subscriptionData: any = {
        planId: validatedData.planId,
        billingInterval: validatedData.billingInterval,
        currency: validatedData.currency,
        status: trialDays > 0 ? ('trial' as const) : ('ativa' as const),
        currentPeriodStart: periodStart,
        currentPeriodEnd: periodEnd,
        trialStart,
        trialEnd,
        autoRenew: 1,
        cancelAtPeriodEnd: 0,
      };

      const subscription = await storage.createSubscription(currentUser.restaurantId, subscriptionData);
      res.status(201).json(subscription);
    } catch (error: any) {
      console.error('Subscription creation error:', error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Erro ao criar subscrição" });
    }
  });

  app.patch("/api/subscription", isAuthenticated, async (req, res) => {
    try {
      const currentUser = req.user as User;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usuário não associado a um restaurante" });
      }

      if (currentUser.role !== 'admin' && currentUser.role !== 'superadmin') {
        return res.status(403).json({ message: "Apenas administradores podem atualizar subscrições" });
      }

      const validatedData = updateSubscriptionSchema.parse(req.body);
      
      // If changing plan or billing interval, recalculate period dates
      let updateData: any = {};
      
      if (validatedData.planId || validatedData.billingInterval) {
        const currentSubscription = await storage.getSubscriptionByRestaurantId(currentUser.restaurantId);
        if (!currentSubscription) {
          return res.status(404).json({ message: "Subscrição não encontrada" });
        }

        // Get new plan details if changing plan
        let planId = validatedData.planId || currentSubscription.planId;
        let billingInterval = validatedData.billingInterval || currentSubscription.billingInterval;
        
        const plan = await storage.getSubscriptionPlanById(planId);
        if (!plan) {
          return res.status(404).json({ message: "Plano não encontrado" });
        }

        // Recalculate period dates starting from now
        const now = new Date();
        const periodEnd = new Date(now);
        if (billingInterval === 'anual') {
          periodEnd.setFullYear(periodEnd.getFullYear() + 1);
        } else {
          periodEnd.setMonth(periodEnd.getMonth() + 1);
        }

        // Explicitly set all fields for plan/interval changes
        updateData.planId = planId;
        updateData.billingInterval = billingInterval;
        updateData.currentPeriodStart = now;
        updateData.currentPeriodEnd = periodEnd;
        // Clear trial dates when upgrading/changing plan
        updateData.trialStart = null;
        updateData.trialEnd = null;
        // Set status to active when changing plan
        updateData.status = 'ativa';
      } else {
        // For other updates (status, cancelAtPeriodEnd, autoRenew), pass through validated data
        updateData = { ...validatedData };
      }

      const subscription = await storage.updateSubscription(currentUser.restaurantId, updateData);
      res.json(subscription);
    } catch (error: any) {
      console.error('Subscription update error:', error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      }
      if (error.message === 'Subscrição não encontrada') {
        return res.status(404).json({ message: error.message });
      }
      res.status(500).json({ message: "Erro ao atualizar subscrição" });
    }
  });

  app.delete("/api/subscription", isAuthenticated, async (req, res) => {
    try {
      const currentUser = req.user as User;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usuário não associado a um restaurante" });
      }

      if (currentUser.role !== 'admin' && currentUser.role !== 'superadmin') {
        return res.status(403).json({ message: "Apenas administradores podem cancelar subscrições" });
      }

      const subscription = await storage.cancelSubscription(currentUser.restaurantId);
      res.json(subscription);
    } catch (error: any) {
      console.error('Subscription cancellation error:', error);
      if (error.message === 'Subscrição não encontrada') {
        return res.status(404).json({ message: error.message });
      }
      res.status(500).json({ message: "Erro ao cancelar subscrição" });
    }
  });

  app.get("/api/subscription/limits", isAuthenticated, async (req, res) => {
    try {
      const currentUser = req.user as User;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usuário não associado a um restaurante" });
      }

      const limits = await storage.checkSubscriptionLimits(currentUser.restaurantId);
      res.json(limits);
    } catch (error: any) {
      console.error('Subscription limits check error:', error);
      if (error.message === 'Restaurante não possui subscrição ativa') {
        return res.status(404).json({ message: error.message });
      }
      res.status(500).json({ message: "Erro ao verificar limites de subscrição" });
    }
  });

  // Subscription Payment routes
  app.get("/api/subscription/payments", isAuthenticated, async (req, res) => {
    try {
      const currentUser = req.user as User;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usuário não associado a um restaurante" });
      }

      const payments = await storage.getSubscriptionPayments(currentUser.restaurantId);
      res.json(payments);
    } catch (error) {
      console.error('Subscription payments fetch error:', error);
      res.status(500).json({ message: "Erro ao buscar pagamentos de subscrição" });
    }
  });

  app.post("/api/subscription/payments", isAuthenticated, async (req, res) => {
    try {
      const currentUser = req.user as User;
      if (!currentUser.restaurantId) {
        return res.status(403).json({ message: "Usuário não associado a um restaurante" });
      }

      if (currentUser.role !== 'admin' && currentUser.role !== 'superadmin') {
        return res.status(403).json({ message: "Apenas administradores podem registrar pagamentos" });
      }

      const validatedData = insertSubscriptionPaymentSchema.parse(req.body);
      const payment = await storage.createSubscriptionPayment(currentUser.restaurantId, validatedData);
      res.status(201).json(payment);
    } catch (error: any) {
      console.error('Subscription payment creation error:', error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Erro ao registrar pagamento" });
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
