// Catch ALL errors
process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 UNHANDLED REJECTION');
  console.error('Promise:', promise);
  console.error('Reason:', reason);
  if (reason.stack) console.error('Stack:', reason.stack);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('💥 UNCAUGHT EXCEPTION');
  console.error('Error:', error.message);
  console.error('Stack:', error.stack);
  process.exit(1);
});

// Load environment first
require('dotenv').config();

console.log('🔧 Starting with full error capture...');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);

try {
  // Load ts-node
  require('ts-node/register');
  
  // Load module alias
  require('module-alias/register');
  
  // Import and run server.ts with try-catch around EVERYTHING
  const path = require('path');
  
  // Manually execute server.ts line by line
  const serverCode = `
    import { addAlias } from "module-alias";
    import path from "path";
    
    // 🚨 LOAD ENVIRONMENT VARIABLES FIRST!
    import dotenv from "dotenv";
    dotenv.config();
    
    // Now set up module aliases
    const isProduction = process.env.NODE_ENV === "production";
    const projectRoot = path.resolve(__dirname, "..");
    const aliasPath = path.join(projectRoot, isProduction ? "dist" : "src");
    
    addAlias("@", aliasPath);
    
    console.log("✅ Module aliases set up");
    
    // Now try to import createApp
    import { createApp } from "./app";
    console.log("✅ createApp imported");
    
    const PORT = process.env.PORT || 5000;
    
    async function bootstrap() {
      try {
        console.log("🔄 Creating app...");
        const { httpServer } = await createApp();
        console.log("✅ App created");
        
        httpServer.listen(PORT, () => {
          console.log(\`🚀 Server running on port \${PORT}\`);
        });
        
        httpServer.on("error", (err) => {
          console.error("Server error:", err);
          process.exit(1);
        });
        
        console.log("✅ Server started successfully");
      } catch (error) {
        console.error("❌ Bootstrap failed:", error);
        process.exit(1);
      }
    }
    
    bootstrap();
  `;
  
  // Use eval to catch import errors
  eval(serverCode);
  
} catch (error) {
  console.error('💥 TOP LEVEL CATCH:');
  console.error('Message:', error.message);
  console.error('Stack:', error.stack);
  
  // Check if it's a TypeScript compilation error
  if (error.message.includes('TS')) {
    console.error('\n📝 TypeScript compilation error detected!');
    console.error('Running TypeScript check...');
    const { execSync } = require('child_process');
    try {
      execSync('npx tsc --noEmit', { stdio: 'inherit' });
    } catch (tsError) {
      console.error('TypeScript errors found');
    }
  }
}
