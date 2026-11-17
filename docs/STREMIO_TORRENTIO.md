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

## Boundaries
Torrentio configuration may include third-party credentials. MAITV does not collect or install these automatically. Only access and play content you have rights to use. Avoid reinstalling the add-on until the current account inventory has been checked.

Sources:
- https://stremio.zendesk.com/hc/en-us/articles/360021348391-How-to-install-uninstall-Add-ons
- https://docs.stremio-addons.net/addons/install
- https://torrentio.strem.fun/configure
