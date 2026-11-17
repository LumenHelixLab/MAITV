# Original MA.I.TV project recovery (2026-11-16)

This is a **sanitized summary** of the earlier MA.I.TV work, not a copy of private device captures or credentials. The project was previously styled **MA.I.TV** and is now developed as **MAITV**.

## Private background references (not included)
- Original MA.I.TV handoff — October 26
- Vizio custom-home analysis
- Vizio OS teardown, QA reviewed
- Portable MA.I.TV setup playbook

These source documents are privately held; their addresses, access permissions and full content are intentionally omitted. Do not reproduce private source links in the public repository.

## Confirmed historical findings (in project records)
- Target: Vizio V655-H9, firmware `1.720.9.1-1`.
- The Vizio SmartCast control API was paired in the old development environment; historical pairing credentials exist **outside this repository**. **Do not copy, read, upload, or print them as part of ordinary MAITV development.**
- The TV accepted an authorized Conjure URL launch (`NAME_SPACE:4`, `APP_ID:"17"`) and displayed Stremio Web in October.
- That Conjure launch was **ephemeral**, not a replacement for the boot home screen, an installed app, or modified firmware.
- The earlier project explicitly described working **from outside the TV**, with no firmware flashing. Any prior claim of a verified custom firmware replacement must be treated as **unverified**.
- A Stremio streaming service was reported to be running on a local hub at the time. A later check on Danu did not find the old port listening; restarting any historical process requires separate investigation.
- The previous HTML/bridge source was not found in the current MAITV GitHub repository or Danu's new `D:\projects\MAITV` tree. The original OmniBook environment remains offline.

## Recovered safe architecture

1. A portable **hub** on a computer serves a D-pad-accessible HTML launcher.
2. An **authorized server-side driver** holds paired TV credentials in an OS credential vault, not in the page, git, localStorage, browser logs, or telemetry.
3. The shell sends a **fixed action**, such as `stremio`, to a same-origin hub endpoint. That action is resolved to the known Stremio Web URL on the server; the browser cannot supply arbitrary outbound URLs.
4. The driver uses the supported Conjure URL launch through the TV's control API. Conjure is temporary; the default SmartCast home remains available.
5. The Stremio streaming service and its add-on/profile state are separate from the launcher. Restore and verify those components independently.

Do **not** deploy a control API on a publicly reachable interface, allow arbitrary URL launch from a page, disable TLS validation globally, or write credentials to the frontend. Local browser tests can proceed without any of these steps.

## Device-side milestone gate
- [x] Recover original design rationale and hardware/firmware identity.
- [x] Build v0.2 local keyboard/remote-event inspector, without device access.
- [ ] Locate earlier bridge source when OmniBook or the old worktree is accessible.
- [ ] Identify whether the original paired TV is currently reachable, without exposing credentials.
- [ ] Launch the diagnostic page **only during a user-authorized on-TV test**.
- [ ] Record key names and numeric keycodes from the physical remote; do not export secrets.
- [ ] Implement a separate, credential-safe one-tap Stremio hub driver after review.

## Sensitive data handling
The historic development machine has device captures and pairing files. Their existence has been confirmed by filenames only. **No sensitive files were opened, copied, committed, uploaded, or printed** for this recovery. A public MAITV release must exclude those artifacts entirely.
