import test from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createServer } from "node:net";
import { once } from "node:events";
import { fileURLToPath } from "node:url";
import path from "node:path";

const projectDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const serverScript = path.join(projectDir, "tools/serve.mjs");

async function availablePort() {
  const server = createServer();
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const port = server.address().port;
  await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
  return port;
}

test("development server remains local, serves inspector and forbids POST", async t => {
  const port = await availablePort();
  const child = spawn(process.execPath, [serverScript], {
    cwd: projectDir,
    env: { ...process.env, MAITV_HOST: "127.0.0.1", MAITV_PORT: String(port) },
    stdio: "ignore",
    windowsHide: true
  });
  t.after(() => { if (!child.killed) child.kill(); });
  const url = "http://127.0.0.1:" + port;
  let response;
  for (let attempt = 0; attempt < 40; attempt++) {
    try {
      response = await fetch(url + "/");
      break;
    } catch {
      if (child.exitCode !== null) throw new Error("MAITV dev server exited unexpectedly");
      await new Promise(resolve => setTimeout(resolve, 80));
    }
  }
  assert.ok(response, "Server should respond locally");
  assert.equal(response.status, 200);
  assert.match(await response.text(), /Remote event inspector/);
  assert.match(response.headers.get("content-security-policy") ?? "", /script-src 'self'/);
  assert.equal(response.headers.get("cache-control"), "no-store");

  const script = await fetch(url + "/remote.mjs");
  assert.equal(script.status, 200);
  assert.match(script.headers.get("content-type") ?? "", /text\/javascript/);
  assert.match(await script.text(), /normalizeRemoteEvent/);

  assert.equal((await fetch(url + "/missing")).status, 404);
  assert.equal((await fetch(url + "/", {method:"POST"})).status, 405);
});
