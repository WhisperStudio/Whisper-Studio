import { execSync } from 'child_process';
import { rmSync, existsSync } from 'fs';
import { resolve } from 'path';

const paths = [
  '/vercel/share/v0-project/client/node_modules/.cache',
  '/vercel/share/v0-next-shadcn/client/node_modules/.cache',
  '/vercel/share/v0-project/node_modules/.cache',
];

for (const p of paths) {
  if (existsSync(p)) {
    console.log(`Removing ${p}...`);
    rmSync(p, { recursive: true, force: true });
    console.log(`Removed ${p}`);
  } else {
    console.log(`Skipping ${p} (does not exist)`);
  }
}

console.log('Re-installing client dependencies...');
try {
  execSync('cd /vercel/share/v0-project/client && npm install --legacy-peer-deps', {
    stdio: 'inherit',
    timeout: 120000,
  });
  console.log('Install complete.');
} catch (e) {
  console.log('Install had issues but continuing:', e.message);
}

console.log('Done.');
