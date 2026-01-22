import express from "express";
import * as dotenv from "dotenv";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import session from "express-session";
import passport from "passport";
import optionalAuth from "@/shared/middlewares/optionalAuth";

dotenv.config();

import { SocketManager } from "@/infra/socket/socket";
import { configureRoutes } from "@/routes";
import { graphqlHTTP } from "express-graphql";
import { productSchema } from "@/modules/product/graphql/schema";
import { analyticsSchema } from "@/modules/analytics/graphql/schema";
import { mergeSchemas } from "@graphql-tools/schema";
import prisma from "@/infra/database/database.config";
import "./infra/cloudinary/config";

export const createApp = async () => {
  console.log("🔄 Creating Express app...");

  const app = express();
  const httpServer = require("http").createServer(app);

  // Combine all GraphQL schemas
  const schema = mergeSchemas({
    schemas: [productSchema, analyticsSchema],
  });

  // Initialize Socket.IO
  const socketManager = new SocketManager(httpServer);
  const io = socketManager.getIO();

  // 1. Health check routes (first)
  app.get("/health", (req, res) => {
    res.json({
      status: "ok",
      timestamp: new Date().toISOString()
    });
  });

  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      timestamp: new Date().toISOString()
    });
  });

  // 2. CORS
  const allowedOrigins = process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(",") 
    : ["http://localhost:3000", "http://localhost:3001","https://macyemacye.netlify.app", "http://localhost:5173"];

  app.use(cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"]
  }));

  // 3. Security middleware
  app.use(helmet());
  app.use(compression());

  // 4. Body parsing
  app.use(express.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(cookieParser());

  // 5. Session (memory store)
  app.use(session({
    secret: process.env.SESSION_SECRET || "dev-session-secret",
    resave: false,
    saveUninitialized: true,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
    }
  }));

  // 6. Passport (basic)
  app.use(passport.initialize());
  app.use(passport.session());

  // 7. Logging
  app.use(morgan("dev"));

  // 8. Real Routes
  app.use(
    "/api/v1/graphql",
    optionalAuth,
    graphqlHTTP((req, res) => ({
      schema: schema,
      graphiql: true,
      context: { prisma, req, res },
    }))
  );
  app.use("/api", configureRoutes(io));

  // 9. Legacy/Mock Routes (Compatibility)
  app.get("/", (req, res) => {
    res.json({
      message: "macyemacye API is running!",
      version: "1.0",
      endpoints: {
        health: "/health",
        api: "/api/v1"
      }
    });
  });

  // Count endpoint (Mock - consider moving to real stats)
  app.get("/count", (req, res) => {
    try {
      res.json({
        users: 1,
        products: 2,
        categories: 3,
        orders: 0
      });
    } catch (error: any) {
      console.error("Error in /count endpoint:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: error.message
      });
    }
  });

  // Products direct access (keeping for compatibility if needed, but real API is at /api/v1/products)
  app.get("/products", (req, res) => {
    res.redirect("/api/v1/products");
  });

  // 10. 404 handler
  app.use((req, res) => {
    res.status(404).json({
      error: "Not found",
      path: req.path,
      method: req.method
    });
  });

  // 11. Error handler
  // 11. Error handler
  app.use((err: any, req: any, res: any, next: any) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || "Internal server error";

    if (
      err.name === "PrismaClientInitializationError" ||
      err.name === "PrismaClientKnownRequestError" ||
      err.message?.includes("Can't reach database server") ||
      err.code === "P1001"
    ) {
      statusCode = 503;
      message = "Database connection issue. Please try again later.";
      console.error("❌ Database connection issue: Unable to reach database server.");
    } else {
      console.error("Server error:", err);
    }

    res.status(statusCode).json({
      status: err.status || "error",
      message: message,
      details: err.details || undefined
    });
  });

  console.log("✅ Express app created successfully");
  console.log("✅ Ready to accept requests");

  return { app, httpServer };
};
