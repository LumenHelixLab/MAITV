# MAITV v0.3 — Controlled Vizio Conjure input session

## Verified, November 17, 2026
- Target: Vizio V655-H9, firmware 1.720.9.1-1.
- Historic SmartCast pairing was reused by an existing Danu-local control helper; no credential was added to MAITV.
- A **temporary** Conjure launch (namespace 4, app ID 17) returned HTTP 200 / SUCCESS.
- The local MAITV server recorded a TV page request and the page's configuration request.
- **User verification, follow-up:** The user subsequently confirmed that the Vizio remote's directional buttons worked in the MAITV test page. This is a meaningful hardware/UI validation, but individual event names/keycodes were **not** captured persistently: the 15-minute in-memory diagnostic session expired before readback. OK, Back and Stremio Web navigation remain unverified.
- Installed firmware, TV apps and permanent boot settings were not changed.
- No new Windows Firewall rule was installed; the attempt was denied, and existing Node access was used.

## Architecture and privacy
- Default: npm run dev listens on 127.0.0.1:4173, capture off.
- Explicit live mode: bind to one trusted private LAN IPv4 interface, enable MAITV_CAPTURE=1 and set MAITV_CAPTURE_FROM to the approved TV's IP.
- Only that source IP and the local host can access the live test server.
- Only approved TV-source requests can POST sanitized keydown/keyup metadata.
- Event readback at /_maitv/events is allowed only from Danu itself, not from TV or other LAN clients.
- Reports retain up to 120 events in memory only; no file logs, cloud telemetry, raw typed characters, passwords or pairing tokens.
- The live server expires after 900 seconds by default, configurable between 60 and 3600 seconds.
- The on-screen inspector keeps the last 30 events; Copy requires user interaction.

## Run a future authorized test
Use a trusted home LAN only. Replace placeholders with actual current addresses; never write pairing secrets into this repository.

~~~powershell
cd D:\projects\MAITV
npm test
$env:MAITV_HOST = '<Danu private-LAN IPv4>'
$env:MAITV_CAPTURE = '1'
$env:MAITV_CAPTURE_FROM = '<approved Vizio private-LAN IPv4>'
$env:MAITV_SESSION_SECONDS = '900'
npm run dev
~~~

Use the existing authorized local SmartCast control client to open the local server URL through Conjure only while the television is free. No pairing or OS modification is part of this web app. Press Down, Right, OK and Back on the physical remote, one at a time.

Read /_maitv/events from the Danu host to see sanitized key names, numeric codes, normalized actions and page-request counts. Do not expose the status endpoint to other clients.

To finish, press the TV's Home button and stop the development server. No software must be removed from the TV.

## Acceptance gate
1. TV launches the web page and requests its configuration.
2. User confirms physical D-pad navigation on the test page; actual browser keydown/keyup records remain to be captured.
3. Verified keycodes map to D-pad, OK and Back correctly.
4. Focus traverses all four tiles, or a reproducible failure is documented.
5. Only then integrate the verified adapter with Stremio Web.

If event capture fails, do not invent keycodes. Investigate which input events the Conjure runtime intercepts.
