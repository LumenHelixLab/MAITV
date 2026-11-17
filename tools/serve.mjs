import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../src");
const port = Number(process.env.MAITV_PORT ?? "4173");
const host = process.env.MAITV_HOST ?? "127.0.0.1";
if (!Number.isInteger(port) || port < 1024 || port > 65535) throw new Error("Invalid MAITV_PORT");
if (!["127.0.0.1", "0.0.0.0"].includes(host)) throw new Error("MAITV_HOST must be 127.0.0.1 or 0.0.0.0");
const types = { ".html": "text/html; charset=utf-8", ".mjs": "text/javascript; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8" };
const server = createServer(async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Content-Security-Policy", "default-src 'self'; object-src 'none'; script-src 'self'; style-src 'self'; img-src 'self' data:; base-uri 'none'");
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
server.listen(port, host, () => {
  console.log(`MAITV input lab listening at http://${host}:${port}`);
  if (host === "0.0.0.0") console.warn("LAN testing enabled: restrict access to your trusted local network and stop the server when finished.");
});
