# MAITV MVP Packaging — v0.5

## Product definition

**MAITV** is a local-first SmartCast control platform, initially targeting the Vizio V655-H9. Android 0.5.0-alpha2 is privately released at https://github.com/LumenHelixLab/MAITV/releases/tag/v0.5.0-alpha2 . It adds opt-in mDNS discovery, gesture remote, haptic feedback and three new JVM tests. The earlier 0.4 debug release remains historical only. It does not replace or flash ViziOS. The product's differentiation is direct navigation, one-tap Stremio Web, secure pairing and eventually keyboard search without requiring Chromecast or a TV-side APK.

### Android alpha (packaged in this milestone)

- Native Android remote with dark Lumen Helix branding and the **original official bulb PNG from lumenhelix.com**.
- Android 8.0+; Android SDK 35/AGP 8.7.3; no proprietary UI or streaming dependencies.
- Opt-in 12-second mDNS discovery of Cast-capable neighbors (user must verify Vizio identity); manual private IPv4 fallback, four-digit TV PIN pairing, local HTTPS endpoint port 7345.
- Per-device SHA-256 TLS certificate pin after pairing; Android Keystore AES-256-GCM bearer-token encryption.
- D-pad / OK / Back / Home / Menu / volume / mute / playback / input buttons, plus swipe/tap touchpad with haptics and accessibility labels.
- One-tap fixed URL launch of official Stremio Web through Vizio Conjure (ns4/id17).
- Native phone soft keyboard or normal Android voice dictation with SmartCast ASCII CODESET 0 send-to-focused-field.
- Forget-TV pairing control, clear connection status and no background telemetry.
- **Not yet physically validated from Android**; the equivalent Danu one-tap Conjure launch and MAITV's TV D-pad navigation are previously verified.

### Windows PC client — MAITV Desktop v0.6 alpha

- New standalone Electron/Windows desktop client under desktop/: an actual remote UI, on-demand TV discovery, on-screen PIN pairing, status, fixed one-tap Stremio Web launch, remote keys, and two search-input experiments.
- Current-user Windows safeStorage encryption protects pairing credentials; the Vizio self-signed TLS certificate is fingerprint-pinned before AUTH headers are transmitted.
- Nine Node protocol/profile tests passed; local fake-TV TLS pinning test passed; read-only mDNS discovery identified the V655-H9 on Danu's home network.
- An NSIS installer and portable Windows EXE are built as **unsigned private alpha** packages. New packaged app still needs real PC-to-TV pairing and navigation validation.
- The old experimental hub/ command-line code is not included in the Windows package. Background service, multi-TV profiles, and signed production binaries are deferred.

## Packaging gates

| Gate | Current status |
|---|---|
| Secure client with fixed allowlisted TV commands | Implemented, source-reviewed |
| Android SDK 35 build and lint on Danu | Passed; two documented security/design review warnings (self-signed TLS trust manager and durable SharedPreferences commits), no blocking errors |
| Pure JVM unit tests | Seven passing (four protocol + three gesture math), plus Android compilation and lint |
| Android APK is debug-signed and has SHA-256 checksum | Private alpha only |
| Install on Pixel and pair with physical Vizio | **Pending** |
| D-pad, Home, Back, volume working from Pixel | **Pending** |
| Stremio Web launch from Pixel | **Pending** |
| ASCII text accepted by Stremio search | **Pending**; firmware/browser dependent |
| Torrentio account recognition & lawful playback | Installed on Danu, but user later reported Torrentio missing on TV. This is an open blocker, not solved |
| Independent security + license audit | **Pending** |
| Organization production code-signing key | **Pending** |
| Public repository and promotion | **Not approved** (keep private) |
| MAITV Desktop Windows UI and fixed TV command bridge | Implemented; screenshot and dev-window smoke checked on Danu |
| Windows protocol tests and fake-TV TLS rejection | 9/9 tests passing; wrong certificate prevented AUTH transmission |
| Windows installer and portable binaries | Private alpha build completed locally; unsigned |
| New desktop PC client paired with actual Vizio | **Pending** |
| Stremio URL-route search on Vizio | **Pending**; official route implemented but Conjure behavior unverified |

## Second phase

1. Hardware acceptance testing on Pixel 10a and V655-H9.
2. Fix any detected pairing/TLS or keycode issues with regression tests.
3. Confirm whether Conjure/Stremio uses the SmartCast ASCII text path. If the browser doesn't accept text, build an explicitly authorized MAITV search interface rather than claiming an on-screen keyboard magically appears.
4. Validate the now-implemented mDNS discovery and gesture touchpad on the Pixel. Follow with multi-TV profiles, LAN-only security instrumentation, accessible feedback, and phone-to-TV keyboard fallback.
5. License review for any third-party Stremio/VIDAA-derived code, update GitHub README, add screenshots and branded social preview.
6. Build signed release APK/AAB and Windows installer only after successful hardware testing.

## Constraints

- No firmware flashing, rooting, OTA updates or retail TV app sideloading.
- No installation of Torrentio or redistribution of third-party streams in MAITV.
- Pairing credentials never enter the GitHub repository, UI logs or telemetry.
- No global TLS validation bypass: the SmartCast self-signed certificate is scoped to pairing and pinned for subsequent control.
- No public distribution or marketing claims of production readiness while Android on-TV checks remain incomplete.

## Source lineage
- Official Lumen Helix bulb: https://lumenhelix.com/images/logo-bulb.png?v=2
- SmartCast remote API documentation: https://github.com/exiva/Vizio_SmartCast_API
- SmartCast client architecture: https://github.com/raman325/vizaio
- Conjure URL launcher: https://github.com/get-air/vizio
- Stremio Web: https://github.com/Stremio/stremio-web

No third-party source implementation was copied into the new native Android module; the code implements the documented protocol with local defenses.
