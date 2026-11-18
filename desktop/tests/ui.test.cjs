"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.join(__dirname, "..", "src", "ui");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const js = fs.readFileSync(path.join(root, "tooltips.js"), "utf8");
const css = fs.readFileSync(path.join(root, "style.css"), "utf8");
test("every desktop interactive control has contextual help", () => {
  const elements = [...html.matchAll(/<(button|input)\b([^>]*)>/g)].map(m => m[2]);
  assert.ok(elements.length >= 20, "expected main controls");
  for (const attrs of elements) {
    const id = attrs.match(/\bid="([^"]+)"/)?.[1];
    const tab = attrs.match(/\bdata-tab="([^"]+)"/)?.[1];
    const key = attrs.match(/\bdata-key="([^"]+)"/)?.[1];
    const selector = id ? "#" + id : tab ? '[data-tab="' + tab + '"]' : key ? '[data-key="' + key + '"]' : null;
    assert.ok(selector && js.includes(selector), "Missing tooltip: " + attrs);
  }
});
test("Stremio account helper requires deliberate password field confirmation and clears it",()=>{
  assert.match(html, /id="open-signin-tv"/);
  assert.match(html, /id="login-password" type="password"/);
  assert.match(html, /id="send-login-password"[^>]*disabled/);
  assert.match(html, /id="confirm-password-focus" type="checkbox"/);
  const app = fs.readFileSync(path.join(root,"app.js"),"utf8");
  assert.match(app, /launchSignIn/);
  assert.match(app, /if\(isPassword && !el\("confirm-password-focus"\)\.checked\)/);
  assert.match(app, /field\.value=""; \/\/ Never retain login input/);
  assert.match(app, /if\(isPassword\)el\("confirm-password-focus"\)\.checked=false/);
});
test("Stremio direct navigation buttons map to fixed application actions",()=>{
  const app=fs.readFileSync(path.join(root,"app.js"),"utf8");
  for(const section of ["home","library","addons","settings"]){
    assert.match(html,new RegExp('id="stremio-go-'+section+'" data-stremio-route="'+section+'"'));
    assert.match(js,new RegExp('"#stremio-go-'+section+'"'));
  }
  assert.match(app,/window\.maitv\.launchSection\(target\)/);
  assert.match(app,/querySelectorAll\("\[data-stremio-route\]"\)/);
});
test("discovered Vizio selection is explained and keyboard accessible", () => {
  assert.match(html, /id="scan-instruction"/);
  assert.match(html, /click your Vizio TV/i);
  assert.match(html, /<script src="tooltips.js"/);
  assert.match(js, /focusin/);
  assert.match(js, /pointerover/);
  assert.match(css, /\.maitv-tooltip/);
  const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
  assert.match(app, /b\.setAttribute\("aria-pressed","false"\)/);
  assert.match(app, /el\("tv-ip"\)\.value=device\.host/);
  assert.match(css, /\.device-choice\.selected/);
  assert.match(app, /classList\.toggle\("selected"/);
});
