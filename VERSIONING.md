# MAITV release and versioning policy

MAITV has **three clients**: `src/` (browser / television input lab), `desktop/` (Windows Electron remote), and `android/` (Android native remote). They share the same MAITV release version. Platform-specific features and acceptance results are tracked separately.

## Semantic Versioning

Use `MAJOR.MINOR.PATCH` in accordance with SemVer 2.0:
- **MAJOR**: a breaking compatibility or public API change.
- **MINOR**: compatible features or capabilities.
- **PATCH**: backward-compatible fixes and security updates.
- Pre-release builds: `-alpha.N`, `-beta.N`, `-rc.N`. These have lower precedence than stable `MAJOR.MINOR.PATCH`.

The first public candidate is `v1.0.0-rc.1`; the stable version `v1.0.0` must wait for each client's acceptance gates. Do not describe `rc` or `beta` releases as stable.

## Source of truth

All three must match:
1. Root `package.json` `version` (browser lab).
2. `desktop/package.json` `version` and `desktop/package-lock.json`.
3. `android/app/build.gradle.kts` `versionName` and monotonic `versionCode`.

`npm run version:check` validates the alignment and a matching changelog entry. On a release tag, it also checks `v<version>`. The separate release GitHub Actions workflow tests and builds all three clients. Changes should update `CHANGELOG.md`, documentation and known issues.

Android versionCode is `MAJOR * 1,000,000 + MINOR * 10,000 + PATCH * 100 + stageRank`. Stages reserve ranks 1–24 for alpha 1–24, 25–48 for beta 1–24, 50–98 for rc 1–49, and 99 for stable. This permits upgrading through prereleases without decreasing Android versionCode.

## Danu workstation storage convention

For **future** MAITV installations, source checkouts, downloads, local backups, build caches, generated installers/APKs, and exported diagnostics on the Danu PC, choose paths on the `D:\\` drive by default. Prefer `D:\\projects\\MAITV` for source, `D:\\projects\\MAITV\\release` for distributables and a dedicated `D:\\Backups\\MAITV` folder for local backups. When running a Windows setup program, select a location under `D:\\Apps` if supported. Do **not** move or change existing installations or protected credential storage without a planned migration and backup. Some OS-managed files, temporary storage, Windows-protected application data, and system dependencies may still reside on `C:\\`; clearly disclose exceptions instead of promising zero writes to the system drive.

## Release procedure

1. Update versions together and increment Android versionCode; document changes.
2. Run `npm run version:check`, `npm test`, `npm --prefix desktop test`, Android tests, and Windows build. Confirm clean CI.
3. Audit tracked files **and reachable Git history** for private data, secrets, device tokens, and proprietary assets before making a repository public.
4. Complete the specific hardware test matrix in `docs/release-acceptance.json`, including evidence for each client.
5. For prereleases, tag `vX.Y.Z-rc.N` and label GitHub release **Pre-release**.
6. For stable releases only, require satisfactory physical-TV compatibility, installer/signing review, security review, updated docs, and successful tag-triggered release gate.
7. Tag exactly `vX.Y.Z` and publish checksums and release notes. Never rewrite published tags.

MAITV software source code and original documentation are licensed under the repository's [MIT License](LICENSE). Official Lumen Helix brand assets and third-party code/assets have separate rights; consult [docs/BRANDING.md](docs/BRANDING.md) and review dependency licenses before distribution.
