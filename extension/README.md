# bandWagon - Browser Extension

A browser extension to track vouchers and gift cards for any site, with
reminders to use them before they expire. Firefox is the shipped target;
Chrome/Chromium-based browsers are supported through the same code, and
the code stays Safari-compatible.

## Features

- **Add vouchers**: Site, optional code, optional euro value, expiration date
- **View all vouchers**: See all your vouchers sorted by expiration date
  (oldest first), with the site name on each row as a clickable link
- **Badge count**: The toolbar icon shows a badge with the number of valid vouchers
- **Notifications**: Arrive on a site you hold valid vouchers for, and get
  reminded; each voucher also gets an expiry lead-time reminder
- **Delete vouchers**: Remove vouchers you've used or that have expired
- **Cross-device sync**: Vouchers replicate across devices signed into the same browser account

## Installation

### Development Installation (for testing)

1. Open Firefox
2. Go to `about:debugging`
3. Click "This Firefox" in the left sidebar
4. Click "Load Temporary Add-on..."
5. Select any file in the `extension/` directory (e.g., `manifest.json`)
6. The extension will be loaded temporarily (cleared when Firefox restarts)

### Permanent Installation

Permanent installation requires a signed XPI:

1. Sign the package (see [Packaging](#packaging) below) or use
   [Developer Edition](https://www.mozilla.org/firefox/developer/) with
   `xpinstall.signatures.required` set to `false` in `about:config`
2. Go to `about:addons` in Firefox
3. Click the gear icon → "Install Add-on From File..."
4. Select the signed XPI file

### Chrome / Edge / Brave / Opera / Vivaldi (Chromium)

The Chromium manifest differs slightly from the Firefox one (service
worker instead of an event page), so a dedicated MV3 build is needed.
That build is produced by the maintainer's private release tooling — for
development, use Firefox (see above); end users install the Chromium
build from the Chrome Web Store or Edge Add-ons.

## Usage

### Adding a Voucher

1. Click the extension icon in the Firefox toolbar
2. Fill in the site name (autocompletes from the sites you already use)
   and the site URL (the scheme is optional — `www.amazon.fr` is stored
   as `https://www.amazon.fr`)
3. Optionally fill in the voucher code and its value in euros
4. Pick the expiration date from the calendar (or type it as YYYY-MM-DD —
   dashes are inserted automatically and a grey hint shows the remaining
   format while typing; extension popups cannot open the native date
   picker, hence the custom calendar)
5. Click "Add Voucher"

The code is trimmed of any leading/trailing spaces or line breaks (paste
artifacts) and uppercased. A code is only optional; vouchers without one
(store credit, for instance) are fully supported. Two vouchers collide
only when they carry the same code for the same site.

### Viewing Vouchers

- Click the extension icon to see all your vouchers
- The site name on each row is a clickable link to the site
- Vouchers are color-coded: green for valid, red for expired
- Sort by expiration date (soonest first, the default), alphabetically
  by code, or by value with the selector next to the list title; the
  choice is remembered
- Search the list with the field above it (shown from two vouchers on):
  matches site name, URL, code or amount, case- and accent-insensitive
- To delete a voucher, click "Delete" and then "Confirm?" on the same button
- To edit a voucher, click "Edit": its fields are loaded into the
  form (the button becomes "Update Voucher"), change what you need and
  save; "Cancel" leaves edit mode without changing anything
- Status messages (warnings, confirmations) dismiss themselves after a
  few seconds — click one to dismiss it immediately. Errors stay until
  your next action.

### Toolbar Badge

- The extension icon in the Firefox toolbar shows a badge with the number of
  valid (non-expired) vouchers
- The badge updates whenever vouchers are added or deleted, and at browser startup
- Click the icon to open the popup and manage your vouchers

## Permissions

The extension requests:

- `storage` — to save your vouchers locally
- `tabs` — to read tab URLs for the site arrival notifications
  (nothing else; no content scripts, no host permissions)
- `notifications` — the arrival and expiry reminders
- `alarms` — the daily expiry lead-time check

## File Structure

```
extension/
├── manifest.json          # Extension manifest (Manifest V3, Firefox)
├── README.md              # This file
├── background/
│   ├── background.js      # Shared background logic (storage, badge)
│   ├── sync.js            # Cross-device sync engine (merge, reconcile)
│   ├── site-notify.js     # Site arrival notifications (watched hosts
│   │                      #   derived from valid vouchers)
│   ├── expiry-notify.js   # Expiry lead-time reminders + snooze
│   └── service-worker.js  # Chromium MV3 entry point (imports polyfill + background.js)
├── shared/
│   └── sync-common.js    # Sync helpers shared by popup and background
├── popup/
│   ├── popup.html         # Popup UI
│   ├── popup.css          # Popup styles
│   └── popup.js           # Popup logic
├── vendor/
│   ├── README.md          # Provenance of the vendored libraries
│   └── browser-polyfill.js  # webextension-polyfill (browser.* on Chromium)
└── icons/
    ├── icon-16.png        # Toolbar icons (Chrome cannot render SVG)
    ├── icon-32.png
    ├── icon-48.png
    └── icon-128.png
```

## Data Storage

Vouchers are stored in the browser's local storage (`browser.storage.local`). Data persists across browser restarts.

Each voucher record: `{ id, siteName, siteUrl, code?, amount?, expiryDate,
createdAt }` — see [docs/data-model.md](../docs/data-model.md). The
`siteUrl` is normalized on save (scheme added, host lowercased, leading
`www.` ignored for matching) so that two entries for the same site match.

## Cross-device Sync

Vouchers sync between devices signed into the same browser account
(Firefox account on Firefox, Google/Microsoft account on Chromium).
No third-party service is involved.

- Firefox users must have **Add-ons** checked in the sync settings
  (Settings → Sync); Chromium syncs the data with the account
- Local storage always stays the source of truth — the sync area
  (`browser.storage.sync`) is only a replication copy, so the extension
  keeps working offline, signed out, and on Safari (which has no
  `storage.sync`; there it is simply local-only)
- One sync key per voucher, so concurrent changes on two devices never
  clobber each other; conflicts resolve per voucher, newest edit wins
  (`updatedAt` timestamp)
- Deletes are tombstones, so a device that was offline at deletion time
  cannot resurrect a voucher; tombstones are pruned after 90 days
- Firefox syncs extension data roughly every 10 minutes or on
  "Sync Now"; Chromium syncs in the background
- Quota is ~100 KB (browser-imposed) — roughly a thousand vouchers
- The toolbar badge and an open popup update automatically when a
  voucher arrives from another device

Sideloaded/dev builds sync too, as long as they share the same
extension ID (`browser_specific_settings.gecko.id`) and the account is
signed in on both devices.

## Packaging

Firefox (ZIP/XPI for submission to [addons.mozilla.org](https://addons.mozilla.org)):

```bash
npx web-ext build --source-dir extension --artifacts-dir dist   # -> dist/bandwagon-<version>.zip
```

Upload the ZIP directly on addons.mozilla.org, which signs and publishes it.

Chrome/Chromium (Web Store): the MV3 package (manifest at the zip root,
service worker entry point) is built by the maintainer's private release
tooling — install it from the
[Chrome Web Store](https://chromewebstore.google.com/).

## Browser Compatibility

Cross-browser compatibility (Firefox, Chrome/Chromium-based browsers,
Safari) is a standing requirement for this project. See [../AGENTS.md](../AGENTS.md).

- **Firefox 142+** — the shipped target (Manifest V3, background event
  page), covered by the e2e suite (phases a and b)
- **Chrome / Chromium (Edge, Brave, Opera, Vivaldi)** — supported. The
  popup and background code is engine-neutral and uses the promise-based
  `browser.*` namespace (Mozilla's webextension-polyfill provides it on
  Chromium and is a no-op on Firefox/Safari). The Chromium build
  (the private Chromium build) swaps in an MV3 service worker entry point
  and strips the Firefox-only manifest keys; icons are PNG. The e2e load
  smoke (phase c) verifies the extension loads and the service worker
  starts in a real headless Chromium
- **Firefox for Android** — supported on the code level (popup CSS grows
  fluid width and larger touch targets under `@media (pointer: coarse)`).
  Requires verification on a real device before release — see the
  Android checklist below
- **Safari 17+** — must stay code-compatible; it implements the same
  `browser.*` namespace, so the Chromium work covers it. Building and
  publishing the Safari app (Xcode's `safari-web-extension-converter`,
  Apple Developer account) is deferred until there is access to a Mac

Chrome smoke checklist (manual — phase c only proves load + service
worker startup):

1. Load `dist/chrome-unpacked/` via `chrome://extensions`
   (Developer mode → Load unpacked)
2. Add a voucher (site, typed date and calendar), check the toolbar badge count
3. Edit a voucher, two-step delete, sort order, expired/valid styling
4. Close and reopen the popup: list, sort order and badge persist

Firefox for Android smoke checklist (manual, real device — sideload
recipe below):

1. Sideload (recipe below), open the popup from the toolbar menu
   (three-dot menu → Add-ons → bandWagon → Settings/open in new tab).
   On Android the "popup" opens full-width: check the layout is not
   clipped on the phone's width and the sections stack sensibly
2. Add a voucher with the soft keyboard: typed date AND the custom
   calendar (are the day cells big enough to hit?)
3. Edit a voucher, two-step delete, sort dropdown, +/- toggle, hamburger
   menu and Settings/Help/About views — all with finger taps
4. Badge count on the toolbar icon (may not appear on all Android
   versions — note what you see, do not treat absence as a bug without
   checking a second device)
5. Expiry notification (set lead time so a voucher expires within it)
   and the site arrival notification: do system notifications fire?
   Does tapping one behave?
6. Settings persistence and sync: with a Firefox account signed in on
   the phone, do vouchers replicate to/from desktop?
7. Rotate the phone and toggle dark mode + French locale

Sideload recipe (Windows host, temporary add-on, no signing needed):

```
# phone: enable Developer options (Settings -> About phone -> tap Build
# number 7x), then Developer options -> Wireless debugging (ON). On
# Samsungs, Auto Blocker (Settings -> Security and privacy) must be OFF
# while toggling developer options. In Firefox: Settings -> About
# Firefox -> tap the logo 5x -> check "Remote debugging via USB".
# Then either plug in over USB (needs the Samsung Android USB driver
# installed on the host - adb stays blind to the phone without it), or
# use WiFi (preferred, no driver needed):
adb connect <ip:port>              # shown on the phone's Wireless debugging screen
                                   # (or find it with: adb mdns services)
npx web-ext run -t firefox-android -s extension
# add --firefox-apk org.mozilla.firefox (default, stable) or
# org.mozilla.fenix / org.mozilla.fennec_aurora for Nightly/Beta if the
# temporary install is refused on stable. web-ext watches and reloads
# on file changes; it also opens the remote debugger.
```

Run this checklist on a real device before enabling Firefox for
Android distribution.

## License

MIT License — see [LICENSE](../LICENSE).
