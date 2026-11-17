import { normalizeRemoteEvent, moveFocus, makeRemoteDiagnostic } from "./remote.mjs";

const tiles = Array.from(document.querySelectorAll("[data-maitv-item]"));
const title = document.getElementById("panel-title");
const info = document.getElementById("panel-text");
const output = document.getElementById("last-event");
const eventList = document.getElementById("event-list");
const eventCount = document.getElementById("event-count");
const report = document.getElementById("report");
const clipboardStatus = document.getElementById("copy-status");
let relayToHub = false;
fetch("/_maitv/config", { cache: "no-store" })
  .then(res => res.ok ? res.json() : null)
  .then(cfg => {
    relayToHub = cfg?.capture === true;
    if (relayToHub) clipboardStatus.textContent = "Temporary TV test: sanitized key events are being relayed to the local Danu hub.";
  })
  .catch(() => {});
const panels = {
  bridge: ["Bridge recovery", "Earlier Stremio bridge reportedly worked; its source has not yet been recovered. The historical Danu server on port 11470 is not confirmed active."],
  remote: ["Remote diagnostics", "Press D-pad, OK and Back here to discover which DOM events are delivered. Unknown events remain visible in the local event log."],
  addons: ["Stremio + Torrentio", "Torrentio must be present in the Stremio account used on both Danu and the TV. Check My Add-ons before reinstalling. Configure it on Danu, then reopen Stremio Web on the TV; MAITV does not store any account keys."],
  safety: ["Safety policy", "No firmware writes, TV pairing, or privileged device APIs. In explicitly enabled on-TV test sessions, sanitized key events are sent only to Danu and retained in memory until the test server stops."]
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
  return "MAITV remote diagnostics (browser event capture; no firmware changes)\n" +
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
  if (relayToHub) {
    fetch("/_maitv/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(item),
      cache: "no-store"
    }).catch(() => {});
  }
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
  clipboardStatus.textContent = relayToHub ? "On-screen log cleared; Danu capture remains until the test server stops." : "Event log cleared locally.";
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
