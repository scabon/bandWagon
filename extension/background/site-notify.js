// Site arrival notification. When the user opens a site they hold valid
// vouchers for, fire one system notification ("You have N valid
// vouchers for {site}. Nearest expiry: {date} (in N days).", with
// "expires today" when the nearest one runs out today). The watched
// hostnames are derived from the siteUrl values of the valid vouchers
// and recomputed whenever the voucher list changes - there is no
// hardcoded site. No content script and no host permission: the tabs
// permission only lets the background script read tab URLs (v1.3
// privacy stance).
// Safari has no webextensions notifications API at all (MDN BCD), so
// this degrades to a no-op there.

(function () {
  if (!browser.notifications || !browser.tabs || !browser.tabs.onUpdated) {
    return; // no notifications API (Safari) or unexpected environment
  }

  const DAY_MS = 24 * 60 * 60 * 1000;

  // Matching key of a stored siteUrl: lowercase host, leading "www."
  // ignored (same normalization as the popup's parseSiteUrl)
  function siteHost(siteUrl) {
    try {
      return new URL(siteUrl).hostname.toLowerCase().replace(/^www\./, '');
    } catch (e) {
      return '';
    }
  }

  // Watched hosts -> site display name, rebuilt from the valid vouchers
  const watchedSites = new Map();

  function rebuildWatchedSites(valid) {
    watchedSites.clear();
    valid.forEach(function (voucher) {
      const host = siteHost(voucher.siteUrl || '');
      if (host && !watchedSites.has(host)) {
        watchedSites.set(host, voucher.siteName || host);
      }
    });
  }

  // Initial build (getValidVouchers comes from background.js, loaded
  // first), then rebuilt on every voucher storage change
  getValidVouchers().then(rebuildWatchedSites).catch(function () {});
  browser.storage.onChanged.addListener(function (changes, area) {
    if (area === 'local' && changes.vouchers) {
      getValidVouchers().then(rebuildWatchedSites).catch(function () {});
    }
  });

  // One notification per tab visit: the tab is marked when notified and
  // only notified again after it leaves the site or is closed. SPA
  // pushState navigation never fires status "complete", so in-site route
  // changes stay silent.
  const notifiedTabs = new Set();

  const MESSAGES = {
    en: {
      one: 'You have 1 valid voucher for {site}.',
      many: 'You have {n} valid vouchers for {site}.',
      soonest: ' Nearest expiry: {date} (in {days} {unit}).',
      today: ' Nearest expiry: {date} (expires today).',
      unit: { one: 'day', many: 'days' }
    },
    fr: {
      one: 'Vous avez 1 bon valide pour {site}.',
      many: 'Vous avez {n} bons valides pour {site}.',
      soonest: ' Expiration la plus proche : {date} (dans {days} {unit}).',
      today: ' Expiration la plus proche : {date} (expire aujourd\u2019hui).',
      unit: { one: 'jour', many: 'jours' }
    }
  };

  function messageFor(lang, site, count, soonest, daysLeft) {
    const dict = MESSAGES[lang] || MESSAGES.en;
    let text = (count === 1 ? dict.one : dict.many)
        .split('{n}').join(count)
        .split('{site}').join(site);
    if (soonest) {
      // Same days-suffix format as the expiry notification (singular
      // handled, "expires today" when the nearest one runs out today)
      const template = daysLeft <= 0 ? dict.today : dict.soonest;
      const unit = daysLeft === 1 ? dict.unit.one : dict.unit.many;
      text += template.split('{date}').join(soonest)
                       .split('{days}').join(daysLeft)
                       .split('{unit}').join(unit);
    }
    return text;
  }

  // Same language resolution as the popup (settings + browser locale)
  function resolveLanguage(setting) {
    if (setting === 'en' || setting === 'fr') return setting;
    return ((navigator.language || 'en').toLowerCase().indexOf('fr') === 0)
        ? 'fr' : 'en';
  }

  function hostOf(url) {
    try {
      return new URL(url).hostname.toLowerCase().replace(/^www\./, '');
    } catch (e) {
      return '';
    }
  }

  function isWatchedUrl(url) {
    const host = hostOf(url);
    if (!host) return false;
    try {
      const parsed = new URL(url);
      if (parsed.protocol.indexOf('http') !== 0) return false;
    } catch (e) {
      return false;
    }
    return matchingSite(host) !== null;
  }

  // A tab matches a watched site when its host is the site's host or a
  // subdomain of it (same subdomain tolerance as wagonBAR's matcher)
  function matchingSite(host) {
    if (watchedSites.has(host)) return host;
    for (const site of watchedSites.keys()) {
      if (host.endsWith('.' + site)) return site;
    }
    return null;
  }

  // Fire the notification for a tab that just finished loading the site
  async function notifyArrival(tabId, url) {
    try {
      const data = await browser.storage.local.get('settings');
      const settings = data.settings || {};
      if (settings.notifications === false) {
        return; // the notifications toggle in Settings is off
      }

      const host = hostOf(url);
      const siteKey = matchingSite(host);
      if (!siteKey) {
        return; // the watch set was stale
      }
      const valid = (await getValidVouchers())
          .filter(v => siteHost(v.siteUrl || '') === siteKey);
      if (valid.length === 0) {
        return;
      }

      notifiedTabs.add(tabId);

      // Oldest-first sort from getValidVouchers: the first expiry is
      // the nearest one
      const soonest = valid[0].expiryDate;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      // Parse as local midnight, same as getValidVouchers in
      // background.js (a date-only string reads as UTC otherwise)
      const daysLeft = Math.round(
          (new Date(soonest + 'T00:00:00') - today) / DAY_MS);
      const lang = resolveLanguage(settings.language);
      const site = watchedSites.get(siteKey) || siteKey;
      let iconUrl = 'icons/icon-128.png';
      if (browser.runtime && browser.runtime.getURL) {
        iconUrl = browser.runtime.getURL('icons/icon-128.png');
      }

      await browser.notifications.create({
        type: 'basic',
        iconUrl: iconUrl,
        title: 'bandWagon',
        message: messageFor(lang, site, valid.length, soonest, daysLeft)
      });
    } catch (e) {
      console.log('bandWagon: arrival notification failed:', e);
    }
  }

  browser.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    if (changeInfo.status !== 'complete') return;
    const url = (tab && tab.url) || changeInfo.url || '';
    if (!isWatchedUrl(url)) {
      notifiedTabs.delete(tabId); // left the site: next visit notifies again
      return;
    }
    if (notifiedTabs.has(tabId)) return; // already notified this visit
    notifyArrival(tabId, url);
  });

  browser.tabs.onRemoved.addListener(function (tabId) {
    notifiedTabs.delete(tabId);
  });

  // A click just dismisses the notification (an extension popup cannot
  // be opened programmatically; the toolbar badge already shows the count)
  if (browser.notifications.onClicked) {
    browser.notifications.onClicked.addListener(function (id) {
      browser.notifications.clear(id);
    });
  }
})();
