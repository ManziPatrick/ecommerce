import { addAlias } from "module-alias";
import path from "path";

// 🚨 LOAD ENVIRONMENT VARIABLES FIRST!
import dotenv from "dotenv";
dotenv.config();

console.log("1️⃣  Environment loaded");

// Now set up module aliases
const isProduction = process.env.NODE_ENV === "production";
const projectRoot = path.resolve(__dirname, "..");
const aliasPath = path.join(projectRoot, isProduction ? "dist" : "src");

addAlias("@", aliasPath);

console.log("2️⃣  Module aliases set up");

import { createApp } from "./app";

console.log("3️⃣  createApp imported");

const PORT = process.env.PORT || 5000;

async function bootstrap() {
  try {
    console.log("4️⃣  Starting bootstrap()");
    
    const { httpServer } = await createApp();
    
    console.log("5️⃣  createApp() completed, got httpServer");
    
    httpServer.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📡 GraphQL: http://localhost:${PORT}/graphql`);
      console.log(`📚 Docs: http://localhost:${PORT}/api-docs`);
    });

    console.log("6️⃣  httpServer.listen() called");

    httpServer.on("error", (err) => {
      console.error("Server error:", err);
      process.exit(1);
    });
    
    console.log("7️⃣  Bootstrap completed successfully");
    
  } catch (error) {
    console.error("❌ Bootstrap failed:", error);
    console.error("Stack:", error.stack);
    process.exit(1);
  }
}

console.log("8️⃣  Calling bootstrap()");
bootstrap();
console.log("9️⃣  After bootstrap() call");
