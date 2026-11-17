# Public-release readiness checklist

This project is **private** by design until the following are addressed. A polished README does not establish verified TV compatibility or permission to redistribute third-party code.

## Source, licensing and security
- [ ] Choose and commit a project license with the owner's approval; do not imply one before selection.
- [ ] Confirm that code and artwork have appropriate redistribution rights.
- [ ] Audit repository history for credentials, device pairing tokens and private logs.
- [ ] Confirm there are no proprietary Vizio firmware blobs or unauthorized third-party SDK copies.
- [ ] Review `SECURITY.md` and configure private security reporting.

## Engineering validation
- [x] Unit tests for the local keyboard navigation prototype.
- [ ] Recover the original Stremio bridge source and document its provenance.
- [ ] Test representative remote actions on the actual V655-H9.
- [ ] Document reversible installation and rollback for any future on-TV build.
- [ ] Verify Stremio add-on synchronization independently of stream playback.
- [ ] Add a short video or GIF of actual running software; label what device was used.

## GitHub distribution and discovery
- [x] README banner, visual mark and accessible image descriptions.
- [x] Stars/forks/issues/PR badges and Star History embed in a collapsible section.
- [x] CI workflow and bug/feature issue templates.
- [ ] Supply a GitHub social preview image (Settings → General → Social preview); SVG in the README is separate from this setting.
- [ ] Verify metrics/badge/chart rendering after visibility is changed to public.
- [ ] Publish first verified release with a changelog and hardware compatibility statement.
- [ ] Publish a responsible demo and share it through community channels without misrepresenting capabilities.
- [ ] Update project website/metadata and release notes as milestones land.

**Never** change repository visibility or device firmware as an automatic part of this checklist.
