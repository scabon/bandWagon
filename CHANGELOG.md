# Changelog

## 0.1.0 (unreleased)

First release of bandWagon, forked from
[wagonBAR](https://github.com/scabon/wagonBAR) v1.7 (the SNCF Connect
voucher reminder) and generalized to track vouchers and gift cards
for any site.

- Vouchers carry a site name and URL; the code and the euro value are
  optional.
- The site name autocompletes from known sites and renders as a
  clickable link on each row.
- Arrival notifications fire for every site you hold valid vouchers
  for (hostnames derived from the vouchers, subdomains included), not
  just one hardcoded site.
- Duplicate detection is per site: the same code on two different sites
  is not a duplicate.
- Site URLs are normalized on save (scheme added when missing, host
  lowercased, leading `www.` ignored for matching).
- Expiry lead-time reminders with a configurable lead time and a
  "remind me tomorrow" snooze (inherited from wagonBAR 1.5+).
- Cross-device sync through the browser account (inherited from
  wagonBAR 1.4+).
- Firefox is the shipped target; Chrome/Chromium build via
  `tools/build-chrome.py`; Safari stays code-compatible.
