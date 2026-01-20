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
const dotenv = __importStar(require("dotenv"));
const module_alias_1 = require("module-alias");
const path_1 = __importDefault(require("path"));
// Load environment first
dotenv.config();
// Module aliases
const isProduction = process.env.NODE_ENV === "production";
const projectRoot = path_1.default.resolve(__dirname, "..");
const aliasPath = path_1.default.join(projectRoot, isProduction ? "dist" : "src");
(0, module_alias_1.addAlias)("@", aliasPath);
const app_1 = require("./app");
const PORT = process.env.PORT || 5000;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || `http://localhost:${PORT}`;
async function bootstrap() {
    try {
        console.log(`🚀 Starting server on port ${PORT}...`);
        const { httpServer } = await (0, app_1.createApp)();
        httpServer.listen(PORT, () => {
            console.log(`✅ Server running on ${APP_URL}`);
            console.log(`📋 Health check: ${APP_URL}/health`);
            console.log(`🔧 Environment: ${process.env.NODE_ENV}`);
            console.log(`🕐 Started at: ${new Date().toISOString()}`);
        });
        httpServer.on("error", (err) => {
            console.error("Server error:", err);
            process.exit(1);
        });
    }
    catch (error) {
        console.error("❌ Failed to start server:", error.message);
        if (error.stack) {
            console.error("Stack trace:");
            console.error(error.stack.split("\n").slice(0, 10).join("\n"));
        }
        process.exit(1);
    }
}
bootstrap();
