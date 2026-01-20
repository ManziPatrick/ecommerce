// Catch ALL unhandled errors
process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 UNHANDLED REJECTION at:', promise);
  console.error('💥 Reason:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('💥 UNCAUGHT EXCEPTION:', error);
  console.error('💥 Stack:', error.stack);
  process.exit(1);
});

// Set environment
process.env.NODE_ENV = 'development';
process.env.PORT = '5000';

// Load environment variables
require('dotenv').config();

console.log('🔧 Starting server with full error trapping...');

try {
  // Run ts-node directly
  require('ts-node/register');
  require('module-alias/register');
  require('./src/server.ts');
} catch (error) {
  console.error('💥 TOP-LEVEL CATCH:', error);
  console.error('💥 Stack:', error.stack);
}
