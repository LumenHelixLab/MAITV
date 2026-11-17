# Security policy

## Research-stage scope
MAITV currently contains a localhost-only browser prototype and no television-flashing tooling.

## Reporting
Please **do not post** exploitable device vulnerabilities, pairing credentials, tokens, private logs, personal information, or serial numbers in public issues. Use an authenticated private channel with repository maintainers. If GitHub Private Vulnerability Reporting becomes available for the repository, use that feature. No public security contact address is designated yet.

## Supported scope
The current research target is Vizio V655-H9 with reported firmware `1.720.9.1-1`.
Other models and firmware releases are not verified compatible.

## Safe practice
- Treat the previous TV firmware as unrecoverable until backups and recovery methods are proven.
- Avoid firmware writes, unreviewed network exposure, bypassing device security, and background data collection.
- Keep localhost-only development servers bound to 127.0.0.1.
- Scrub logs and code before uploading or submitting a report.
- Do not bundle copyrighted third-party firmware or streaming media.
