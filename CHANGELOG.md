# Changelog

All notable changes to bandWagon are documented here. This file is the
source of truth for the popup's Changelog view: the English entries in
`extension/popup/popup.js` must match it exactly (checked by
`tools/check-changelog.py`), and the French entries are a manual
translation of the same items.

When releasing a new version:

1. add a `## [<version>]` section here, newest first;
2. mirror the same items into the English `changelogEntries` in
   `extension/popup/popup.js` and translate them into the French block;
3. bump `"version"` in `extension/manifest.json` to match the new section;
4. run `python tools/check-changelog.py`.

## [1.0.0] — 2026-10-28

- First release: keep track of vouchers and gift cards for any site.
- Vouchers carry a site name; the URL, code and value are all optional (a voucher can be for a local merchant with no website).
- Enter the site URL first: the site name is deduced from it, reusing the name you already use for that site, and stays editable.
- Site names render as a clickable link on each row.
- Amounts display in your currency of choice, € or $ (Settings).
- Arrival notifications fire for every site you hold valid vouchers for, not just one.
- Duplicate detection is per site: the same code on two different sites is not a duplicate.
- Site URLs are normalized on save (scheme added when missing, host lowercased, leading www. ignored for matching).
- Expiry lead-time reminders with a configurable lead time and a "Remind me tomorrow" snooze.
- Vouchers sync across devices through your browser account.
- Also runs on Chrome and Chromium-based browsers; Safari stays code-compatible.

