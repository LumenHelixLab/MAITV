# MAITV

An experimental, reversible application and control layer for a **Vizio V655-H9**, developed independently of the TV's installed firmware. This is **not** a flashable firmware image or a replacement operating system.

## Confirmed target
- TV model: Vizio V655-H9 (2020 V-Series, 65-inch).
- Reported firmware: `1.720.9.1-1`.
- Reported software: `1.720.9.1-1.21`.
- Related public source reference: [Vizio 5691 FUR7.2 OpenSourceSoftware](https://github.com/opensource-vizio/5691_FUR7.2_OpenSourceSoftware). This is source disclosure, **not** a verified replacement ROM.

## Project status
- The earlier Stremio bridge was reported to have worked, but remote/controller navigation did not.
- The earlier bridge source has **not yet been recovered**.
- A Nov. 2 handoff reported a Stremio service on Danu port 11470, but no listening service was observed in a Nov. 16 check.
- The OmniBook containing earlier Vizio work is offline, so this directory begins a **new, isolated prototype**.
- Torrentio is a Stremio add-on; installation and playback must be validated separately from MAITV's input handling.

## Local prototype
Requires Node.js 18 or later.

```powershell
cd D:\projects\MAITV
npm test
npm run dev
```

Open http://127.0.0.1:4173 **on Danu**. The development server binds to localhost only; it does not connect to, modify, or expose the television.

Use keyboard arrow keys to navigate the four test tiles, Enter to select, and Escape or Backspace to exercise the back control. This tests ordinary browser keyboard events only; Vizio remote/WebView compatibility is unverified.

## Engineering milestones
1. Recover the previous bridge code and document its interface and network dependencies.
2. Log and normalize actual remote key events in a safe browser test session.
3. Establish directional focus/OK/Back operation, then validate on the TV without firmware changes.
4. Configure Stremio add-ons/account synchronization separately from playback-engine checks.
5. Prototype an optional launcher, privacy diagnostics, and rollback plan.

## Guardrails
- Do not flash or reset the television.
- Do not commit device pairing tokens, authentication cookies, logs containing secrets, or `.env` files.
- Never automate privileged device APIs without an explicit, reviewed device-specific compatibility check.
- Keep the MAITV GitHub repository private until source provenance and device security are reviewed.

See [Device notes](docs/DEVICE.md) and [technical plan](docs/TECHNICAL_PLAN.md).
