/** Pure functions for a predictable directional navigation prototype. */
const mappings = new Map([
  ["ArrowUp", "up"], ["Up", "up"],
  ["ArrowDown", "down"], ["Down", "down"],
  ["ArrowLeft", "left"], ["Left", "left"],
  ["ArrowRight", "right"], ["Right", "right"],
  ["Enter", "select"], ["OK", "select"], ["Select", "select"],
  ["Escape", "back"], ["Esc", "back"], ["Backspace", "back"],
  ["BrowserBack", "back"], ["GoBack", "back"]
]);

export function normalizeRemoteKey(key) {
  return mappings.get(key) ?? null;
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
