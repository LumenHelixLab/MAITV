# MAITV MVP Packaging — v0.4

## Product definition

**MAITV** is a local-first SmartCast control platform, initially targeting the Vizio V655-H9. The Android private prerelease is available at https://github.com/LumenHelixLab/MAITV/releases/tag/v0.4.0-alpha1 . It does not replace or flash ViziOS. The product's differentiation is direct navigation, one-tap Stremio Web, secure pairing and eventually keyboard search without requiring Chromecast or a TV-side APK.

### Android alpha (packaged in this milestone)

- Native Android remote with dark Lumen Helix branding and the **original official bulb PNG from lumenhelix.com**.
- Android 8.0+; Android SDK 35/AGP 8.7.3; no proprietary UI or streaming dependencies.
- Manual private IPv4 address entry, four-digit TV PIN pairing, local HTTPS endpoint port 7345.
- Per-device SHA-256 TLS certificate pin after pairing; Android Keystore AES-256-GCM bearer-token encryption.
- D-pad / OK / Back / Home / Menu / volume / mute / playback / input button controls.
- One-tap fixed URL launch of official Stremio Web through Vizio Conjure (ns4/id17).
- Native phone soft keyboard or normal Android voice dictation with SmartCast ASCII CODESET 0 send-to-focused-field.
- Forget-TV pairing control, clear connection status and no background telemetry.
- **Not yet physically validated from Android**; the equivalent Danu one-tap Conjure launch and MAITV's TV D-pad navigation are previously verified.

### Windows desktop hub (in-progress, not yet in release)

- Existing MAITV input laboratory on Danu with ephemeral Conjure launching and seven-plus local tests.
- Separate experimental hub implementation under hub/ is work-in-progress and must not be shipped until audit, full pairing recovery and service tests.
- Windows installer, signed builds, background service and multi-TV support are deferred.

## Packaging gates

| Gate | Current status |
|---|---|
| Secure client with fixed allowlisted TV commands | Implemented, source-reviewed |
| Android SDK 35 build and lint on Danu | Passed; two documented security/design review warnings (self-signed TLS trust manager and durable SharedPreferences commits), no blocking errors |
| Pure JVM unit tests | Passed |
| Android APK is debug-signed and has SHA-256 checksum | Private alpha only |
| Install on Pixel and pair with physical Vizio | **Pending** |
| D-pad, Home, Back, volume working from Pixel | **Pending** |
| Stremio Web launch from Pixel | **Pending** |
| ASCII text accepted by Stremio search | **Pending**; firmware/browser dependent |
| Torrentio account recognition & lawful playback | Installation was confirmed on Danu; TV consistency needs final testing |
| Independent security + license audit | **Pending** |
| Organization production code-signing key | **Pending** |
| Public repository and promotion | **Not approved** (keep private) |

## Second phase

1. Hardware acceptance testing on Pixel 10a and V655-H9.
2. Fix any detected pairing/TLS or keycode issues with regression tests.
3. Confirm whether Conjure/Stremio uses the SmartCast ASCII text path. If the browser doesn't accept text, build an explicitly authorized MAITV search interface rather than claiming an on-screen keyboard magically appears.
4. Add mDNS discovery, multi-TV profiles, LAN-only security tests, accessible touchpad, and phone-to-TV fallback.
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
