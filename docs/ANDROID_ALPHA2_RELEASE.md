# MAITV Android v0.5.0-alpha2 — Private Test Release

This prerelease improves the earlier debug APK. **It is not a finished or production-certified application.** The repository and package remain private under LumenHelixLab.

## What changed
- **Find nearby TVs**: user-initiated, 12-second local mDNS discovery of Cast-capable devices. Results may include non-Vizio hardware; confirm the device name/address before PIN pairing. Manual IP entry is still supported.
- **Swipe remote**: four-direction gesture pad plus tap-to-OK, haptic feedback, and a separate physical-style button grid.
- **Better connection feedback**: check powered-on/standby state after loading a saved pairing.
- **Secure pairing retained**: four-digit PIN on the TV, scoped TLS certificate pin, encrypted Android Keystore bearer token, no cloud backend.
- **One-tap Stremio Web launch** via SmartCast Conjure, fixed official URL.
- **Phone keyboard test**: ASCII send-to-focused-field remains experimental. This feature does **not** guarantee that Stremio Web's search UI will open a TV keyboard.
- **Engineering:** seven JVM unit tests (four protocol + three gesture math), Android SDK 35 build, Android lint and signed-APK verification.

## Important unresolved issues
- No Android-to-Vizio pairing or remote session has yet been physically tested on the Pixel 10a.
- mDNS discovery requires a network that allows it; it is not a reliable Vizio-only device identifier.
- The Vizio Stremio Web search box reportedly does **not** trigger a keyboard. ASCII text-entry support on that browser is unverified.
- The user reported Torrentio installed on Danu but missing in the TV's Stremio Web. That account/add-on issue is unresolved and separate from MAITV's Android remote.
- The desktop hub remains experimental and is **not** included in this APK.
- Two nonblocking Android lint review warnings remain: scoped self-signed-certificate trust/pinning and synchronous encrypted-credential persistence. No Android lint errors were reported.

## Install and test on your phone
1. Sign into the authorized LumenHelixLab GitHub account and download this APK from the private release.
2. On your Pixel, open the downloaded APK and allow installation from the browser/file manager if Android prompts you. This is a development build, not a Play Store app.
3. Put phone and Vizio V655-H9 on the same trusted Wi-Fi.
4. Open MAITV, tap **Find nearby TVs**. If the Vizio does not appear, enter its address manually from the TV's Network Information.
5. Tap Start pairing, then type the **four-digit PIN shown on your TV** into MAITV.
6. Swipe the touchpad and tap to select. Try Back, Home, volume, and Open Stremio Web. Confirm that each requested command produces the expected effect.
7. With a Stremio search field focused on the TV, try sending a short ASCII query from the phone. If it fails, report the failure; do not assume text mode works yet.

Never publish TV IPs alongside pairing tokens, PINs or credentials. An Android debug certificate is used for this preview; an organization-owned release signing key and hardware validation are required before distributing publicly.

## SHA-256
The APK asset has an accompanying checksum file. Confirm the download hash before installation if transferring through an untrusted intermediate.

MAITV is an independent compatibility project and is not affiliated with or endorsed by Vizio, Stremio, or Torrentio. No firmware modifications or third-party streaming add-ons are bundled.
