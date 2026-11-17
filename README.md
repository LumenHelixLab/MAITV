<div align="center">
  <a href="https://lumenhelix.com"><img src="assets/lumen-helix-logo-official.png" alt="Original Lumen Helix Solutions bulb logo, sourced directly from the company website" width="102" /></a>
  <br />
  <img src="assets/lumen-helix-maitv-official.svg" alt="LUMENhelix solutions — MAITV. Original company bulb image with site-matched wordmark colors and MAITV lettering." width="100%" />
</div>

<div align="center">
  <a href="https://github.com/LumenHelixLab/MAITV/actions/workflows/tests.yml"><img alt="Input test workflow" src="https://github.com/LumenHelixLab/MAITV/actions/workflows/tests.yml/badge.svg" /></a>
  <img alt="Project stage: experimental" src="https://img.shields.io/badge/Stage-Experimental-7c3aed?style=flat-square" />
  <img alt="Node.js 18 or later" src="https://img.shields.io/badge/Node.js-18%2B-339933?logo=nodedotjs&amp;logoColor=white&amp;style=flat-square" />
  <img alt="Safety: no firmware writes" src="https://img.shields.io/badge/Firmware_Writes-None-00bcd4?style=flat-square" />
  <img alt="Target: Vizio V655-H9" src="https://img.shields.io/badge/Target-V655--H9-2563eb?style=flat-square" />
</div>

<div align="center">
  <strong>A local-first experimental launcher and controller-input lab for SmartCast-era TVs.</strong>
  <br />
  <em>Make the screen yours — without gambling with its firmware.</em>
</div>

<div align="center">
  <br />
  <a href="#-quick-start"><strong>Get started</strong></a> ·
  <a href="#-status--roadmap"><strong>Roadmap</strong></a> ·
  <a href="#-get-involved"><strong>Contribute</strong></a> ·
  <a href="#-github-stars--activity"><strong>Star history</strong></a> ·
  <a href="docs/REMOTE_DIAGNOSTICS.md"><strong>Remote diagnostics</strong></a> ·
  <a href="docs/TV_TEST_SESSION.md"><strong>On-TV test</strong></a> ·
  <a href="docs/STREMIO_TORRENTIO.md"><strong>Torrentio setup</strong></a> ·
  <a href="docs/DEVICE.md"><strong>Device notes</strong></a>
</div>

---

> [!IMPORTANT]
> **Early-stage research prototype, not a TV firmware replacement.** The initial local browser demo and its keyboard-navigation unit tests work. Directional navigation on the Vizio-hosted MAITV test page has been **reported working by the user**. Precise keycodes, OK/Back behavior, direct Stremio Web navigation and any persistent on-TV deployment remain unverified. MAITV does not flash, root, or pair with any television.

## ✨ Why MAITV?

Smart TVs should be easier to navigate, inspect, and adapt to your own use. **MAITV** is a clean research workspace for exploring a more controllable television experience, starting with reliable D-pad input and a reversible launcher experiment.

The name is spelled **M-A-I-T-V**. This repository is maintained under **LumenHelixLab**, with **Lumen Helix Solutions** project branding.

| 🧭 Focus | 🛠️ What exists now | 🚧 What comes next |
|:--|:--|:--|
| **Remote navigation** | D-pad navigation confirmed on TV by user; keyboard inspector, opt-in Danu relay and eight automated tests | Capture actual keycodes and adapt Stremio Web focus |
| **Custom home** | Responsive four-tile browser mockup with a visible focus indicator | An optional, reversible launcher adapter |
| **Stremio integration** | Original MA.I.TV handoff and Conjure launch findings recovered; bridge source still missing | Recover source, verify transport and navigation |
| **Add-ons** | User confirms Torrentio is installed in Stremio on Danu and visible under the same account on Vizio | Test selection and playback of authorized streams |
| **OS research** | Model/firmware inventory and matching open-source research reference | Compatibility audits before any device-specific experiment |
| **Privacy** | In-memory sanitized input logs; localhost-only by default; no pairing tokens | Controlled on-TV testing and opt-in network analysis |

## 🕹️ Quick start

