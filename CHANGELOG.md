# Changelog

All notable changes to bandWagon are documented here. This file is the
source of truth for the popup's Changelog view: the English entries in
`extension/popup/popup.js` must match it exactly (checked by the
release tooling), and the French entries are a manual
translation of the same items.

When releasing a new version:

1. add a `## [<version>]` section here, newest first;
2. mirror the same items into the English `changelogEntries` in
   `extension/popup/popup.js` and translate them into the French block;
3. bump `"version"` in `extension/manifest.json` to match the new section;
4. run the changelog sync check.

## [1.3.1] — 2026-11-03

- Fixed: the "Rate this extension" link in the About view now opens the Edge Add-ons listing on Edge (it fell back to the Chrome Web Store while the Edge listing was pending).

## [1.3.0] — 2026-11-02

- Search field above the voucher list: filters by site name, site URL, code or amount as you type (accent-insensitive), with a “no match” message when nothing fits.

## [1.2.1] — 2026-11-01

- Fixed: the Import file picker did not open on Firefox — the file input was hidden, and Firefox only opens the picker for a rendered input (now rendered off-screen).

## [1.2.0] — 2026-11-01

- Export your vouchers to a JSON file and import them back — the import accepts a bandWagon export or a bare voucher array (a site URL alone is enough, the site name is deduced from it).
- Duplicates (same code on the same site) are skipped on import, and the free 10-voucher limit applies to imports too.

## [1.1.0] — 2026-11-01

- Free up to 10 vouchers; a one-time 1 € unlock removes the limit (no subscription, no ads, no tracking — see docs/monetization.md).
- Adding an 11th voucher opens the unlock view, with a link to the payment page and a field for the unlock code.
- The stats line shows the free limit until the extension is unlocked.

## [1.0.1] — 2026-11-01

- About view: a "Rate this extension" link opens the store listing of the detected browser (AMO on Firefox, Edge Add-ons when the browser is Edge, Chrome Web Store otherwise).
- Accessibility pass on the popup: menu roles with aria-expanded and focus management, Escape goes back from sub-views, calendar buttons get aria-labels, arrow-key navigation and focus return, status messages in a polite live region, labeled sort selector.
- Dark-theme contrast fixed, prefers-reduced-motion honored, expired vouchers get a text badge instead of a color-only marker.

## [1.0.0] — 2026-10-28

- First release: keep track of vouchers and gift cards for any site.
- Only the site name is required: the URL, code, value and expiry date are all optional (a voucher can be just the name of a local merchant).
- Enter the site URL first: the site name is deduced from it, reusing the name you already use for that site, and stays editable.
- Site names render as a clickable link on each row.
- The Add button stays greyed out until a site name is typed.
- Amounts display in your currency of choice, € or $ (Settings).
- Arrival notifications fire for every site you hold valid vouchers for, not just one.
- Duplicate detection is per site: the same code on two different sites is not a duplicate.
- Site URLs are normalized on save (scheme added when missing, host lowercased, leading www. ignored for matching).
- Expiry lead-time reminders with a configurable lead time and a "Remind me tomorrow" snooze.
- Vouchers sync across devices through your browser account.
- Also runs on Chrome and Chromium-based browsers; Safari stays code-compatible.

