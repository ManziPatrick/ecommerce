const { spawn } = require('child_process');

// Set environment variables
process.env.NODE_ENV = 'development';
// process.env.REDIS_URL = "LOAD_FROM_ENV";
process.env.PORT = "5000";

console.log("Starting server with ts-node...");

// Spawn the server process
const server = spawn('npx', ['ts-node', '-r', 'module-alias/register', 'src/server.ts'], {
  stdio: 'inherit', // Share stdin/stdout/stderr
  shell: true
});

// Handle process exit
server.on('close', (code) => {
  console.log(`Server process exited with code ${code}`);
  process.exit(code);
});

// Handle errors
server.on('error', (err) => {
  console.error('Failed to start server:', err);
});
