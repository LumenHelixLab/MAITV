"use strict";

/*
 * Application-wide help. All help text is static UI copy; no network or
 * credentials are involved. Includes pointer hover and keyboard focus.
 */
const tooltipCopy = {
  ".brand": "Lumen Helix Solutions' MAITV local television controller.",
  '[data-tab="remote"]': "Open the TV remote, playback controls and keyboard text sender.",
  '[data-tab="connect"]': "Find your TV, select its detected IPv4 address and pair securely.",
  '[data-tab="search"]': "Try Stremio search on the TV without its on-screen keyboard.",
  '[data-tab="about"]': "See the current MAITV features, limitations and security notes.",
  "#topmost": "Keep this window above other applications until you turn this off.",
  "#connection-pill": "Paired means authorization is saved. Use Check Status to confirm the TV is reachable.",
  "#open-stremio": "Launch Stremio Web on the paired TV through Vizio Conjure.",
  "#hero-pair": "Open the TV discovery and pairing screen.",
  "#refresh-status": "Request the current TV power and application status over local Wi-Fi.",
  "#device-name": "Shows the selected television and its last connection state.",
  "#device-description": "Detailed connection information; it updates when status is checked.",
  '[data-key="UP"]': "Move the TV focus up. Keyboard shortcut: Up Arrow.",
  '[data-key="DOWN"]': "Move the TV focus down. Keyboard shortcut: Down Arrow.",
  '[data-key="LEFT"]': "Move the TV focus left. Keyboard shortcut: Left Arrow.",
  '[data-key="RIGHT"]': "Move the TV focus right. Keyboard shortcut: Right Arrow.",
  '[data-key="OK"]': "Confirm the selected TV item. Keyboard shortcut: Enter.",
  '[data-key="BACK"]': "Go back in the TV interface. Keyboard shortcut: Escape.",
  '[data-key="HOME"]': "Return to the television's home screen.",
  '[data-key="MENU"]': "Open the television's context or settings menu.",
  '[data-key="VOL_DOWN"]': "Lower the television volume.",
  '[data-key="MUTE"]': "Toggle television audio mute.",
  '[data-key="VOL_UP"]': "Raise the television volume.",
  '[data-key="PLAY"]': "Send a play command to the TV.",
  '[data-key="PAUSE"]': "Send a pause command to the TV.",
  '[data-key="INPUT"]': "Open or switch the TV input selection.",
  "#open-stremio-side": "Open the official Stremio Web page on the paired television.",
  "#open-stremio-pc": "Open Stremio Web on this PC in the default browser.",
  ".app-entry": "Stremio Web runs in the TV browser. Playback and searching require hardware validation.",
  "#remote-text": "Type up to 60 printable ASCII characters; focus a text field on the TV first.",
  "#send-text": "Send typed characters as SmartCast key commands. Stremio compatibility is experimental.",
  "#discover": "Scan the local network for Cast-capable TVs. Click your Vizio in the results to fill its IPv4 address.",
  "#found-devices": "Select the correct Vizio from this list to fill the TV IPv4 field automatically.",
  "#tv-ip": "Private LAN IPv4 address of your Vizio. Scan and click the TV to fill this automatically, or enter it.",
  "#start-pair": "Ask the selected TV to display a four-digit pairing code.",
  "#pin-prompt": "The TV displays a new four-digit code for each pairing attempt.",
  "#tv-pin": "Enter the four-digit pairing code displayed on the TV. The PIN is not stored.",
  "#finish-pair": "Authorize this PC with the code displayed on the TV.",
  "#paired-name": "Shows the TV paired with this Windows account.",
  "#forget-pair": "Remove this TV's saved pairing token and certificate fingerprint from this PC.",
  ".secure-note": "Your token is encrypted using Windows protected storage and connections pin the TV certificate.",
  "#search-query": "Enter a movie or show title to try opening Stremio's search page on the TV.",
  "#send-search": "Open a fixed Stremio Web search route on the TV. Vizio browser support is still experimental.",
  "#open-pc-search": "Open Stremio Web directly in your PC browser.",
  ".caution": "This function is implemented but still needs a physical Vizio acceptance test.",
  ".warning-panel": "Torrentio is not installed by this remote; add-ons belong to your Stremio account.",
  ".privacy-dot": "MAITV remote commands use local SmartCast HTTPS, not a casting cloud service.",
  ".about-panel": "Technical capabilities and limitations of this MAITV build."
};

for (const [selector, message] of Object.entries(tooltipCopy)) {
  for (const element of document.querySelectorAll(selector)) {
    element.dataset.tooltip = message;
  }
}
const tip = document.createElement("div");
tip.className = "maitv-tooltip";
tip.id = "maitv-help-tooltip";
tip.setAttribute("role", "tooltip");
tip.setAttribute("aria-hidden", "true");
document.body.appendChild(tip);

let active = null;
let focused = false;
function positionTip(target) {
  const rect = target.getBoundingClientRect();
  const width = tip.offsetWidth;
  const height = tip.offsetHeight;
  const left = Math.max(12, Math.min(window.innerWidth - width - 12, rect.left + rect.width / 2 - width / 2));
  const top = rect.bottom + height + 12 <= window.innerHeight ? rect.bottom + 9 : Math.max(12, rect.top - height - 9);
  tip.style.left = left + "px";
  tip.style.top = top + "px";
}
function hideTip() {
  if (active && focused) {
    active.removeAttribute("aria-describedby");
  }
  active = null;
  focused = false;
  tip.classList.remove("show");
  tip.setAttribute("aria-hidden", "true");
}
function showTip(target, forFocus = false) {
  if (!target || !target.dataset.tooltip || target.matches(":disabled")) return;
  if (active && active !== target) hideTip();
  active = target;
  focused = forFocus;
  tip.textContent = target.dataset.tooltip;
  tip.setAttribute("aria-hidden", "false");
  tip.classList.add("show");
  if (forFocus) target.setAttribute("aria-describedby", tip.id);
  positionTip(target);
}
function tipTarget(event) {
  return event.target instanceof Element ? event.target.closest("[data-tooltip]") : null;
}
document.addEventListener("pointerover", event => {
  const target = tipTarget(event);
  if (target && (!active || active !== target)) showTip(target);
});
document.addEventListener("pointerout", event => {
  const target = tipTarget(event);
  if (active === target && !(event.relatedTarget instanceof Node && target.contains(event.relatedTarget))) hideTip();
});
document.addEventListener("focusin", event => showTip(tipTarget(event), true));
document.addEventListener("focusout", event => {
  const target = tipTarget(event);
  if (active === target) hideTip();
});
document.addEventListener("keydown", event => {
  if (event.key === "Escape" && active) hideTip();
});
document.addEventListener("pointerdown", hideTip);
window.addEventListener("scroll", hideTip, true);
window.addEventListener("resize", () => active && positionTip(active));
