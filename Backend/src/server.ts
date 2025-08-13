import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import session from "express-session";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import path from "path";
import cookieParser from 'cookie-parser';
import { PrismaClient } from "@prisma/client";

import mainRouter from "./routes";

dotenv.config();


const prisma = new PrismaClient();
const PORT = process.env.PORT || 9000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5000";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:8000";

const app = express();
app.use(cookieParser());

// Load Swagger document
const swaggerDocument = YAML.load(path.join(__dirname, "../docs/openapi.yaml"));

// Middleware

// Enable CORS with credentials support for frontend origin
app.use(
  cors({
    origin: CLIENT_ORIGIN,
    methods: ["GET", "POST", "OPTIONS"],
    credentials: true,
  })
);

app.use(express.json());

// Session configuration - secret should be in env and strong in prod
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-strong-session-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Passport user serialization/deserialization
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    done(null, user);
  } catch (err) {
    done(err);
  }
});

// Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: `http://localhost:${PORT}/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const firstName = profile.name?.givenName || "";
        const lastName = profile.name?.familyName || "";
        const email = profile.emails?.[0]?.value || "";

        let user = await prisma.user.findFirst({ where: { email } });

        if (!user) {
          user = await prisma.user.create({
            data: {
              firstName,
              lastName,
              email,
              phone: "",
              password: "",
              isEmailVerified: true,
            },
          });
        } else {
          user = await prisma.user.update({
            where: { id: user.id },
            data: {
              firstName,
              lastName,
              email,
              isEmailVerified: true,
              updatedAt: new Date(),
            },
          });
        }

        done(null, user);
      } catch (error) {
        done(error);
      }
    }
  )
);

// Auth Routes
app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    res.redirect(`${FRONTEND_URL}/profile`);
  }
);

app.get("/profile", (req, res) => {
  if (!req.isAuthenticated() || !req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const user = req.user as any;

  res.json({
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    isEmailVerified: user.isEmailVerified ?? false,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  });
});

app.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.json({ message: "Logged out successfully" });
  });
});

// Main API Routes
app.use("/", mainRouter);

// Root Route
app.get("/", (_req, res) => {
  res.send("Hello from TypeScript + Node.js!");
});

// Swagger UI docs route
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Start Server
app.listen(PORT, () => {
  console.log(`✅ Backend Server running at http://localhost:${PORT}`);
  console.log(`📚 API Docs available at http://localhost:${PORT}/api-docs`);
});








