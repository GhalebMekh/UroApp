/**
 * Builds the deployed site from both apps in this repo, so one static host
 * serves everything:
 *
 *   /           the full UroApp (repo root) — calculators, guidelines, Academic,
 *               Residency; entirely offline
 *   /patients/  the multi-user platform in web/ — login, patient list, SOAP
 *
 * They are separate Vite apps with separate dependencies and Tailwind configs,
 * so they are built independently and assembled here rather than merged. Render
 * runs this from web/ with the repo checked out at ../, and publishes web/dist.
 */
import { execFileSync } from 'child_process';
import { cpSync, rmSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const webDir = join(dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = join(webDir, '..');
const outDir = join(webDir, 'dist');

const run = (cmd, args, cwd) => {
  console.log(`\n$ ${cmd} ${args.join(' ')}   (in ${cwd})`);
  execFileSync(cmd, args, { cwd, stdio: 'inherit' });
};

rmSync(outDir, { recursive: true, force: true });

// 1. The full app. Its dependencies are separate from web/'s, so install them
//    too — on a clean CI checkout only one of the two trees is installed.
if (!existsSync(join(repoRoot, 'node_modules'))) {
  run('npm', ['install', '--no-audit', '--no-fund'], repoRoot);
}
run('npm', ['run', 'build'], repoRoot);
cpSync(join(repoRoot, 'dist'), outDir, { recursive: true });

// 2. The patient platform, served from a sub-path. --base rewrites its asset
//    URLs; without it the bundle would be requested from the site root and 404.
run('npx', ['vite', 'build', '--outDir', 'dist/patients', '--base', '/patients/'], webDir);

console.log('\n✓ Site assembled: full app at /, patient platform at /patients/');
