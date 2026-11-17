# MAITV Desktop v0.6.0-alpha.1 — Private Windows Preview

**Lumen Helix Solutions / LumenHelixLab**

MAITV Desktop is a Windows 10/11 x64 PC client for controlling SmartCast-era Vizio televisions over a private Wi-Fi network. This is an **unsigned private alpha**, not a public release.

## Downloads

- **Windows Setup**: normal per-user installer, with desktop shortcut and uninstall support.
- **Portable EXE**: self-contained launcher that runs without installing system-wide software.
- **SHA-256 checksum file**: verify the packages before distribution.

## What's included

- Exact official Lumen Helix bulb asset and site-matched wordmark colors.
- New dark Windows UI with D-pad, OK, Back, Home, volume, playback and input buttons, plus physical keyboard shortcuts.
- One-tap Stremio Web launch on the TV via Vizio Conjure.
- Optional nearby-device discovery over mDNS; manual IP address entry as fallback.
- Four-digit television PIN pairing and Windows safeStorage/DPAPI protected token.
- Scoped TLS certificate pin, checked **before transmitting the AUTH header** on every authenticated request. An isolated local fake-TV TLS test verified that a certificate mismatch does not receive a bearer token.
- Device status and an opt-in always-on-top window mode.
- Two explicitly distinct search experiments:
  1. **Search on TV**: opens the official Stremio Web hash-router search URL with the PC's URL-encoded query. Supported by Stremio Web's source code, not yet verified in Vizio Conjure.
  2. **Send text to focused TV field**: sends SmartCast ASCII key commands, not verified inside the Stremio search box.
- No TV firmware modification, device rooting, cloud controller, bundled media, Torrentio code, or provider credentials.

## Verified before preview

- Windows Electron window opened successfully on Danu, with the official logo and full remote interface visible.
- Nine Node unit tests passed (validation, fixed commands, pairing, search URL, protected local credential handling).
- Local fake-TV TLS certificate mismatch test passed: zero authenticated HTTP requests transmitted to an untrusted certificate.
- Discovery on Danu's LAN found the Vizio V655-H9 by its broadcast name and private address.
- Electron Builder produces separate Setup and Portable Windows executables, with both confirmed by SHA-256 hashes.
- The first clean Windows GitHub Actions run passed: https://github.com/LumenHelixLab/MAITV/actions/runs/44151827095 (dependency install, unit tests, both Windows build targets, artifact upload).
- The client only offers fixed allowlisted SmartCast operations on a private IPv4 TV address.

## Open / unverified

- **This specific packaged app still needs a real PC-to-TV pairing test**. Historic MAITV scripts successfully launched Conjure on the V655-H9, but that does not prove every new IPC or pairing path.
- The Stremio hash-router search may be ignored by Vizio Conjure; this has not been confirmed yet.
- SmartCast ASCII text into the Vizio's Stremio search field may also fail.
- Torrentio was confirmed installed on Danu but reported missing in Stremio Web on the TV later in the conversation; TV account/add-on synchronization is unresolved.
- No certificate from a commercial code-signing authority has been applied to these Windows binaries; Microsoft SmartScreen may warn.
- This app has not been reviewed for public distribution, all supported Vizio models, user telemetry outside this app, or TV-specific DRM behavior.

## Start

1. Use Setup or Portable on a Windows 10/11 x64 PC on the same network as the TV.
2. Open MAITV Desktop → My Television → Find TVs on this network (or enter IP manually).
3. Confirm the displayed candidate is your Vizio and click Start Pairing.
4. Enter the 4-digit code shown on the TV.
5. Click Open Stremio on TV or use the digital remote.
6. For search, try Search & Apps → Search on TV. Confirm the result on the TV; if it fails, test ASCII text separately and report the exact behavior.

MAITV is independent and not affiliated with Vizio, Stremio, Torrentio, or the device manufacturers. Do not use the preview to access content without authorization.
