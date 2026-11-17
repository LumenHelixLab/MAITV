import { normalizeRemoteEvent, moveFocus, makeRemoteDiagnostic } from "./remote.mjs";

const tiles = Array.from(document.querySelectorAll("[data-maitv-item]"));
const title = document.getElementById("panel-title");
const info = document.getElementById("panel-text");
const output = document.getElementById("last-event");
const eventList = document.getElementById("event-list");
const eventCount = document.getElementById("event-count");
const report = document.getElementById("report");
const clipboardStatus = document.getElementById("copy-status");
const panels = {
  bridge: ["Bridge recovery", "Earlier Stremio bridge reportedly worked; its source has not yet been recovered. The historical Danu server on port 11470 is not confirmed active."],
  remote: ["Remote diagnostics", "Press D-pad, OK and Back here to discover which DOM events are delivered. Unknown events remain visible in the local event log."],
  addons: ["Stremio add-ons", "Torrentio is a Stremio add-on, not an Android app. Add-on synchronization and playback are separate integration tasks."],
  safety: ["Safety policy", "This prototype does not connect to the TV, flash firmware, pair devices, upload diagnostics, or access privileged APIs."]
};
const diagnostics = [];
const maxEvents = 30;
let current = 0;

function focusTile(index) {
  if (!tiles[index]) return;
  current = index;
  try { tiles[index].focus({ preventScroll: true }); }
  catch { tiles[index].focus(); }
}

function reportText() {
  return "MAITV remote diagnostics (local; no connection to TV)\n" +
    "Model to validate: Vizio V655-H9 / firmware 1.720.9.1-1\n" +
    "Capture: browser KeyboardEvent only. No printable characters stored.\n" +
    JSON.stringify(diagnostics, null, 2);
}

function showReport() {
  eventCount.textContent = diagnostics.length + " events";
  report.value = reportText();
}

function record(event, phase) {
  eventList.querySelector(".placeholder")?.remove();
  const item = makeRemoteDiagnostic(event, phase);
  diagnostics.push(item);
  if (diagnostics.length > maxEvents) diagnostics.shift();
  const li = document.createElement("li");
  li.textContent = item.phase + " · key " + item.key + " · code " + item.code +
    " · keyCode " + item.keyCode + " · action " + item.action +
    (item.repeat ? " · repeated" : "");
  eventList.prepend(li);
  while (eventList.children.length > maxEvents) {
    eventList.lastElementChild?.remove();
  }
  output.textContent = item.phase + " · " + item.action + " · keyCode " + item.keyCode;
  showReport();
}

tiles.forEach((tile, index) => {
  tile.addEventListener("focus", () => { current = index; });
  tile.addEventListener("click", () => {
    current = index;
    const [heading, message] = panels[tile.dataset.panel] ?? ["Unknown", "No panel is registered."];
    title.textContent = heading;
    info.textContent = message;
  });
});

function inEditableTarget(event) {
  const element = event.target;
  return element instanceof HTMLElement &&
    Boolean(element.closest("input, textarea, select, [contenteditable]"));
}
function inToolbar(event) {
  return event.target instanceof HTMLElement &&
    Boolean(event.target.closest("[data-inspector-control]"));
}

document.addEventListener("keydown", event => {
  if (inEditableTarget(event)) return;
  record(event, "keydown");
  const action = normalizeRemoteEvent(event);
  if (!action || inToolbar(event)) return;
  event.preventDefault();
  if (action === "up" || action === "down" || action === "left" || action === "right") {
    focusTile(moveFocus(current, action, tiles.length, 2));
  } else if (action === "select") {
    if (!event.repeat) tiles[current]?.click();
  } else if (action === "back") {
    if (!event.repeat) {
      title.textContent = "Back key detected";
      info.textContent = "The Back action was recognized. The demo deliberately stays on this page.";
    }
  }
}, true);

document.addEventListener("keyup", event => {
  if (!inEditableTarget(event)) record(event, "keyup");
}, true);

document.getElementById("clear-events").addEventListener("click", () => {
  diagnostics.length = 0;
  eventList.replaceChildren();
  clipboardStatus.textContent = "Event log cleared locally.";
  output.textContent = "None";
  showReport();
});

document.getElementById("copy-events").addEventListener("click", async () => {
  try {
    if (!navigator.clipboard?.writeText) throw new Error("Clipboard unavailable");
    await navigator.clipboard.writeText(reportText());
    clipboardStatus.textContent = "Diagnostics copied. Review before sharing.";
  } catch {
    report.focus();
    report.select();
    clipboardStatus.textContent = "Clipboard unavailable; select and copy the diagnostic text manually.";
  }
});
showReport();
focusTile(0);
