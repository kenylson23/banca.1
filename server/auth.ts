import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import connectPg from "connect-pg-simple";
import bcrypt from "bcrypt";
import { storage } from "./storage";
import type { User } from "@shared/schema";

const SALT_ROUNDS = 10;

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true,
    ttl: sessionTtl,
    tableName: "sessions",
  });

  if (!process.env.SESSION_SECRET) {
    throw new Error("SESSION_SECRET must be set");
  }

  // Cookie configuration that works in both development and production
  // In production, the frontend and backend are served from the same domain
  // so we use 'lax' sameSite for better security
  const isProduction = process.env.NODE_ENV === "production";
  
  return session({
    secret: process.env.SESSION_SECRET,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: sessionTtl,
      // Ensure the cookie domain is not set, allowing it to work with subdomains
      domain: undefined,
    },
  });
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "password",
      },
      async (email, password, done) => {
        try {
          const user = await storage.getUserByEmail(email);
          
          if (!user) {
            return done(null, false, { message: "Email ou senha incorretos" });
          }

          const isValidPassword = await verifyPassword(password, user.password);
          
          if (!isValidPassword) {
            return done(null, false, { message: "Email ou senha incorretos" });
          }

          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  passport.serializeUser((user: Express.User, cb) => {
    cb(null, (user as User).id);
  });

  passport.deserializeUser(async (id: string, cb) => {
    try {
      const user = await storage.getUser(id);
      
      // Enhanced logging for debugging session/authentication issues
      if (process.env.NODE_ENV === 'production' || process.env.DEBUG_AUTH === 'true') {
        console.log('[AUTH] Deserializing user:', {
          userId: id,
          userFound: !!user,
          userRole: user?.role,
          hasRole: user ? 'role' in user : false,
        });
      }
      
      // Critical validation: ensure role is present
      if (user && !user.role) {
        console.error('[AUTH] CRITICAL: User loaded from database missing role field!', {
          userId: user.id,
          email: user.email,
          restaurantId: user.restaurantId,
          userKeys: Object.keys(user),
        });
        console.error('[AUTH] ACTION REQUIRED: Run the SQL repair script (scripts/repair-user-roles.sql) to fix this user\'s role.');
        console.error('[AUTH] This user will have LIMITED ACCESS (kitchen menu only) until role is manually set.');
        
        // DO NOT attempt automatic repair - it's unsafe and can cause privilege escalation
        // Kitchen staff have restaurantId, so we can't use that to determine role
        // Superadmin has no restaurantId, so we can't use that either
        // The ONLY safe approach is manual repair via SQL script
      }
      
      cb(null, user);
    } catch (error) {
      console.error('[AUTH] Error deserializing user:', error);
      cb(error);
    }
  });
}

export const isAuthenticated: RequestHandler = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  
  // Enhanced logging for debugging authentication issues
  if (process.env.NODE_ENV === 'production' || process.env.DEBUG_AUTH === 'true') {
    console.log('[AUTH] isAuthenticated check failed:', {
      hasSession: !!req.session,
      sessionID: req.sessionID,
      authenticated: req.isAuthenticated(),
      path: req.path,
    });
  }
  
  res.status(401).json({ message: "Não autenticado" });
};