**Requirements:** Node.js 18+ and a modern desktop browser. No account, cloud deployment, or connected TV is required.

```powershell
git clone https://github.com/LumenHelixLab/MAITV.git
cd MAITV
npm test
npm run dev
```

Open **http://127.0.0.1:4173** on the same computer.

> The repository is **private** during development, so cloning requires authorized GitHub access. On the project workstation, the existing working copy is `D:\projects\MAITV`.

| Key | Demo behavior |
|:--:|:--|
| ↑ ↓ ← → | Move focus across the four navigation tiles |
| Enter | Select the highlighted tile |
| Escape / Backspace | Exercise the Back action without leaving the page |

The demo includes an **on-screen remote-event inspector**: it shows which DOM key events the browser receives, labels unknown mappings and provides a locally copyable redacted report. Use it to diagnose input rather than guessing at proprietary keycodes.

The example starts a **localhost-only** development server. It makes **no connection to the Vizio** and does not install anything on the TV. An **opt-in LAN preview** mode is documented in [remote diagnostics](docs/REMOTE_DIAGNOSTICS.md); enabling it requires a deliberate environment setting and an authorized app/browser to open the page on TV.

## 🧩 How it is structured

```text
MAITV/
├── assets/                 Logo and social/README banner (SVG)
├── src/
│   ├── index.html          Local interactive test UI
│   ├── styles.css          High-contrast focus styling
│   ├── remote.mjs          Modern and legacy event normalization
│   └── main.mjs            Focus, key-event inspector and local report
├── tests/remote.test.mjs   Navigation and diagnostic tests
├── tests/server.test.mjs   Local HTTP smoke test
├── tools/serve.mjs         Localhost default; opt-in LAN preview
├── docs/                   Device notes, technical plan, release checklist
├── .github/                CI and contribution templates
└── README.md
```

```mermaid
flowchart LR
    A[Keyboard test input] --> B[Normalize key]
    B --> C[Directional focus]
    C --> D[Selection / Back]
    E[Physical TV D-pad - user verified] -.keycodes not yet captured.-> B
    F[Recovered Stremio bridge - future] -.integration.-> D
```

## 📺 Known development target

