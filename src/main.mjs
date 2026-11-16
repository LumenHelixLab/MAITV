import { normalizeRemoteKey, moveFocus } from "./remote.mjs";

const tiles = Array.from(document.querySelectorAll("[data-maitv-item]"));
const title = document.getElementById("panel-title");
const info = document.getElementById("panel-text");
const output = document.getElementById("last-event");
const panels = {
  bridge: ["Bridge recovery", "Earlier Stremio bridge reportedly worked; its source has not yet been recovered. Danu port 11470 is not confirmed active."],
  remote: ["Remote input", "This page tests standard browser key events. Actual Vizio remote key events require a separate on-device compatibility test."],
  addons: ["Stremio add-ons", "Torrentio is a Stremio add-on, not an Android app. Add-on sync and playback are separate integration tasks."],
  safety: ["Safety policy", "This prototype does not connect to the TV, flash firmware, pair devices, or access privileged APIs."]
};
let current = 0;
const focusTile = index => {
  current = index;
  if (tiles[current]) tiles[current].focus({ preventScroll: true });
};
tiles.forEach((tile, index) => {
  tile.addEventListener("focus", () => { current = index; });
  tile.addEventListener("click", () => {
    current = index;
    const [heading, message] = panels[tile.dataset.panel] ?? ["Unknown", "No panel is registered."];
    title.textContent = heading;
    info.textContent = message;
    output.textContent = "select • tile " + (current + 1);
  });
});
document.addEventListener("keydown", event => {
  const target = event.target;
  if (target instanceof HTMLElement && target.matches("input, textarea, select, [contenteditable='true']")) return;
  const action = normalizeRemoteKey(event.key);
  if (!action) return;
  event.preventDefault();
  if (["left", "right", "up", "down"].includes(action)) {
    focusTile(moveFocus(current, action, tiles.length, 2));
  } else if (action === "select") {
    tiles[current]?.click();
  } else {
    title.textContent = "Back key detected";
    info.textContent = "Back was received. The prototype deliberately does not leave this page or alter TV settings.";
  }
  output.textContent = action + " • key: " + event.key + " • tile " + (current + 1);
});
focusTile(0);
