/**
 * scripts/start-dev.ts
 * 
 * Cross-platform process orchestrator to start the local API dev server
 * and the Vite dev server concurrently with proper tree-kill on Windows.
 */
import { spawn, execSync, ChildProcess } from 'child_process';

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
  console.log('🌐 Starting Vite dev server on port 3000...');
  // 2. Spawn the Vite frontend compiler on port 3000
  viteServer = spawn('npx', ['vite', '--port', '3000'], {
    stdio: 'inherit',
    shell: true,
    env: { ...process.env },
  });
}, 1500);

// Clean up child process trees on exit
const killProcess = (proc: ChildProcess | null) => {
  if (!proc || !proc.pid) return;
  try {
    if (process.platform === 'win32') {
      execSync(`taskkill /F /T /PID ${proc.pid}`, { stdio: 'ignore' });
    } else {
      proc.kill('SIGTERM');
    }
  } catch (e) {}
};

let cleanedUp = false;
const cleanUp = () => {
  if (cleanedUp) return;
  cleanedUp = true;
  console.log('\nStopping development servers...');
  killProcess(apiServer);
  killProcess(viteServer);
  process.exit();
};

process.on('SIGINT', cleanUp);
process.on('SIGTERM', cleanUp);
