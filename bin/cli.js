#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */

const { spawn } = require('child_process');
const path = require('path');
const open = require('open');

const PORT = 3000;
const URL = `http://localhost:${PORT}`;

console.log('Lens is starting...');

const appPath = path.resolve(__dirname, '..');

// Check if we are running from within the project source or installed package
// For now assuming we are running `npm run dev` style or `next start`
const nextCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const args = ['run', 'dev']; // Ideally 'start' for production, but 'dev' for this context

const child = spawn(nextCmd, args, {
  cwd: appPath,
  stdio: 'inherit',
});

child.on('error', (err) => {
  console.error('Failed to start StorageLens:', err);
});

// Give Next.js some time to boot, then open browser
setTimeout(() => {
    console.log(`Opening StorageLens at ${URL}`);
    open(URL);
}, 3000); // 3 seconds delay
