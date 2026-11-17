/** Normalization is deliberately independent of TV pairing and privileged APIs. */
const keyActions = new Map([
  ["ArrowUp", "up"], ["Up", "up"],
  ["ArrowDown", "down"], ["Down", "down"],
  ["ArrowLeft", "left"], ["Left", "left"],
  ["ArrowRight", "right"], ["Right", "right"],
  ["Enter", "select"], ["OK", "select"], ["Select", "select"],
  ["Escape", "back"], ["Esc", "back"], ["Back", "back"],
  ["BrowserBack", "back"], ["GoBack", "back"], ["Backspace", "back"]
]);
const codeActions = new Map([
  ["ArrowUp", "up"], ["ArrowDown", "down"],
  ["ArrowLeft", "left"], ["ArrowRight", "right"],
  ["Enter", "select"], ["NumpadEnter", "select"],
  ["Escape", "back"], ["Backspace", "back"]
]);
const legacyKeyCodes = new Map([
  [38, "up"], [40, "down"], [37, "left"], [39, "right"],
  [13, "select"], [27, "back"], [8, "back"]
]);

export function normalizeRemoteKey(key) {
  return typeof key === "string" ? (keyActions.get(key) ?? null) : null;
}

/**
 * Prefer modern KeyboardEvent.key, then code, then legacy keyCode/which.
 * Proprietary vendor codes are deliberately NOT assumed to mean anything.
 */
export function normalizeRemoteEvent(event) {
  if (!event || typeof event !== "object") return null;
  const byKey = normalizeRemoteKey(event.key);
  if (byKey) return byKey;
  if (typeof event.code === "string" && codeActions.has(event.code)) {
    return codeActions.get(event.code);
  }
  for (const value of [event.keyCode, event.which]) {
    if (Number.isInteger(value) && legacyKeyCodes.has(value)) {
      return legacyKeyCodes.get(value);
    }
  }
  return null;
}

/** Avoid recording printable keystrokes, user text, or DOM content in reports. */
export function safeKeyLabel(value) {
  if (typeof value !== "string") return "(missing)";
  if (value.length === 1) return "[printable]";
  return /^[A-Za-z][A-Za-z0-9_-]{1,39}$/.test(value) ? value : "[redacted]";
}

export function makeRemoteDiagnostic(event, phase = "keydown") {
  return {
    phase: phase === "keyup" ? "keyup" : "keydown",
    key: safeKeyLabel(event?.key),
    code: safeKeyLabel(event?.code),
    keyCode: Number.isInteger(event?.keyCode) && event.keyCode >= 0 && event.keyCode <= 65535 ? event.keyCode : 0,
    which: Number.isInteger(event?.which) && event.which >= 0 && event.which <= 65535 ? event.which : 0,
    repeat: Boolean(event?.repeat),
    action: normalizeRemoteEvent(event) ?? "unmapped"
  };
}

export function moveFocus(index, direction, total, columns = 2) {
  if (!Number.isInteger(total) || total <= 0) return -1;
  if (!Number.isInteger(columns) || columns <= 0) throw new RangeError("columns must be a positive integer");
  if (!Number.isInteger(index) || index < 0 || index >= total) return 0;
  const column = index % columns;
  switch (direction) {
    case "left": return column === 0 ? index : index - 1;
    case "right": return column === columns - 1 || index + 1 >= total ? index : index + 1;
    case "up": return index - columns < 0 ? index : index - columns;
    case "down": return index + columns >= total ? index : index + columns;
    default: return index;
  }
}
