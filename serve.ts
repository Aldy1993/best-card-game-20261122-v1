// Ashfall Pact — a tiny static server for local play (Node 22, standard
// library only). Serves this repository's game/ on http://localhost:8080 so
// the game can be played in a desktop browser with no build step:
//
//   node serve.ts [--port 8080]
//
// It only ever reads files under game/, sends the MIME type each kind of
// file needs, and refuses everything else.
import { createReadStream, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const gameRoot = resolve(fileURLToPath(new URL('./game', import.meta.url)));

const cli = process.argv.slice(2);
const portFlag = cli.indexOf('--port');
const wanted = portFlag === -1 ? 8080 : Number(cli[portFlag + 1]);
const port = Number.isInteger(wanted) && wanted > 0 && wanted < 65536 ? wanted : 8080;

const TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
};

createServer((req, res) => {
  const raw = new URL(req.url ?? '/', 'http://localhost').pathname;
  let name: string;
  try {
    name = decodeURIComponent(raw);
  } catch {
    res.writeHead(400).end('bad request');
    return;
  }
  if (name.endsWith('/')) name += 'index.html';
  const path = resolve(join(gameRoot, normalize(name).replace(/^(\.\.(\/|\\|$))+/, '')));
  if (path !== gameRoot && !path.startsWith(gameRoot + sep)) {
    res.writeHead(403).end('forbidden');
    return;
  }
  let st;
  try {
    st = statSync(path);
  } catch {
    res.writeHead(404).end('not found');
    return;
  }
  if (!st.isFile()) {
    res.writeHead(404).end('not found');
    return;
  }
  res.writeHead(200, { 'content-type': TYPES[extname(path)] ?? 'application/octet-stream' });
  createReadStream(path).pipe(res);
}).listen(port, () => {
  console.log(`Ashfall Pact served at http://localhost:${port}`);
});
