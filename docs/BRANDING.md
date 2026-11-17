# MAITV brand-source record

## Original Lumen Helix Solutions asset

- Source website: https://lumenhelix.com/
- **Official bulb PNG:** https://lumenhelix.com/images/logo-bulb.png?v=2
- Local, unchanged original download: `assets/lumen-helix-logo-official.png`
- Downloaded for MAITV on 2026-11-16.
- Original website HTML identifies the image as `Lumen Helix Bulb Logo`.
- The company wordmark **is live text in the site's header, not a separate wordmark image**.

Website header spelling and styling at capture:
- `LUMEN` — uppercase, bold, `text-neon-cyan`
- `helix` — lowercase, bold, white
- `solutions` — lowercase, `text-neon-green/80`, tracking-widest

## README integration

- `README.md` directly displays the unchanged official bulb PNG, linked back to the official website.
- `assets/lumen-helix-maitv-official.svg` embeds the **unchanged PNG bytes** in a MAITV-specific banner and reproduces the header's wording/casing and general color treatment.
- The SVG typography and banner composition are **custom MAITV layout**, not a pixel-perfect reproduction of the website's HTML font rendering.
- Rebuild the banner from the source PNG and version-controlled template with `npm run brand:build`.
- `assets/maitv-logo.svg` and `assets/maitv-banner.svg` are MAITV-specific original graphics, not the Lumen Helix company emblem.

For exact logo reuse on other materials, use `assets/lumen-helix-logo-official.png`, **not** any reinterpretation or AI-generated icon. If the official website logo changes, verify the revision explicitly before updating this repository.

## License boundary

The [MIT License](../LICENSE) applies to MAITV original software source code, tests, and documentation. It **does not grant independent rights to use the Lumen Helix Solutions name, official bulb logo, or company branding**, including these official-logo-bearing files:

- `assets/lumen-helix-logo-official.png`
- `assets/lumen-helix-maitv-official.svg` and its `.template.svg` source
- `desktop/assets/lumen-helix-logo.png`
- `android/app/src/main/res/drawable-nodpi/lumen_helix_bulb.png`

Those branded assets remain subject to the rights of their respective owner(s) and are included as project identification, not as a grant to reuse Lumen Helix marks or artwork in unrelated products. Replace the branding when distributing an independently branded fork. Third-party product names used for compatibility are owned by their respective holders.
