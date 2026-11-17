# MAITV development plan

## Goal
Provide reliable home-screen control and app integration for Vizio V655-H9 while leaving installed firmware untouched.

## Phase 0 — Recovery
- Original MA.I.TV handoff and Conjure architecture recovered from connected Drive project notes; see `LEGACY_RECOVERY.md`.
- Locate MAITV/Stremio **source code** on OmniBook when available.
- Inspect only relevant code, identify bridge architecture and test commands.
- Check Danu's port 11470 and process ownership before deciding whether to restart any service.
- Document exact TV WebView/launcher runtime and input event surface.

## Phase 1 — Controller/focus mapping (implemented in the local prototype)
- Normalize arrow/select/back keyboard input.
- Apply deterministic directional focus movement on a 2-column grid.
- Do not intercept text fields or unrelated browser shortcuts.
- Provide focus indication, last-30-event diagnostic log, and sanitized local report. (Implemented; awaiting physical-TV validation)
- Unit test input mappings and focus edge cases. (Implemented)
- Add a localhost HTTP smoke test and keep LAN mode opt-in. (Implemented)

## Phase 2 — TV compatibility
- Compare actual Vizio key event codes with documented mappings.
- Add an adapter only if actual events are observed, preserving browser fallback.
- Validate D-pad movement, OK/Select, Back, and media controls on target hardware.

## Phase 3 — Stremio and add-ons
- Connect to the recovered bridge and explicitly check whether it is reachable.
- Test Stremio account add-on sync and Torrentio configuration separately from torrent playback availability.
- Do not place personal add-on credentials or service tokens in Git.
- Provide graceful errors and safe fallback.

## Phase 4 — Launcher and OS research
- Evaluate public open-source Vizio packages and licensing.
- Prototype an opt-in web launcher with watchdog/fallback; no automatic firmware write.
- Add diagnostics and network privacy analysis only after compatibility checks.

## Current acceptance gate
`npm test` must pass (seven tests in v0.2). Browser keyboard event diagnostics must be reviewed before any device-side integration. The local UI is a prototype, **not** a TV installation.
