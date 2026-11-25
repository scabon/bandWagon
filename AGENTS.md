# AGENTS.md — bandWagon

Generic voucher/gift-card reminder extension. Manual entry only: no scraping,
no content scripts, no host permissions — ever.

## Core rules

1. **Privacy stance**: the extension requests no network access and sends
   nothing anywhere. The `tabs` permission is only used to read tab URLs for
   arrival notifications. Do not add content scripts or host permissions.
2. **Manual entry**: voucher codes and values are typed by the user. Never
   auto-fill from pages.
3. **i18n**: en + fr via the STRINGS pattern in the popup; add every new
   user-facing string in both languages.
4. All extension code lives in `extension/`. Design docs in `docs/`.
5. One notification per site visit per tab (notifiedTabs pattern); recompute
   watched hostnames from valid vouchers on storage change.
6. **e2e**: `python tests/e2e/bandwagon_e2e.py a|b|c` must stay green
   (a: popup stack, b: seeded badge, c: Chromium load smoke; see
   `tests/README.md`). The harness sets `MOZ_REMOTE_ALLOW_SYSTEM_ACCESS=1`
   itself — Firefox >= 138 requires it for the Marionette chrome context.
   Add-on ID is `bandwagon@cabon14.com` (owned domain, unchangeable after
   first publication).

## Build & test

- Lint: `npx web-ext lint --source-dir extension`
- Firefox package: `npx web-ext build --source-dir extension --artifacts-dir dist`
- The Chromium MV3 package (service-worker entry point swapped in) and the
  store release/upload tooling are maintained privately by the author —
  install the Chromium build from the Chrome Web Store.
