import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../src");
const port = Number(process.env.MAITV_PORT ?? "4173");
const types = { ".html": "text/html; charset=utf-8", ".mjs": "text/javascript; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8" };
const server = createServer(async (req, res) => {
  if (req.method !== "GET") { res.writeHead(405); res.end("Method not allowed"); return; }
  let url;
  try { url = new URL(req.url, "http://localhost"); } catch { res.writeHead(400); res.end("Bad request"); return; }
  let pathname;
  try { pathname = decodeURIComponent(url.pathname); } catch { res.writeHead(400); res.end("Bad path"); return; }
  const rel = pathname === "/" ? "index.html" : pathname.replace(/^\/+/, "");
  const file = path.resolve(root, rel);
  if (!file.startsWith(root + path.sep)) { res.writeHead(403); res.end("Forbidden"); return; }
  try {
    const s = await stat(file);
    if (!s.isFile()) throw new Error("Not a file");
    const data = await readFile(file);
    res.writeHead(200, { "Content-Type": types[path.extname(file)] ?? "application/octet-stream", "X-Content-Type-Options": "nosniff" });
    res.end(data);
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not found");
  }
});
server.listen(port, "127.0.0.1", () => console.log(`MAITV lab: http://127.0.0.1:${port}`));
