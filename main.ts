// Leonida Platinum — GTA 6 Trophy Guide, entrypoint.
//
// This program hands the guide in. It copies this repository's app/ and
// screenshots/ into the output directory and writes dossier.json with the
// make.fun frontend library (vendor/makefun-frontend.ts, the kit's copy,
// unchanged). Run it outside the grader with:
//
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
//
// Inside the grader MAKEFUN_OUTPUT_DIR is unset and /output is used.
//
// Output-directory safety: /output may be a mount point in the grader, so
// this program NEVER removes the output directory itself (rmSync on it
// throws EBUSY and fails the run). It only empties the contents of the
// directories it writes into, then copies fresh files over them.

import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Empty a directory's contents without removing the directory itself.
// Every entry inside is removed (files and subdirectories alike); the
// directory passed in is left standing, so a mount point is never touched.
function emptyDirectoryContents(dir) {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
    return;
  }
  for (const entry of readdirSync(dir)) {
    rmSync(join(dir, entry), { recursive: true, force: true });
  }
}

function copyTreeInto(sourceDir, targetDir) {
  emptyDirectoryContents(targetDir);
  cpSync(sourceDir, targetDir, { recursive: true });
}

mkdirSync(outputDir, { recursive: true });
copyTreeInto(join(repoRoot, 'app'), join(outputDir, 'app'));
if (existsSync(join(repoRoot, 'screenshots'))) {
  copyTreeInto(join(repoRoot, 'screenshots'), join(outputDir, 'screenshots'));
} else {
  emptyDirectoryContents(join(outputDir, 'screenshots'));
}

// The scorer's own caps (from the competition's reference/gate.json): the
// text cap shapes the dossier's bytes; the other caps refuse an entry the
// scorer would refuse (more than 4 screenshots, one over 256 KiB, more than
// 993 files and directories in app/, or app/ over 48 MiB).
const dossier = buildDossier(outputDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
});
writeFileSync(join(outputDir, 'dossier.json'), dossier);

console.log(`Leonida Platinum: wrote ${outputDir}/dossier.json (${dossier.length} bytes)`);
