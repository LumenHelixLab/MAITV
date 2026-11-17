# Contributing to MAITV

Thanks for helping improve reversible, testable, privacy-respecting Smart TV software.

## Before you start
- The project is currently **private**; request collaboration access before sending contributions.
- File a focused issue first for behavior-changing features.
- Do not include firmware blobs, copyrighted media, extracted secrets, private pairing credentials or serial numbers.
- Do not assume a fix observed on another Vizio/onn model applies to V655-H9.

## Local development
1. Install Node.js 18+.
2. From the repository root, run `npm test`.
3. Run `npm run dev` and open http://127.0.0.1:4173 **on the same machine**.
4. Make a small change in a branch; add a regression test for input/focus behavior.

## Pull request expectations
- State **what** changed and **why**.
- Include precise reproduction steps and tests.
- Separate verified desktop behavior from unverified TV behavior.
- Avoid device-specific privileged actions or telemetry by default.
- Confirm no secrets, pairing tokens, personal data or copyrighted firmware are included.

Changes that affect any TV device must include an opt-in, rollback, and safety analysis.
The repository is not licensed for redistribution yet; that decision is part of public-release review.
