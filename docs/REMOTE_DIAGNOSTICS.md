# MAITV remote-input diagnostics — v0.2

## Why this exists

The original Stremio bridge was reported to connect, but physical remote/controller navigation did not work. Rather than assume which keycodes the V655-H9 produces, this laboratory records what a browser/webview **actually receives**.

**Important:** Unit tests verify the JavaScript normalizer and focus rules, **not** physical-TV support.

## Supported observations

- `keydown` and `keyup` events (last 30), stored in memory only.
- `key`, `code`, `keyCode`, `which`, repeat and the normalized action.
- Arrow movements, Enter/OK and Back/Escape handling when those DOM events reach the page.
- Printable single-character keystrokes masked; editing fields aren't recorded.
- Local, manually copyable JSON. No automatic upload or telemetry.

## Run locally on Danu (does not touch TV)

```powershell
cd D:\projects\MAITV
npm test
npm run dev
```

Open `http://127.0.0.1:4173` on **Danu** and use the arrow keys, Enter, Escape and Backspace. Observe the on-screen log.

## Optional LAN preview for a later on-TV test

Do not enable LAN mode on a public or untrusted network. By default the server listens only on `127.0.0.1`, and no firewall settings are changed.

```powershell
$env:MAITV_HOST = '0.0.0.0'
npm run dev
# Stop the server with Ctrl+C after the session.
Remove-Item Env:\MAITV_HOST
```

To open the hosted page on the TV, it must be accessible from the TV's network and launched through an **authorized** TV/browser app. A Vizio SmartCast Conjure URL launch may be supported by third-party libraries, but it requires a compatible device, explicit pairing/authorization and a reachable URL. This project's prototype does **not** pair with the TV, store tokens, or launch apps. Do not put pairing tokens into this repository, browser storage or issue reports.

No router changes, broad firewall exceptions, or device pairing actions should occur without a specific device-side compatibility test and authorization. The use of `0.0.0.0` is an *explicit optional development choice*, not the default.

## Interpreting the test

| Observation | Conclusion / next step |
|---|---|
| The log receives `ArrowUp/38`, `ArrowDown/40`, `Enter/13` or `Escape/27` and focus moves | DOM input is visible; we can adapt the Stremio bridge's focus management |
| The log receives a different key/keyCode marked `unmapped` | Record a redacted diagnostic and add a verified mapping with a regression test |
| Nothing appears when the TV remote is pressed, but desktop keys work | The WebView may intercept input before the page; investigate an approved native/bridge route |
| Events appear and are recognized, but the focused tile won't move | Focus/event handling defect in the page; reproduce before changing mappings |
| Some keys are missing or delayed | Test held-key repeats, keydown versus keyup, and any TV/launcher focus interception |

A VIZIO OS security-research project reported physical remote presses as ordinary DOM keydown events on **another** TV model; that does not establish compatibility with the V655-H9. Different models and firmware can behave differently. See https://github.com/vindeckyy/smartcast-backdoor and https://github.com/get-air/vizio for research. Treat SmartCast **API codesets** (such as D-pad codeset 3) as distinct from DOM `KeyboardEvent.keyCode` values; do not interchange them.

## Safe handoff

After a controlled test, provide only sanitized key names and numeric keycodes (never device pairing tokens, IP addresses, account details or private logs). The inspector masks printable characters and excludes input/textarea/contenteditable targets, but **review the report before sharing**.

## Remaining work

- [x] Create browser keyboard-event inspector and keyboard/legacy-key normalization tests.
- [x] Provide opt-in LAN preview without enabling it automatically.
- [ ] Recover prior Stremio bridge source on the OmniBook (currently offline).
- [ ] Test with actual Vizio V655-H9 remote via an authorized browser/WebView.
- [ ] Transfer confirmed mappings to the bridge and test Stremio navigation.
- [ ] Verify Torrentio add-on setup and lawful-content playback separately.