| Property | Recorded value |
|:--|:--|
| Television | **Vizio V655-H9** — 2020 V-Series, 65-inch |
| Firmware | `1.720.9.1-1` |
| Software | `1.720.9.1-1.21` |
| Related source disclosure | [Vizio 5691 / FUR7.2 OpenSourceSoftware](https://github.com/opensource-vizio/5691_FUR7.2_OpenSourceSoftware) |
| Status of source disclosure | Useful reference, **not** a flashable alternative OS |

The October 26 MA.I.TV handoff confirms that the original TV accepted an **ephemeral Conjure launch of Stremio Web**. This was remote application control, **not a firmware replacement**. The controller/navigation defect remained unresolved. A historical local Stremio streaming service was **not observed listening** at the last check, and the earlier bridge source is still to be recovered. See the [sanitized original-project recovery summary](docs/LEGACY_RECOVERY.md).

See [device details](docs/DEVICE.md) and the [technical plan](docs/TECHNICAL_PLAN.md). **No cross-model exploit or modified firmware is assumed compatible.**

## 🚀 Status & roadmap

- [x] Establish a separate MAITV workspace and Git repository
- [x] Record the actual TV model and software identifiers
- [x] Recover the original MA.I.TV handoff and distinguish Conjure control from firmware modification
- [x] Build a keyboard-focus navigation prototype
- [x] Add automated directional-input tests and CI
- [x] Add privacy-conscious DOM key-event inspector with modern and legacy mappings
- [x] Document opt-in LAN preview without enabling network access by default
- [x] Launch MAITV through Conjure; confirm the TV requested the page and configuration
- [x] Add temporary, source-restricted, in-memory key-event relay
- [ ] Recover the previous MAITV/Stremio bridge source
- [x] Confirm physical Vizio D-pad navigation in the MAITV test page (user-reported)
- [ ] Capture individual Vizio key events/keycodes during a fresh diagnostic session
- [ ] Validate OK and Back behavior inside Stremio Web
- [x] Document restoring previously configured Torrentio in the existing Stremio account
- [x] Verify Torrentio already listed in Stremio on Danu (user confirmed)
- [x] User confirmed the same Stremio account and Torrentio visibility on Vizio
- [ ] Verify stream selection and permitted video playback with the Vizio remote
- [ ] Prototype an optional launcher with a documented rollback path
- [ ] Complete a security/licensing review before any public release

**Milestone 0.3: controlled Conjure input test.** Eight automated input, navigation, capture, and HTTP smoke tests pass on Danu. The Vizio accepted the ephemeral test-page launch and the user confirmed directional navigation works; raw event codes and Stremio Web control remain unverified. This is not a production install.

## ⭐ GitHub stars & activity

**Want to support the project?** GitHub repositories use **Stars**, rather than a general-purpose “Like” count. Use the ⭐ **Star** control on the repository page; forks, issues and pull requests provide other forms of community feedback.

[⭐ Star MAITV](https://github.com/LumenHelixLab/MAITV) · [🍴 Fork](https://github.com/LumenHelixLab/MAITV/fork) · [🐛 Report a bug](https://github.com/LumenHelixLab/MAITV/issues/new/choose) · [💡 Suggest a feature](https://github.com/LumenHelixLab/MAITV/issues/new/choose) · [🔀 Pull requests](https://github.com/LumenHelixLab/MAITV/pulls)

<details>
<summary><strong>📈 Live star tracking, forks, issues, and growth chart (enabled by a future public release)</strong></summary>

<br />

[![GitHub Stars](https://img.shields.io/github/stars/LumenHelixLab/MAITV?style=for-the-badge&logo=github&color=00d7e8)](https://github.com/LumenHelixLab/MAITV/stargazers)
[![GitHub Forks](https://img.shields.io/github/forks/LumenHelixLab/MAITV?style=for-the-badge&logo=github&color=8b5cf6)](https://github.com/LumenHelixLab/MAITV/forks)
[![GitHub Issues](https://img.shields.io/github/issues/LumenHelixLab/MAITV?style=for-the-badge&color=2784ff)](https://github.com/LumenHelixLab/MAITV/issues)
[![GitHub PRs](https://img.shields.io/github/issues-pr/LumenHelixLab/MAITV?style=for-the-badge&color=57cba8)](https://github.com/LumenHelixLab/MAITV/pulls)
[![Last Commit](https://img.shields.io/github/last-commit/LumenHelixLab/MAITV?style=for-the-badge)](https://github.com/LumenHelixLab/MAITV/commits/main)

[![MAITV star history chart](https://api.star-history.com/svg?repos=LumenHelixLab/MAITV&type=Date)](https://star-history.com/#LumenHelixLab/MAITV&Date)

> **Privacy note:** MAITV is currently **private**. Public badge providers and Star History may show “not found”, missing data, or a blank chart until the repository is public. None of those missing metrics implies zero engagement. No artificial star, like, or activity counts are used.

</details>

## 🤝 Get involved

Opening up this project responsibly is a goal, not a completed step. Authorized collaborators can use the [issue forms](https://github.com/LumenHelixLab/MAITV/issues/new/choose) to submit reproducible key-mapping issues or focused improvement proposals. Read [CONTRIBUTING.md](CONTRIBUTING.md) before submitting a pull request.

**Useful contributions:** Vizio keycode captures with private data removed; accessible focus indicators; deterministic controller tests; verified model/firmware documentation; reversible launcher patterns; and Stremio integration tests using lawful content.

> [!CAUTION]
> Never share pairing tokens, authentication secrets, serial numbers, private media libraries, or privileged device logs in an issue. Follow [SECURITY.md](SECURITY.md). Do not flash unverified firmware.

## 📣 Sharing and launch

This README is **launch-ready in structure**, but the repository is not public yet. The [public-release checklist](docs/RELEASE_CHECKLIST.md) covers licensing, third-party source provenance, screenshots, device validation, security review, and the GitHub social-preview image.

<sub>MAITV is an independent research project. Not affiliated with, sponsored by, or endorsed by Vizio, Stremio, or Torrentio. Third-party names identify compatibility targets only. No bundled copyrighted streams or TV firmware.</sub>
