import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { isIP } from "node:net";
import { safeKeyLabel } from "../src/remote.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../src");
const port = Number(process.env.MAITV_PORT ?? "4173");
const host = process.env.MAITV_HOST ?? "127.0.0.1";
if (!Number.isInteger(port) || port < 1024 || port > 65535) throw new Error("Invalid MAITV_PORT");
if (!(host === "127.0.0.1" || host === "0.0.0.0" || (isIP(host) === 4 && (/^192\.168\.|^10\.|^172\.(1[6-9]|2\d|3[01])\./.test(host))))) {
  throw new Error("MAITV_HOST must be localhost, 0.0.0.0, or a private IPv4 address");
}

const capture = process.env.MAITV_CAPTURE === "1";
const captureFrom = process.env.MAITV_CAPTURE_FROM ?? "";
if (capture && isIP(captureFrom) !== 4) throw new Error("Capture requires MAITV_CAPTURE_FROM=one approved IPv4 device");
const maxEvents = 120;
const eventLog = [];
let tvPageRequests = 0;
let tvConfigRequests = 0;
const types = {
  ".html": "text/html; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8"
};
const ip4 = remote => (remote ?? "").replace(/^::ffff:/, "");
const isLocalPeer = remote => ["127.0.0.1", host].includes(ip4(remote));
const sendJson = (res, status, data) => {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(data));
};

function sanitizeEvent(raw) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const numeric = v => Number.isInteger(v) && v >= 0 && v <= 65535 ? v : 0;
  const label = v => v === "[printable]" || v === "[redacted]" ? v : safeKeyLabel(v);
  const actionSet = new Set(["up", "down", "left", "right", "select", "back", "unmapped"]);
  return {
    phase: raw.phase === "keyup" ? "keyup" : "keydown",
    key: label(raw.key),
    code: label(raw.code),
    keyCode: numeric(raw.keyCode),
    which: numeric(raw.which),
    repeat: raw.repeat === true,
    action: actionSet.has(raw.action) ? raw.action : "unmapped"
  };
}

const server = createServer(async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Content-Security-Policy", "default-src 'self'; object-src 'none'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; base-uri 'none'");
  const pathOnly = (() => {
    try { return new URL(req.url, "http://localhost").pathname; }
    catch { return null; }
  })();
  if (!pathOnly) return sendJson(res, 400, { error: "bad-url" });
  // In a live session, only Danu and the preapproved TV may even fetch this test page.
  if (capture && !isLocalPeer(req.socket.remoteAddress) && ip4(req.socket.remoteAddress) !== captureFrom) return sendJson(res, 403, { error: "device-not-allowed" });
  if (pathOnly === "/_maitv/config" && req.method === "GET") {
    if (capture && ip4(req.socket.remoteAddress) === captureFrom) tvConfigRequests++;
    return sendJson(res, 200, { capture: capture && ip4(req.socket.remoteAddress) === captureFrom });
  }
  if (pathOnly === "/_maitv/events" && req.method === "GET") {
    if (!capture || !isLocalPeer(req.socket.remoteAddress)) return sendJson(res, 403, { error: "local-only" });
    return sendJson(res, 200, { events: eventLog, count: eventLog.length, capture: true, tvPageRequests, tvConfigRequests });
  }
  if (pathOnly === "/_maitv/events" && req.method === "POST") {
    if (!capture || ip4(req.socket.remoteAddress) !== captureFrom) return sendJson(res, 403, { error: "restricted" });
    if (!/^application\/json(?:\s*;|$)/i.test(req.headers["content-type"] ?? "")) return sendJson(res, 415, { error: "json-required" });
    const origin = req.headers.origin;
    if (origin && origin !== "http://" + req.headers.host) return sendJson(res, 403, { error: "origin" });
    let bytes = 0;
    const pieces = [];
    for await (const chunk of req) {
      bytes += chunk.length;
      if (bytes > 1024) return sendJson(res, 413, { error: "too-large" });
      pieces.push(chunk);
    }
    try {
      const item = sanitizeEvent(JSON.parse(Buffer.concat(pieces).toString("utf8")));
      if (!item) return sendJson(res, 400, { error: "bad-event" });
      eventLog.push(item);
      if (eventLog.length > maxEvents) eventLog.splice(0, eventLog.length - maxEvents);
      return sendJson(res, 200, { accepted: true });
    } catch {
      return sendJson(res, 400, { error: "invalid-json" });
    }
  }
  if (req.method !== "GET") return sendJson(res, 405, { error: "method" });
  if (capture && pathOnly === "/" && ip4(req.socket.remoteAddress) === captureFrom) tvPageRequests++;
  let pathname;
  try { pathname = decodeURIComponent(pathOnly); }
  catch { return sendJson(res, 400, { error: "path" }); }
  const rel = pathname === "/" ? "index.html" : pathname.replace(/^\/+/, "");
  const file = path.resolve(root, rel);
  if (!file.startsWith(root + path.sep)) return sendJson(res, 403, { error: "forbidden" });
  try {
    const s = await stat(file);
    if (!s.isFile()) throw new Error("Not a file");
    const data = await readFile(file);
    res.writeHead(200, { "Content-Type": types[path.extname(file)] ?? "application/octet-stream" });
    res.end(data);
  } catch {
    return sendJson(res, 404, { error: "not-found" });
  }
});

server.listen(port, host, () => {
  console.log("MAITV lab: http://" + host + ":" + port);
  if (capture) console.log("Capturing sanitized DOM key events from one approved TV IP into memory only; no credentials, no persistence.");
  if (host !== "127.0.0.1") console.warn("Private-LAN preview enabled; stop the server and remove any temporary firewall rule after testing.");
});
if (capture) {
  const sessionSeconds = Number(process.env.MAITV_SESSION_SECONDS ?? "900");
  if (!Number.isInteger(sessionSeconds) || sessionSeconds < 60 || sessionSeconds > 3600) throw new Error("MAITV_SESSION_SECONDS must be 60-3600");
  setTimeout(() => { console.log("MAITV live capture expired; closing local server."); server.close(); }, sessionSeconds * 1000).unref();
}
