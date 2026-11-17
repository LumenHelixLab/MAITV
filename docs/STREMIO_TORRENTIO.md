# Stremio + Torrentio restoration for MAITV

**Status: Danu application open; account add-on state not yet verified.** A prior Torrentio installation was reported by the user. Do not assume that the add-on is present or that it must be reinstalled.

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
5. Reopen/reload Stremio Web on the TV and sign in to the same account. Verify its add-on list or test a title that you are authorized to watch. The TV may need to reauthenticate.
6. Test D-pad, selection, Back and actual playback separately. Verified movement in the MAITV test page does **not** imply that Stremio Web itself handles all these keys.

## Current measured checks
- [x] Danu Stremio desktop executable exists.
- [x] Stremio shell and runtime processes were started on Danu during this session.
- [x] Torrentio configuration page opened in Danu's browser.
- [x] Remote directional navigation of **MAITV test page** reported working by user.
- [ ] Confirm Torrentio is installed under the intended Stremio account.
- [ ] Confirm same account is signed in on Vizio Stremio Web.
- [ ] Confirm the Torrentio stream options appear for authorized content.
- [ ] Verify optional Danu streaming server port 11470 is running/reachable if the web player requires it.
- [ ] Verify the actual Stremio Web interface can be navigated by the Vizio remote.

## Boundaries
Torrentio configuration may include third-party credentials. MAITV does not collect or install these automatically. Only access and play content you have rights to use. Avoid reinstalling the add-on until the current account inventory has been checked.

Sources:
- https://stremio.zendesk.com/hc/en-us/articles/360021348391-How-to-install-uninstall-Add-ons
- https://docs.stremio-addons.net/addons/install
- https://torrentio.strem.fun/configure
