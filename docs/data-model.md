# bandWagon voucher data model

## Voucher record (stored in `browser.storage.local` under `vouchers`)

```json
{
  "id": "v-1731712323-abc",        // unique id (timestamp + counter)
  "siteName": "SNCF Connect",      // display name, free text
  "siteUrl": "https://www.sncf-connect.com",  // canonical site URL (clickable,
                                              // used for arrival-notification matching)
  "code": "ABC123XYZ",             // voucher code (optional)
  "value": 25,                     // value in euros (optional, nullable)
  "expiryDate": "2027-01-15"       // YYYY-MM-DD, parsed as local midnight
}
```

### Differences vs wagonBAR

- `siteName` / `siteUrl` are new. `siteUrl` is normalized (scheme stripped
  or added, trailing slash removed, `www.` ignored) so that two entries
  for the same site match.
- `code` becomes optional (a store-credit voucher may have no code).
- Duplicate detection becomes: same `code` **and** same site (a code is only
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

## Storage notes

- Codes are stored in plain text in `storage.local` (same as wagonBAR).
  If `code` storage ever feels sensitive, consider storing codes only when
  the user actually needs them; do not invent encryption for v1.
- Cross-device sync via `storage.sync` follows the wagonBAR pattern
  (merge in background script).
