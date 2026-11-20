// Leonida Platinum — local preview server.
//
// Serves this repository's app/ directory at http://localhost:8080 so the
// guide can be tried in a desktop browser exactly as a static host would
// serve it. No build step, no network fetch: every file comes from app/.
//
//   node serve.ts            (then open http://localhost:8080)
//   node serve.ts 8123       (another port)

import { createServer } from 'node:http';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { join, normalize, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const appRoot = fileURLToPath(new URL('app/', import.meta.url));
const port = Number(process.argv[2] ?? 8080);

const mimeByExtension = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

function safePath(requestPath) {
  const decoded = decodeURIComponent(requestPath.split('?')[0].split('#')[0]);
  const joined = normalize(join(appRoot, decoded === '/' ? 'index.html' : decoded));
  return joined.startsWith(appRoot) ? joined : null;
}

const server = createServer((request, response) => {
  const file = safePath(request.url ?? '/');
  if (file === null || !existsSync(file) || !statSync(file).isFile()) {
    response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
    response.end('Not found\n');
    return;
  }
  response.writeHead(200, {
    'content-type': mimeByExtension[extname(file)] ?? 'application/octet-stream',
    'cache-control': 'no-store',
  });
  createReadStream(file).pipe(response);
});

server.listen(port, () => {
  console.log(`Leonida Platinum preview at http://localhost:${port}/`);
});
