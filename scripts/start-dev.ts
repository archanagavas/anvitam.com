/**
 * scripts/start-dev.ts
 * 
 * Cross-platform process orchestrator to start the local API dev server
 * and the Vite dev server concurrently.
 */
import { spawn, ChildProcess } from 'child_process';

console.log('🚀 Starting Anvitam development environment...');

let viteServer: ChildProcess | null = null;

// 1. Spawn the local API gateway on port 3005
const apiServer = spawn('npx', ['tsx', 'scripts/dev-server.ts'], {
  stdio: 'inherit',
  shell: true,
  env: { ...process.env },
});

// Wait 1.5s for API server to start, then launch Vite
setTimeout(() => {
  console.log('🌐 Starting Vite dev server...');
  // 2. Spawn the Vite frontend compiler on port 3000
  viteServer = spawn('npx', ['vite'], {
    stdio: 'inherit',
    shell: true,
    env: { ...process.env },
  });
}, 1500);

// Clean up child processes on exit
const cleanUp = () => {
  console.log('\nStopping development servers...');
  apiServer.kill();
  if (viteServer) viteServer.kill();
  process.exit();
};

process.on('SIGINT', cleanUp);
process.on('SIGTERM', cleanUp);
process.on('exit', cleanUp);
