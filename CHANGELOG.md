# Changelog

All notable changes to MAITV are recorded here. MAITV uses [Semantic Versioning](https://semver.org/) with one coordinated version across the browser/TV test client, Windows desktop client and Android companion. Release candidates are **not** stable releases.

## [1.0.0-rc.1] - 2026-11-17

### Added
- Windows application-wide explanatory tooltips for mouse hover and keyboard focus.
- A persistent discovery instruction and selected-device highlight showing that clicking a detected Vizio fills its IPv4 address.
- Coordinated version numbers for the Windows, Android and browser clients; monotonic Android version codes.
- CI release/version checks and platform-specific acceptance tracking.

### Carried forward
- Windows: secure SmartCast PIN pairing, certificate pinning, nearby-device discovery, digital remote, Stremio launcher and experimental search.
- Android: local SmartCast remote with haptic gestures, device discovery and encrypted pairing.
- Browser: local input and D-pad diagnostic prototype.

### Known limitations
- The new Windows package, Android app and TV-facing browser still require complete physical-device acceptance tests.
- PC-to-TV and Android-to-TV Stremio text entry, search routing and Torrentio visibility remain unresolved.
- No firmware modifications are distributed. Windows binaries are not code-signed for a production release.
- This candidate is not yet the stable `v1.0.0` release.

## Earlier private previews
- `desktop-v0.6.0-alpha1`: Windows installer and portable pre-release.
- `v0.5.0-alpha2`: Android discovery and gesture remote prototype.
- `v0.4.0-alpha1`: initial Android remote.
