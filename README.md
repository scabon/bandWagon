# bandWagon

A reminder for the vouchers and gift cards you keep forgetting to use —
for any site.

bandWagon lives in the toolbar: add a voucher (site, code, value,
expiry date) and it counts the ones you can still spend, links you to
the site, notifies you when you open that site, and reminds you before
anything expires. Firefox is the shipped target; Chrome/Chromium works
too, and Safari stays code-compatible.

## Features

- Vouchers for any site, or a local merchant: only the site name is
  required; URL, code, value and expiry date are optional (when a URL
  is given, the site name is deduced and stays editable)
- Color-coded list with the valid count and total value at a glance;
  site names are one-click links
- Search field above the list: filter vouchers by site, code or amount
  as you type
- Toolbar badge with the number of valid vouchers
- Arrival notification when you open a site you hold valid vouchers for
- Expiry reminders: configurable lead time (1 to 30 days) with a
  one-day snooze
- Amounts in your currency of choice — € or $
- Cross-device sync through your own browser account — no third-party
  server involved
- Light and dark themes, in English and French
- Desktop browsers and Firefox for Android

## Privacy

Everything stays in your browser: no network access, no analytics, no
account, no tracking. No content scripts and no host permissions —
vouchers are typed in by you, nothing is scraped. The `tabs` permission
is only used to read tab URLs for arrival notifications.

## Installation

- **Firefox** — [addons.mozilla.org](https://addons.mozilla.org/firefox/addon/bandwagon/)
- **Chrome / Edge** — [Chrome Web Store](https://chromewebstore.google.com/detail/eiiafhkbefmdecnjfhkblldakggifhik) · [Edge Add-ons](https://microsoftedge.microsoft.com/addons/detail/bandwagon/jbhebpicpfbcckjikdbkfglhomhiacij)
- **From source** — see [extension/README.md](extension/README.md)
  (temporary add-on in `about:debugging`, or a signed package built with
  `npx web-ext build --source-dir extension`)

## Project layout

- `extension/` — all extension code ([extension/README.md](extension/README.md))
- `tools/` — icon and screenshot helper scripts, `stores.json` (public store IDs)
- `store/` — store-listing assets (descriptions, icons, screenshots)
- `docs/` — design notes
- `tests/e2e/` — the Marionette e2e suite (phases a/b/c)

The store release/upload tooling is maintained privately by the author.

bandWagon grew out of [wagonBAR](https://github.com/scabon/wagonBAR),
the SNCF Connect-specific voucher reminder, which stays alive
independently.

Add-on ID: `bandwagon@cabon14.com`.

## License

MIT — see [LICENSE](LICENSE).
