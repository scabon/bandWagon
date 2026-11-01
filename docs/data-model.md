# bandWagon voucher data model

## Voucher record (stored in `browser.storage.local` under `vouchers`)

```json
{
  "id": "v-1731712323-abc",        // unique id (timestamp + counter)
  "siteName": "SNCF Connect",      // display name, free text
  "siteUrl": "https://www.sncf-connect.com",  // canonical site URL (optional;
                                              // clickable, used for arrival matching)
  "code": "ABC123XYZ",             // voucher code (optional)
  "value": 25,                     // value in euros (optional, nullable)
  "expiryDate": "2027-01-15"       // YYYY-MM-DD, parsed as local midnight
                                              // (optional: no expiry = valid
                                              //  indefinitely, no expiry reminders)
}
```

### Differences vs wagonBAR

- `siteName` / `siteUrl` are new. `siteUrl` is normalized (scheme stripped
  or added, trailing slash removed, `www.` ignored) so that two entries
  for the same site match. The URL is optional (a voucher can be for
  a local merchant with no website); URL-less vouchers simply never match
  arrival notifications.
- `code` becomes optional (a store-credit voucher may have no code).
- `siteUrl` and `expiryDate` are optional too: a voucher can be just a
  merchant name. No URL means no arrival matching and no link on the
  row; no expiry date means valid indefinitely (counted in the badge,
  never expired, sorted last, no expiry reminders).
- Duplicate detection becomes: same `code` **and** same site (the URL host
  when present, the site name for URL-less vouchers; a code is only
  unique within a site).

## Derived collections

- **Sites** (computed, not stored): distinct `{siteName, siteUrl}` pairs from
  vouchers. The form offers an autocomplete of known sites + free text for
  new ones.

## Settings (stored under `settings`, extends wagonBAR)

```json
{
  "theme": "system",
  "language": "system",
  "notifications": true,
  "notifyLeadDays": 7        // NEW: also notify N days before expiry
                             // (system notification, once per voucher)
}
```

## Migration of existing wagonBAR data

wagonBAR vouchers (`{code, value, expiryDate}`) map to bandWagon records
with `siteName: "SNCF Connect"`, `siteUrl: "https://www.sncf-connect.com"`.
A one-time import can be offered via the popup the first time bandWagon
runs with an empty store — low priority, personal use only.

## Export / import file format (v1.2.0)

Export (Settings → Export) downloads `bandwagon-vouchers-YYYY-MM-DD.json`:

```json
{
  "app": "bandWagon",
  "formatVersion": 1,
  "exportedAt": "2026-11-01T21:00:00.000Z",
  "vouchers": [ /* voucher records, see above */ ]
}
```

Import (Settings → Import) accepts that object **or a bare array of
vouchers** (e.g. a wagonBAR export — map `siteName: "SNCF Connect"`,
`siteUrl: "https://www.sncf-connect.com"`, see the migration section).
Validation per entry: `siteName` required, or deduced from a parseable
`siteUrl`; `code` uppercased; `amount` a number in (0, 10000];
`expiryDate` a real YYYY-MM-DD (past dates allowed — the voucher shows as
expired, like legacy data). Fresh `id`s are generated on import.
Duplicates (same code + same site) are skipped and reported. The freemium
gate applies: in the free tier, an import that would exceed FREE_LIMIT
opens the paywall and imports nothing.

## Storage notes

- Codes are stored in plain text in `storage.local` (same as wagonBAR).
  If `code` storage ever feels sensitive, consider storing codes only when
  the user actually needs them; do not invent encryption for v1.
- Cross-device sync via `storage.sync` follows the wagonBAR pattern
  (merge in background script).
