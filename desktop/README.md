# MAITV Desktop for Windows — v0.6.0-alpha.1

A local-first desktop remote for SmartCast-era Vizio televisions, with the official **Lumen Helix Solutions** bulb branding, an interactive TV remote, one-tap Stremio Web, and optional text-entry experiments.

## Scope

- Windows 10/11 x64 application (Electron; installer and portable executable when packaged).
- Works locally over Wi-Fi; no Chromecast, phone casting, account login or always-on streaming server is required for basic controls.
- Supported initial research target: Vizio **V655-H9**, firmware **1.720.9.1-1**. Other SmartCast firmware/models remain unverified.
- Does not install software on the TV, flash firmware, enable SSH, alter power-on settings, or modify Stremio/Torrentio add-on accounts.

## Features

| Feature | Status |
|---|---|
| Native Windows application window | Implemented |
| Official Lumen Helix bulb and cyan/white/green wordmark | Included |
| One-time TV pairing via on-screen 4-digit PIN | Implemented; new PC client needs physical TV validation |
| Protected credential storage | Electron safeStorage / Windows DPAPI, profile in current user's app data |
| TV certificate binding | Pins SHA-256 of local self-signed certificate after initial pairing; mismatch blocks AUTH before HTTP transmission |
| One-tap launch to Stremio Web | Fixed allowlisted Conjure URL, previously verified from Danu's prior helper |
| D-pad, OK, Back, Home, volume, play/pause and input | Buttons + arrow/Enter/Escape shortcuts; hardware validation pending for new client |
| Nearby TV discovery | Opt-in 6.5-second local mDNS scan for Google Cast services, manual IPv4 fallback |
| TV search route | Official Stremio Web hash-router search URL, encoded with PC query and opened through fixed-origin Conjure; **Vizio compatibility pending** |
| PC-to-TV keyboard text | Separate ASCII CODESET 0 fallback, **experimental and unverified in Stremio Conjure** |
| Open Stremio Web on PC | Launches official page in system browser, without giving MAITV access to Stremio credentials |
| Always-on-top mode | Optional, user-initiated |
| TV status | Shows standby/on state and active Conjure app when available |
| Analytics/telemetry | None |
| Torrentio | Not bundled; stays managed through the signed-in Stremio account |

## Setup and pairing

1. Ensure the computer and television are connected to the same trusted local network.
2. Open MAITV Desktop. Click **My Television** and optionally **Find TVs on this network**.
3. Select the right Vizio from mDNS results (other Cast devices can appear), or enter its private LAN IP in the field.
4. Click **Start Pairing**. A 4-digit confirmation code should appear on the TV.
5. Type that code into MAITV and click **Verify & Connect**. The token is encrypted with Windows' safeStorage and never appears in the renderer.
6. Click **Open Stremio on TV**. Use the desktop remote, or keyboard shortcuts when the focus is outside a text field.
7. For a no-TV-keyboard experiment, open **Search & Apps**, enter a title and select **Search on TV**. It launches the official Stremio Web search route with a URL-encoded query. This is supported in Stremio Web source but still needs Vizio Conjure validation.
8. The separate ASCII input feature on the Remote page sends characters to a focused TV field. If that fails, it does not imply the URL-route test failed.

## Build from source

Requires Windows x64 with Node.js 20+ (Node 24 on Danu).

~~~powershell
cd D:\projects\MAITV\desktop
npm ci
npm test
npm start
# Builds both an NSIS Windows installer and a portable executable:
npm run dist:win
~~~

**Private pre-release:** [MAITV Desktop v0.6 Alpha 1](https://github.com/LumenHelixLab/MAITV/releases/tag/desktop-v0.6.0-alpha1) with separate Setup EXE, Portable EXE, a screenshot and SHA-256 checksum file. The packages are also built locally under desktop/dist and are **unsigned private alpha builds**. Windows SmartScreen may warn. Do not publish the installer broadly until independent testing, code-signing, third-party license review and a security audit are complete.

## Architecture

- Electron main process: TV API and secrets, explicit command allowlist only.
- Renderer: local static HTML/CSS/JS, no Node.js APIs; context isolation and sandbox on; CSP denies external script and network access.
- Preload: exposes only named operations (pair, remote key, Stremio launch, status, text, discovery, forget).
- Local SmartCast transport: fixed private IPv4 target, port 7345, TLS self-signed certificate pinned after pairing, timeouts and bounded response size. A fake local TLS test verified that a mismatched certificate does not receive an AUTH header.
- Credential vault: Electron safeStorage encrypts the SmartCast bearer token under the current Windows login. No token is saved in plaintext or sent to any website.
- No background service or listening TCP port is required for the PC client.

## Gaps / acceptance gates

- [x] UI, secure pairing workflow and TV remote commands implemented.
- [x] Node unit tests for input validation, command allowlisting, request shapes and protected-token storage.
- [x] Local mock-TLS validation of certificate pinning before authorization header transmission.
- [ ] Successfully pair the **packaged Windows application** with the actual V655-H9.
- [ ] Validate remote keycodes, Stremio launch, status and text from the new package.
- [ ] Confirm whether Stremio Web Conjure accepts the documented search-route URL, and separately whether the focused-field ASCII method works.
- [ ] Diagnose Torrentio missing from the TV's Stremio Web despite being present in Danu's desktop account.
- [ ] Sign release binaries using Lumen Helix's release code-signing identity.

An earlier command-line prototype remains in untracked hub/ development files and is intentionally **not** part of this desktop package. Use the new Electron client for distribution work.

The search URL is grounded in the official Stremio Web [SearchBar](https://github.com/Stremio/stremio-web/blob/d44dcc5b1b213a41982dc2b239d366145171a030/src/components/NavBar/HorizontalNavBar/SearchBar/SearchBar.js) and [Search route](https://github.com/Stremio/stremio-web/blob/d44dcc5b1b213a41982dc2b239d366145171a030/src/routes/Search/Search.js). No Stremio source is copied into MAITV.

Independent open-source compatibility project. Not affiliated with Vizio, Stremio or Torrentio. No firmware, proprietary application binaries, media files, or streaming add-ons are bundled.
