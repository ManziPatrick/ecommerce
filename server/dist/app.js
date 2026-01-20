"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = void 0;
const express_1 = __importDefault(require("express"));
const dotenv = __importStar(require("dotenv"));
const body_parser_1 = __importDefault(require("body-parser"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const compression_1 = __importDefault(require("compression"));
const express_session_1 = __importDefault(require("express-session"));
const passport_1 = __importDefault(require("passport"));
const optionalAuth_1 = __importDefault(require("@/shared/middlewares/optionalAuth"));
dotenv.config();
const socket_1 = require("@/infra/socket/socket");
const routes_1 = require("@/routes");
const express_graphql_1 = require("express-graphql");
const schema_1 = require("@/modules/product/graphql/schema");
const schema_2 = require("@/modules/analytics/graphql/schema");
const schema_3 = require("@graphql-tools/schema");
const database_config_1 = __importDefault(require("@/infra/database/database.config"));
require("./infra/cloudinary/config");
const createApp = async () => {
    console.log("🔄 Creating Express app...");
    const app = (0, express_1.default)();
    const httpServer = require("http").createServer(app);
    // Combine all GraphQL schemas
    const schema = (0, schema_3.mergeSchemas)({
        schemas: [schema_1.productSchema, schema_2.analyticsSchema],
    });
    // Initialize Socket.IO
    const socketManager = new socket_1.SocketManager(httpServer);
    const io = socketManager.getIO();
    // 1. Health check route (first)
    app.get("/health", (req, res) => {
        res.json({
            status: "healthy",
            service: "macyemacye API",
            timestamp: new Date().toISOString()
        });
    });
    // 2. CORS
    app.use("*", (0, cors_1.default)({
        origin: [
            "http://localhost:3000",
            "http://localhost:3001",
            "http://localhost:5173",
            "http://172.20.10.3:3000"
        ],
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"]
    }));
    // 3. Security middleware
    app.use((0, helmet_1.default)());
    app.use((0, compression_1.default)());
    // 4. Body parsing
    app.use(express_1.default.json());
    app.use(body_parser_1.default.urlencoded({ extended: true }));
    app.use((0, cookie_parser_1.default)());
    // 5. Session (memory store)
    app.use((0, express_session_1.default)({
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
    app.use(passport_1.default.initialize());
    app.use(passport_1.default.session());
    // 7. Logging
    app.use((0, morgan_1.default)("dev"));
    // 8. Real Routes
    app.use("/api/v1/graphql", optionalAuth_1.default, (0, express_graphql_1.graphqlHTTP)((req, res) => ({
        schema: schema,
        graphiql: true,
        context: { prisma: database_config_1.default, req, res },
    })));
    app.use("/api", (0, routes_1.configureRoutes)(io));
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
        }
        catch (error) {
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
    app.use((err, req, res, next) => {
        let statusCode = err.statusCode || 500;
        let message = err.message || "Internal server error";
        if (err.name === "PrismaClientInitializationError" ||
            err.name === "PrismaClientKnownRequestError" ||
            err.message?.includes("Can't reach database server") ||
            err.code === "P1001") {
            statusCode = 503;
            message = "Database connection issue. Please try again later.";
            console.error("❌ Database connection issue: Unable to reach database server.");
        }
        else {
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
exports.createApp = createApp;
