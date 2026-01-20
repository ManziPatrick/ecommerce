import * as dotenv from "dotenv";
import { addAlias } from "module-alias";
import path from "path";

// Load environment first
dotenv.config();

// Module aliases
const isProduction = process.env.NODE_ENV === "production";
const projectRoot = path.resolve(__dirname, "..");
const aliasPath = path.join(projectRoot, isProduction ? "dist" : "src");
addAlias("@", aliasPath);

import { createApp } from "./app";

const PORT = process.env.PORT || 5000;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || `http://localhost:${PORT}`;

async function bootstrap() {
  try {
    console.log(`🚀 Starting server on port ${PORT}...`);

    const { httpServer } = await createApp();

    httpServer.listen(PORT, () => {
      console.log(`✅ Server running on ${APP_URL}`);
      console.log(`📋 Health check: ${APP_URL}/health`);
      console.log(`🔧 Environment: ${process.env.NODE_ENV}`);
      console.log(`🕐 Started at: ${new Date().toISOString()}`);
    });

    httpServer.on("error", (err: any) => {
      console.error("Server error:", err);
      process.exit(1);
    });

  } catch (error: any) {
    console.error("❌ Failed to start server:", error.message);
    if (error.stack) {
      console.error("Stack trace:");
      console.error(error.stack.split("\n").slice(0, 10).join("\n"));
    }
    process.exit(1);
  }
}

bootstrap();
