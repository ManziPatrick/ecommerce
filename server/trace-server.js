// Trace server execution
require('dotenv').config();

// Enable all debugging
process.env.NODE_DEBUG = 'module,ts-node';
process.env.DEBUG = '*';

console.log('🔧 Tracing server startup...');

// Monkey-patch require to see what's being loaded
const Module = require('module');
const originalRequire = Module.prototype.require;

let requireCount = 0;
Module.prototype.require = function(id) {
  requireCount++;
  if (requireCount < 50) { // Limit output
    console.log(`📦 [${requireCount}] Loading: ${id}`);
  }
  try {
    return originalRequire.apply(this, arguments);
  } catch (error) {
    console.error(`❌ Failed to load: ${id}`);
    console.error(`   Error: ${error.message}`);
    throw error;
  }
};

try {
  // Load ts-node
  console.log('📦 Loading ts-node...');
  require('ts-node/register');
  
  // Load module-alias
  console.log('📦 Loading module-alias...');
  require('module-alias/register');
  
  // Load the server
  console.log('📦 Loading src/server.ts...');
  require('./src/server.ts');
  
} catch (error) {
  console.error('💥 FATAL ERROR:');
  console.error('Message:', error.message);
  console.error('Stack:', error.stack ? error.stack.split('\n').slice(0, 10).join('\n') : 'No stack');
  
  // Check common issues
  if (error.message.includes('Cannot find module')) {
    console.error('\n🔍 Missing module detected!');
  }
  if (error.message.includes('TS')) {
    console.error('\n🔍 TypeScript error detected!');
  }
}
