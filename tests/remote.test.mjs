import test from "node:test";
import assert from "node:assert/strict";
import { normalizeRemoteKey, moveFocus } from "../src/remote.mjs";

test("normalizes directional and select/back keys", () => {
  assert.equal(normalizeRemoteKey("ArrowUp"), "up");
  assert.equal(normalizeRemoteKey("Up"), "up");
  assert.equal(normalizeRemoteKey("ArrowDown"), "down");
  assert.equal(normalizeRemoteKey("ArrowLeft"), "left");
  assert.equal(normalizeRemoteKey("ArrowRight"), "right");
  assert.equal(normalizeRemoteKey("Enter"), "select");
  assert.equal(normalizeRemoteKey("OK"), "select");
  assert.equal(normalizeRemoteKey("Escape"), "back");
  assert.equal(normalizeRemoteKey("Backspace"), "back");
  assert.equal(normalizeRemoteKey("unknown"), null);
});

test("moves through 2-column grid and preserves row boundaries", () => {
  assert.equal(moveFocus(0, "right", 4), 1);
  assert.equal(moveFocus(1, "right", 4), 1);
  assert.equal(moveFocus(1, "down", 4), 3);
  assert.equal(moveFocus(3, "left", 4), 2);
  assert.equal(moveFocus(2, "up", 4), 0);
  assert.equal(moveFocus(0, "left", 4), 0);
  assert.equal(moveFocus(2, "down", 4), 2);
});

test("handles missing items and partial bottom row", () => {
  assert.equal(moveFocus(0, "down", 3), 2);
  assert.equal(moveFocus(1, "down", 3), 1);
  assert.equal(moveFocus(2, "right", 3), 2);
  assert.equal(moveFocus(50, "up", 3), 0);
  assert.equal(moveFocus(0, "down", 0), -1);
  assert.throws(() => moveFocus(0, "down", 3, 0), RangeError);
});
