# Tests

## e2e

`e2e/bandwagon_e2e.py` drives a real headless Firefox (via Marionette, which is
built into Firefox) with the extension installed as a temporary add-on, in
disposable profiles.

Prerequisites:

- Firefox 121+ available as `firefox.exe` on PATH (or set `FIREFOX_BIN` to the
  executable)
- `pip install marionette_driver`
- pwsh for cleanup on Windows

The harness sets `MOZ_REMOTE_ALLOW_SYSTEM_ACCESS=1` for the Firefox it
launches: since Firefox 138 Marionette gates its chrome context behind that
environment variable, and on Firefox 160 the old `-remote-allow-system-access`
command-line flag alone no longer works.

Run all phases (each launches and tears down its own browser instance):

```bash
python tests/e2e/bandwagon_e2e.py a   # install + empty badge + popup logic
python tests/e2e/bandwagon_e2e.py b   # seeded storage + badge count
python tests/e2e/bandwagon_e2e.py c   # Chromium load smoke (build + Edge)
```

The phases are separate because the storage backend caches its data file after
the first read: phase B seeds `browser.storage.local` before the extension's
first storage access and therefore needs a fresh session.

What is covered:

- MV3 manifest accepted and add-on installed (id `bandwagon@cabon14.com`)
- popup.js logic end to end (add, sort, duplicate, inline error status,
  two-step delete, counts, expired/valid classes, date rendering) — in a
  localhost-served copy of popup.html with a mocked `browser.storage`
  (Firefox blocks automation of real extension pages); asserts that no
  native `alert`/`confirm` dialogs are used. Also covers the custom date
  entry: typed YYYY-MM-DD dates, impossible dates (Feb 31) rejected
  inline, dates in the past rejected inline (today is the earliest
  allowed), dashes auto-inserted while typing with the remaining format
  shown as a grey hint, and the calendar widget (opens on the icon,
  past days disabled, today selectable, picking a day fills the field
  and closes). Expired vouchers can no longer be created through the
  form, so expired rendering is covered with storage seeded directly
  (legacy data)
- the generic site model: site name + URL fields, site autocompletion,
  the site name rendered as a clickable link on each row, the optional
  code (a voucher without one is valid), the same code accepted on
  another site but rejected on the same site, unparseable URLs rejected
  inline, scheme-less URLs normalized to https://
- voucher codes: pasted spaces/newlines trimmed
- editing: "Edit" loads a voucher into the form (submit relabeled,
  Cancel appears), saving updates it in place (unchanged code not treated
  as a duplicate) with a success message, Cancel exits without changes
- sorting: by expiration date by default, switchable to by code, kept
  across renders
- status messages: dismissible by click, transient successes
  auto-expiring; errors stay until the next action
- toolbar badge on the extension icon: empty with no vouchers, and the count
  of valid vouchers with seeded storage (expired filtered out, expiring-today
  kept) — read from the toolbar button in chrome context; the button is pinned
  to the nav-bar via a seeded `browser.uiCustomization.state` because a fresh
  profile parks extension buttons in the lazily-built unified-extensions panel
- same-day expiry: a voucher expiring today counts as valid through the end
  of its expiry day in both the popup and the badge (guards against parsing
  date-only strings as UTC)
- site arrival notifications: the watched hostnames are derived from the
  valid vouchers' siteUrl values; arriving on a watched site (subdomains
  included) fires one notification per tab visit with the valid count and
  the site name, repeat loads of the same visit stay silent, a new visit
  after leaving the site notifies again, the settings toggle silences it,
  and a site with no valid voucher never notifies
- expiry lead-time reminders: vouchers inside the lead window notify
  (today included), never twice for the same expiry date, lead time
  configurable, gated by both the notifications toggle and the
  expiry-reminders checkbox, click-to-snooze until tomorrow, a voucher
  without a code uses its site name in the message
- cross-device sync (phase a, with the event-emitting storage mock): user
  adds mirror to the sync area per-voucher key, existing local vouchers
  migrate into the sync area on startup, a remote voucher arrives in the
  list/counters/badge without local action, a newer remote edit overwrites
  the local copy, a remote tombstone removes the voucher locally, and a
  local delete mirrors as a tombstone. Real `storage.sync` behaviour on
  Firefox was verified manually on the wagonBAR parent project
  (2026-10-13, same sync code)

Not covered: the toolbar popup panel itself (not automatable), badge
colors (not exposed as DOM attributes).

- Chromium load smoke (phase c): builds the Chromium package
  (`tools/build-chrome.py`) and loads it in headless Edge (or
  `CHROME_BIN`); asserts the extension is accepted and its MV3 service
  worker starts, via the DevTools target list. The debug port is
  ephemeral and the browser process tree is force-killed afterwards
  (Edge's browser process outlives a plain terminate(), and an orphan
  holding the port makes the next run query the previous instance's
  targets). Proves load + service worker startup only — popup
  behaviour on Chromium is covered by the manual checklist in
  extension/README.md, since the popup and background code is shared
  with Firefox (phases a/b).
