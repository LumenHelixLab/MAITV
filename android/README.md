# MAITV for Android — v0.5.0-alpha2

Native, local-first Vizio SmartCast remote for Android. **No TV app installation, casting, cloud account or running Danu server is required for the core remote.**

This alpha targets the confirmed Vizio **V655-H9 (firmware 1.720.9.1-1)** and Android 8.0+ (API 26+). Other models and firmware may implement different keycodes. Verify on actual hardware.

## Capabilities

| Feature | Status |
|---|---|
| Android Studio project | Built with Android SDK 35, AGP 8.7.3 and Java 17 |
| Four-digit SmartCast PIN pairing | Implemented; physical Android test pending |
| Scoped TLS certificate pin after pairing | Implemented |
| Android Keystore encrypted bearer-token storage | Implemented |
| D-pad, OK, Back, Home, Menu | Remote buttons and swipe/tap gesture pad with haptic response implemented; hardware test pending |
| Volume, mute, play/pause, input | Implemented; hardware test pending |
| One-tap Stremio Web launch | Conjure namespace 4, app 17; previously confirmed from Danu, Android test pending |
| Phone text keyboard / native dictation | Sends batched ASCII remote commands to a focused TV input field |
| Stremio keyboard activation | **Not guaranteed**: Conjure may not accept ASCII input in Stremio Web |
| Torrentio | Remains in the Stremio account, not bundled with MAITV |
| Nearby TV discovery | Opt-in 12-second mDNS search for Cast-capable devices; user must confirm which device is their Vizio; manual IPv4 fallback |
| Play Store release | Not ready; private debug-signed APK only |

## Pair from your Android phone

1. Connect the phone and Vizio to the same trusted Wi-Fi network.
2. Open MAITV and tap **Find nearby TVs**. Choose the correct Vizio from any discovered Cast-capable devices; discovery is not guaranteed on all routers. If missing, enter its private IPv4 address from Network Information manually.
3. Tap Start pairing; enter the four-digit PIN displayed on the television.
4. Tap **Open Stremio Web on TV** and navigate using **swipe/tap gesture pad** or the remote buttons.
5. For text, focus the search field on the TV, use your phone keyboard or microphone, and tap Send text. **It may still fail inside Stremio's Conjure browser** until we verify or adapt that input pathway.

Use Forget this TV to clear the saved pairing from your phone.

## Build on Danu

~~~powershell
cd D:\projects\MAITV\android
$env:JAVA_HOME='C:\Program Files\Android\Android Studio\jbr'
$env:ANDROID_HOME="$env:LOCALAPPDATA\Android\Sdk"
.\gradlew.bat :app:testDebugUnitTest :app:assembleDebug
~~~

The debug APK lands at app/build/outputs/apk/debug/app-debug.apk. Android Lint builds successfully; the remaining nonblocking warnings flag the deliberately device-scoped self-signed TLS trust manager (pin applied during pairing) and synchronous credential persistence (used off the UI thread to guarantee a saved pairing). Both need independent review before a production release. Install manually on an authorized Android phone after reviewing the installation warning. Do **not** distribute this debug-signed APK as a production release; validate it on the TV, complete the security review, and sign with the organization's release signing key first.

## Architecture and security

- SmartCastProtocol.java is a restricted HTTPS client for the TV's local SmartCast port 7345. It allowlists pairing, device state, remote keys and the **fixed** official Stremio Web launch URL. It rejects public IP addresses and arbitrary DNS names.
- The TV's self-signed certificate is accepted only during the four-digit pairing flow and its SHA-256 fingerprint is pinned thereafter. A certificate change blocks control until the user verifies the TV and re-pairs.
- SecureStore.java encrypts the long-lived AUTH token using Android Keystore AES-256-GCM. The app stores no plaintext pairing token, does not log it and includes no analytics/tracking SDK.
- MainActivity.java implements the Android UI, performs network requests off the main thread and shows connection errors without exposing sensitive internals.
- No rooted TV, sideloading on Vizio, firmware changes, port forwarding, screen capture or external media service is involved.

## Limitations

- SmartCast API mappings may vary on newer devices; test the supported V655-H9 first.
- ASCII CODESET 0 sends text only to compatible focused fields. It does not guarantee the native TV keyboard appears in Stremio Web. Cross-origin webpage focus cannot be forced through the basic SmartCast remote API.
- Pairing tokens are control credentials. Never publish them, store them in a Git repository or forward them to a third-party service. Forget on phone deletes the encrypted token but the TV may still list the paired device.
- Discovery is a user-initiated mDNS search for `_googlecast._tcp` peers, not proof of Vizio identity. Confirm the model physically before pairing. Some Wi-Fi/router settings suppress mDNS, so manual IP entry remains supported. Multi-TV profiles are planned.
- No Vizio firmware, Stremio player code, Torrentio code or copyrighted streams are bundled.

## Hardware acceptance

1. Install the private alpha on the Pixel and pair using the TV's PIN.
2. Test D-pad, OK, Back, Home, volume, and launching Stremio.
3. Test phone-keyboard ASCII entry in the focused Stremio search field, explicitly recording any failure.
4. Validate discovery and gesture navigation in the Pixel's native MAITV interface. Add multiple profiles, production release signing and validated Stremio search integration only after these gates pass.

References: https://github.com/exiva/Vizio_SmartCast_API , https://github.com/raman325/pyvizio , https://github.com/raman325/vizaio , https://github.com/get-air/vizio .

MAITV is independent and not affiliated with or endorsed by Vizio, Stremio or Torrentio.
