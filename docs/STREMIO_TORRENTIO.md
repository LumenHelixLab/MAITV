# Stremio + Torrentio restoration for MAITV

**Status (November 17, 2026): Torrentio is present on Danu but missing from the Vizio interface.** The user verified Torrentio among the installed Stremio desktop add-ons, then later reported it does **not** appear in Stremio Web on the television. Treat TV synchronization as unresolved. Do not claim the add-on is installed on Vizio or delete existing Danu configuration.

## What belongs where
- **Vizio V655-H9:** MAITV's temporary Conjure launcher displays Stremio Web. It is not Android TV and has no consumer APK sideload path.
- **Danu:** Stremio desktop client and optional streaming server. The desktop application was found and launched on November 17, 2026. The streaming service on port 11470 was **not** listening during this verification.
- **Stremio account:** Add-ons such as Torrentio are installed to the signed-in Stremio account, and should synchronize across devices signed into that account. The Windows desktop installation alone does not prove Torrentio is configured.
- **Torrentio:** Community Stremio add-on; the configuration webpage is https://torrentio.strem.fun/configure (version 0.0.15 observed November 17, 2026).

## Restore without duplicating
1. Open Stremio desktop on Danu and confirm it is signed into the **same account** used in Stremio Web on the television.
2. Open **Add-ons → My Add-ons** and look for Torrentio. If present, **do not reinstall**; use the existing entry and check whether it returns the intended, legally available streams.
3. If missing, open https://torrentio.strem.fun/configure on **Danu**, review the providers, resolution/size options and optional service choices, and select **Install**. Confirm installation in the signed-in Stremio client. Stremio's own help explains the account-level installation process.
4. If a configured URL is copied instead of installing directly, treat it as **sensitive**: it may embed an account-specific provider key. Do not put it in chat, GitHub, the MAITV frontend, logs or a public issue.
5. Reopen/reload Stremio Web on the TV and explicitly verify the active account identity. Check **My Add-ons** (not merely discover/search results). If Torrentio remains missing, compare the account on Danu, log out/in on the TV if necessary, and look for cached data or platform restrictions. Only then consider a new add-on install initiated on Danu. Do not paste credential-bearing manifest URLs into MAITV or GitHub.
6. Test D-pad, selection, Back and actual playback separately. Verified movement in the MAITV test page does **not** imply that Stremio Web itself handles all these keys.

## Current measured checks
- [x] Danu Stremio desktop executable exists.
- [x] Stremio shell and runtime processes were started on Danu during this session.
- [x] Torrentio configuration page opened in Danu's browser.
- [x] Remote directional navigation of **MAITV test page** reported working by user.
- [x] User confirmed Torrentio is listed among installed Stremio add-ons on Danu (other add-ons also present; no names inventoried).
- [ ] User subsequently reported Torrentio not showing in Stremio Web on Vizio. Account identity, web cache and add-on list must be rechecked.
- [ ] Confirm the Torrentio stream options appear for authorized content.
- [ ] Verify optional Danu streaming server port 11470 is running/reachable if the web player requires it.
- [ ] Verify the actual Stremio Web interface can be navigated by the Vizio remote.

## MAITV 1.0 RC2 sign-in workaround (new, hardware unverified)

The TV browser does not reliably allow D-pad access to Stremio’s profile icon. The MAITV Windows and Android clients now include a fixed **Open Stremio sign-in on TV** action, which launches `https://web.stremio.com/#/intro` directly through the paired SmartCast Conjure app. This does **not** inject JavaScript into Stremio, install APKs on Vizio, or bypass its authentication. The route is present in Stremio’s upstream web source; behavior on this Vizio is not yet confirmed.

**Windows:** After PIN pairing, open **Search & Apps → Open Stremio sign-in on TV**. On the television, select the email text field before using **Type Email on TV**. Select the password field and explicitly confirm that it is focused before using **Type Password on TV**. The password field is masked and cleared before the send attempt; MAITV does not save the credentials. Text entry is experimental and could enter text into the wrong TV field if focus is incorrect. Passwords are not placed in URLs or logs.

**Android:** After PIN pairing, use **Open Stremio sign-in on TV**, select the email field, and send the email through **Phone keyboard → TV text**. Select the password field before using **Private Stremio password entry**. The private field is masked and cleared before sending, with a second confirmation dialog. Android Keystore protects the TV pairing token, not Stremio login credentials (which are not retained).

**Direct navigation workaround:** The new Windows **Search & Apps → Jump to a Stremio page** panel and Android **Stremio direct navigation** group include fixed Home (`#/`), Settings (`#/settings`), Add-ons (`#/addons`) and Library (`#/library`) links. The routes are present in the upstream Stremio Web router. These commands bypass its unreachable sidebar; they do not modify the Stremio page DOM or guarantee remote focus on headers/banners.

**Validation gates:** (1) pair the updated MAITV client to the physical Vizio; (2) confirm the direct `/intro` route reaches Stremio login; (3) verify focus and one harmless test string before sending any password; (4) confirm the signed-in account matches Danu and Torrentio appears in **My Add-ons**. If focus or typing fails, do **not** enter a password through the remote test. Use an officially supported Stremio device/browser to manage the add-on and investigate Conjure compatibility separately.

The earlier Danu helper had no usable saved TV pairing during the November 17 remote attempt, so no sign-in launch was sent and hardware acceptance remains pending. MAITV does not automatically authenticate a Stremio account or provision Torrentio without user authorization.

## Boundaries
Torrentio configuration may include third-party credentials. MAITV does not collect or install these automatically. Only access and play content you have rights to use. Avoid reinstalling the add-on until the current account inventory has been checked.

Sources:
- https://stremio.zendesk.com/hc/en-us/articles/360021348391-How-to-install-uninstall-Add-ons
- https://docs.stremio-addons.net/addons/install
- https://torrentio.strem.fun/configure
