import { execSync } from 'child_process';

// Nuclear option: remove entire node_modules from both possible paths, then reinstall
const dirs = [
  '/vercel/share/v0-project/client/node_modules',
  '/vercel/share/v0-next-shadcn/client/node_modules',
];

for (const d of dirs) {
  console.log(`Removing ${d}...`);
  try {
    execSync(`rm -rf "${d}"`, { stdio: 'inherit', timeout: 60000 });
    console.log(`Removed ${d}`);
  } catch (e) {
    console.log(`Could not remove ${d}: ${e.message}`);
  }
}

// Reinstall in the project client dir
console.log('Re-installing client dependencies...');
try {
  execSync('cd /vercel/share/v0-project/client && npm install --legacy-peer-deps', {
    stdio: 'inherit',
    timeout: 180000,
  });
  console.log('Install complete.');
} catch (e) {
  console.log('Install had issues:', e.message);
}

console.log('Done.');
