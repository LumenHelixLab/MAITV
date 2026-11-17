import test from "node:test";
import assert from "node:assert/strict";
import { normalizeRemoteKey, normalizeRemoteEvent, moveFocus, makeRemoteDiagnostic, safeKeyLabel } from "../src/remote.mjs";

test("normalizes common directional, select and back keys", () => {
  for (const [key, expected] of Object.entries({
    ArrowUp: "up", Up: "up", ArrowDown: "down", Down: "down",
    ArrowLeft: "left", Left: "left", ArrowRight: "right", Right: "right",
    Enter: "select", OK: "select", Select: "select",
    Escape: "back", Backspace: "back", Back: "back"
  })) {
    assert.equal(normalizeRemoteKey(key), expected, key);
  }
  assert.equal(normalizeRemoteKey("unknown"), null);
  assert.equal(normalizeRemoteKey(null), null);
});

test("prefers modern key event names, then code, then legacy values", () => {
  assert.equal(normalizeRemoteEvent({key:"ArrowLeft", code:"ArrowRight", keyCode:39}), "left");
  assert.equal(normalizeRemoteEvent({key:"Unidentified", code:"ArrowRight", keyCode:37}), "right");
  assert.equal(normalizeRemoteEvent({key:"Unidentified", code:"Unidentified", keyCode:38}), "up");
  assert.equal(normalizeRemoteEvent({key:"Unidentified", which:40}), "down");
  assert.equal(normalizeRemoteEvent({key:"Unidentified", which:13}), "select");
  assert.equal(normalizeRemoteEvent({key:"Unidentified", keyCode:27}), "back");
  assert.equal(normalizeRemoteEvent({key:"Unidentified", keyCode:8}), "back");
  assert.equal(normalizeRemoteEvent({code:"NumpadEnter"}), "select");
  assert.equal(normalizeRemoteEvent({key:"Unidentified", keyCode:10009}), null);
  assert.equal(normalizeRemoteEvent({key:"Unidentified", keyCode:461}), null);
  assert.equal(normalizeRemoteEvent(null), null);
});

test("diagnostics record event metadata without capturing typed characters", () => {
  const event = makeRemoteDiagnostic({key:"s",code:"KeyS",keyCode:83,which:83,repeat:true,target:{value:"do-not-leak"}}, "keyup");
  assert.deepEqual(event, {
    phase:"keyup", key:"[printable]", code:"KeyS", keyCode:83,
    which:83, repeat:true, action:"unmapped"
  });
  assert.ok(!JSON.stringify(event).includes("do-not-leak"));
  assert.equal(safeKeyLabel(" "), "[printable]");
  assert.equal(safeKeyLabel("ArrowUp"), "ArrowUp");
  assert.equal(safeKeyLabel("word with spaces"), "[redacted]");
  assert.equal(makeRemoteDiagnostic({key:"Enter", keyCode:13}, "keydown").action,"select");
  assert.equal(makeRemoteDiagnostic({key:"Enter", keyCode:999999}).keyCode,0);
});

test("moves through the two-column grid and respects boundaries", () => {
  assert.equal(moveFocus(0,"right",4),1);
  assert.equal(moveFocus(1,"right",4),1);
  assert.equal(moveFocus(1,"down",4),3);
  assert.equal(moveFocus(3,"left",4),2);
  assert.equal(moveFocus(2,"up",4),0);
  assert.equal(moveFocus(0,"left",4),0);
  assert.equal(moveFocus(2,"down",4),2);
});

test("handles partial bottom row, invalid index and empty tiles", () => {
  assert.equal(moveFocus(0,"down",3),2);
  assert.equal(moveFocus(1,"down",3),1);
  assert.equal(moveFocus(2,"right",3),2);
  assert.equal(moveFocus(50,"up",3),0);
  assert.equal(moveFocus(0,"down",0),-1);
  assert.throws(()=>moveFocus(0,"down",3,0),RangeError);
});

test("unknown direction leaves focus unchanged", () => {
  assert.equal(moveFocus(2,"select",4),2);
  assert.equal(moveFocus(0,"none",4),0);
});
