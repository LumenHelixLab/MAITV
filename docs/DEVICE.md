# Confirmed device and compatibility boundary

| Property | Recorded value |
| --- | --- |
| Project | MAITV |
| Device | Vizio V655-H9 |
| Display family | 2020 V-Series 65-inch |
| Firmware | 1.720.9.1-1 |
| Software | 1.720.9.1-1.21 |
| Target code family | 5691 / FUR7.2 (working inference from disclosure naming) |

## Research reference
https://github.com/opensource-vizio/5691_FUR7.2_OpenSourceSoftware

Do not assume a source-code release is a flashable firmware, or that vulnerabilities demonstrated on other Vizio/onn models work on this device.

## Historical work / unknowns
- User reports the Stremio bridge connected successfully, but the UI could not be navigated by a controller.
- Bridge source and controller mappings are currently missing.
- Historical Danu Stremio listening port: 11470 (reported Nov. 2, not verified listening Nov. 16).
- Existing modified firmware was reported by the user; its provenance, hash, build recipe, and rollback image have **not** been verified.

## Safety requirements
- Read-only, opt-in inventory before all device-side experiments.
- Isolate local keyboard-navigation tests from TV firmware.
- Obtain backups and serial-console/recovery documentation before proposing any flash or privileged operation.
- Never store or print Vizio pairing tokens.
