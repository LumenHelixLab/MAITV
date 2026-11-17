import test from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createServer } from "node:net";
import { once } from "node:events";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const script = path.join(root, "tools/serve.mjs");
async function findPort() {
  const s = createServer();
  s.listen(0, "127.0.0.1");
  await once(s, "listening");
  const port = s.address().port;
  await new Promise(done => s.close(done));
  return port;
}
test("opt-in key capture is in-memory, sanitized and locally readable", async t => {
  const port = await findPort();
  const child = spawn(process.execPath, [script], {
    env: { ...process.env, MAITV_HOST: "127.0.0.1", MAITV_PORT: String(port), MAITV_CAPTURE: "1", MAITV_CAPTURE_FROM: "127.0.0.1" },
    cwd: root, stdio: "ignore", windowsHide: true
  });
  t.after(() => child.kill());
  const base = "http://127.0.0.1:" + port;
  let config;
  for (let i = 0; i < 35; i++) {
    try { config = await fetch(base + "/_maitv/config"); break; }
    catch { await new Promise(done => setTimeout(done, 80)); }
  }
  assert.ok(config && config.ok);
  assert.deepEqual(await config.json(), { capture: true });

  const bad = await fetch(base + "/_maitv/events", { method: "POST", headers: { "Content-Type": "text/plain" }, body: "abc" });
  assert.equal(bad.status, 415);
  const post = await fetch(base + "/_maitv/events", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      phase: "keydown", key: "x", code: "KeyX", keyCode: 88, which: 88, repeat: false,
      action: "unmapped", secret: "never retained"
    })
  });
  assert.equal(post.status, 200);
  assert.equal((await post.json()).accepted, true);
  const response = await fetch(base + "/_maitv/events");
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.count, 1);
  assert.equal(body.events[0].key, "[printable]");
  assert.equal(body.events[0].code, "KeyX");
  assert.equal(body.events[0].action, "unmapped");
  assert.ok(!JSON.stringify(body).includes("never retained"));
  assert.ok(!JSON.stringify(body).includes("secret"));
});
