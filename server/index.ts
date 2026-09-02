import "../load-env";
import express, { type Request, Response, NextFunction } from "express";
import path from "path";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Uploaded media belongs to the API service, not the Vercel frontend.
// Keep the legacy path readable so existing database URLs continue to work.
const uploadRoot = path.resolve(process.env.UPLOAD_DIR || "uploads");
const legacyUploadRoot = path.resolve("client/public/uploads");
app.use("/uploads", express.static(uploadRoot));
app.use("/uploads", express.static(legacyUploadRoot));

// CORS para deploy separado (frontend na Vercel)
const allowedOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map(s => s.trim())
  .filter(Boolean);
const allowAnyOrigin = process.env.NODE_ENV !== "production" && allowedOrigins.length === 0;

app.use((req, res, next) => {
  const origin = req.headers.origin as string | undefined;
  if (origin && (allowAnyOrigin || allowedOrigins.includes(origin))) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization,X-Guest-Token");
  }
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
});

app.use((req, res, next) => {
  if (req.path === '/sw.js' || req.path === '/version.json' || req.path === '/manifest.json') {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  } else if (req.path === '/' || req.path === '/index.html' || req.path.endsWith('.html')) {
    res.setHeader('Cache-Control', 'no-cache, must-revalidate');
  }
  next();
});

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Initialize database tables
  try {
    const { ensureTablesExist } = await import('./initDb');
    await ensureTablesExist();
  } catch (error) {
    console.error('Failed to initialize database:', error instanceof Error ? error.message : error);
    console.error('The application requires a database connection to run.');
    console.error('Please ensure DATABASE_URL environment variable is set with your PostgreSQL connection string.');
    process.exit(1);
  }

  // 🚀 AUTO-MIGRATIONS: Executar migrações pendentes automaticamente
  try {
    const { runAutoMigrationsSafe } = await import('./auto-migrate');
    await runAutoMigrationsSafe();
  } catch (error) {
    console.warn('⚠️  Sistema de auto-migrações não disponível');
  }

  // 🔧 AUTO-FIX: Corrigir pedidos sem sessionId
  try {
    console.log('🔧 Corrigindo pedidos sem tableSessionId...');
    const { db, sql } = await import('./storage');
    await db.execute(sql`
      UPDATE orders
      SET table_session_id = (
        SELECT tg.session_id
        FROM table_guests tg
        WHERE tg.id = orders.guest_id
      )
      WHERE orders.table_session_id IS NULL
        AND orders.guest_id IS NOT NULL
        AND EXISTS (
          SELECT 1 FROM table_guests tg
          WHERE tg.id = orders.guest_id
        )
    `);
    console.log('✅ Pedidos corrigidos automaticamente (tableSessionId)!');
  } catch (fixError) {
    console.log('⚠️ Aviso: Não foi possível corrigir pedidos automaticamente');
    console.log('   Isso é normal se não houver pedidos para corrigir.');
  }

  // 🔧 Setup migration endpoints (before other routes)
  try {
    const { setupMigrationEndpoint } = await import('./migration-endpoint');
    setupMigrationEndpoint(app);
  } catch (error) {
    console.warn('⚠️  Endpoint de migrações não disponível');
  }

  const server = await registerRoutes(app);
  
  // Generate missing slugs for restaurants (after everything is initialized)
  try {
    const { storage } = await import('./storage');
    await storage.generateMissingSlugs();
  } catch (error) {
    console.error('Error generating missing slugs:', error);
  }

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else if (process.env.SERVE_STATIC === "true") {
    // Em produção, só servimos o frontend estático se explicitamente solicitado
    // (deploy monolítico). Em deploy separado (Railway), deixe SERVE_STATIC=false
    serveStatic(app);
  } else {
    // O Railway hospeda apenas a API; a raiz continua útil para diagnóstico
    // sem reativar o frontend nesse serviço.
    app.get("/", (_req, res) => {
      res.status(200).json({
        service: "NaBancada API",
        status: "ok",
        health: "/api/health",
        message: "O frontend é servido separadamente pela Vercel.",
      });
    });
    log("Running in API-only mode (frontend deployed separately)");
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Cloud platforms like Render automatically set this variable
  // Default to 5000 for local development
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`NaBancada server running on port ${port}`);
    log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
})();
