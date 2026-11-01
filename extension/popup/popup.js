// Popup script for the bandWagon extension

document.addEventListener('DOMContentLoaded', function() {
  const addVoucherForm = document.getElementById('addVoucherForm');
  const addToggleBtn = document.getElementById('addToggleBtn');
  const voucherList = document.getElementById('voucherList');
  const siteNameInput = document.getElementById('siteName');
  const siteUrlInput = document.getElementById('siteUrl');
  const siteList = document.getElementById('siteList');
  // URL-first entry: names deduced from the URL reuse the host's
  // known name; siteNameAuto tracks that the field is auto-filled
  let knownSiteNames = {};
  let siteNameAuto = false;
  const totalVouchersSpan = document.getElementById('totalVouchers');
  const validVouchersSpan = document.getElementById('validVouchers');
  const validValueSpan = document.getElementById('validValue');
  const statusMessage = document.getElementById('statusMessage');
  const submitBtn = document.getElementById('submitBtn');
  const cancelEditBtn = document.getElementById('cancelEditBtn');
  const sortSelect = document.getElementById('sortOrder');
  const removeExpiredBtn = document.getElementById('removeExpiredBtn');
  const menuBtn = document.getElementById('menuBtn');
  const menuPanel = document.getElementById('menuPanel');
  const themeSelect = document.getElementById('themeSelect');
  const languageSelect = document.getElementById('languageSelect');
  const currencySelect = document.getElementById('currencySelect');
  const currencySymbolSpan = document.getElementById('currencySymbol');
  const notificationsToggle = document.getElementById('notificationsToggle');
  const expiryNotificationsToggle = document.getElementById('expiryNotificationsToggle');
  const leadDaysGroup = document.getElementById('leadDaysGroup');
  const leadDaysInput = document.getElementById('leadDaysInput');
  const helpContent = document.getElementById('helpContent');
  const changelogContent = document.getElementById('changelogContent');
  const aboutContent = document.getElementById('aboutContent');
  const limitLine = document.getElementById('limitLine');
  const limitLineText = document.getElementById('limitLineText');
  const limitUnlockLink = document.getElementById('limitUnlockLink');
  const paywallText = document.getElementById('paywallText');
  const paywallPayLink = document.getElementById('paywallPayLink');
  const unlockCodeInput = document.getElementById('unlockCodeInput');
  const unlockBtn = document.getElementById('unlockBtn');
  const paywallStatus = document.getElementById('paywallStatus');
  const exportBtn = document.getElementById('exportBtn');
  const importBtn = document.getElementById('importBtn');
  const importFileInput = document.getElementById('importFileInput');

  // Voucher currently being edited in the form, null when adding
  let editingId = null;
  // Auto-dismiss timer for transient status messages
  let statusTimer = null;
  const expiryInput = document.getElementById('expiryDate');
  const valueInput = document.getElementById('voucherValue');
  const calendarBtn = document.getElementById('calendarToggle');
  const calendarPanel = document.getElementById('calendarPanel');
  const expiryGhost = document.getElementById('expiryGhost');

  // Date entry pattern shown as the grey hint while typing
  const DATE_PATTERN = 'YYYY-MM-DD';

  // ---------------------------------------------------------------- i18n
  // English is the fallback; "system" resolves to the browser locale
  // (French when the browser is French, English otherwise)
  const STRINGS = {
    en: {
      appTitle: 'bandWagon \u2014 Vouchers',
      menuBtn: 'Menu',
      menuSettings: 'Settings',
      menuHelp: 'Help',
      menuChangelog: 'Changelog',
      menuAbout: 'About',
      addVoucherTitle: 'Add New Voucher',
      addToggleTitle: 'Add a voucher',
      siteLabel: 'Site:',
      sitePlaceholder: 'e.g., Amazon',
      siteUrlLabel: 'Site URL (optional):',
      siteUrlPlaceholder: 'e.g., www.amazon.fr',
      codeLabel: 'Code (optional):',
      codePlaceholder: 'e.g., ABC123XYZ',
      valueLabel: 'Value',
      valuePlaceholder: 'e.g., 25',
      errValue: 'Enter a value (e.g., 25).',
      expiryLabel: 'Expiration Date (optional):',
      calendarAria: 'Pick a date from the calendar',
      calendarTitle: 'Pick a date',
      addVoucher: 'Add Voucher',
      updateVoucher: 'Update Voucher',
      cancel: 'Cancel',
      dismissHint: 'Click to dismiss',
      yourVouchers: 'Your Vouchers',
      removeExpired: 'Remove expired',
      confirmQuestion: 'Confirm?',
      sortByDate: 'By date',
      sortByCode: 'By code',
      sortByValue: 'By value',
      sortOrder: 'Sort order',
      emptyMessage: 'No vouchers yet. Add one above!',
      statsTotal: 'Total',
      statsValid: 'Valid',
      statsValue: 'Value',
      statsVouchers: 'vouchers',
      settingsTheme: 'Theme',
      themeSystem: 'System',
      themeLight: 'Light',
      themeDark: 'Dark',
      settingsLanguage: 'Language',
      langSystem: 'System',
      settingsCurrency: 'Currency',
      settingsCurrencyHint: 'Currency shown for voucher amounts',
      settingsNotifications: 'Notifications',
      settingsNotificationsHint: 'Site arrival and voucher expiry reminders',
      settingsExpiryNotifications: 'Expiry reminders',
      settingsExpiryNotificationsHint: 'Voucher expiry notifications',
      settingsLeadDays: 'Expiry reminder (days before)',
      settingsLeadDaysHint: 'Notify me this many days before a voucher expires',
      errSiteUrl: 'Enter a valid site URL (e.g., www.amazon.fr).',
      errFillRequired: 'Please fill in the site name.',
      errValidDate: 'Enter a valid expiration date (YYYY-MM-DD).',
      errPastDate: 'The expiration date is in the past.',
      errDuplicate: 'A voucher with this code already exists for this site!',
      statusUpdated: 'Voucher updated.',
      removedExpiredOne: 'Removed 1 expired voucher.',
      removedExpiredMany: 'Removed {n} expired vouchers.',
      edit: 'Edit',
      del: 'Delete',
      expiresPrefix: 'Expires: ',
      prevMonth: 'Previous month',
      nextMonth: 'Next month',
      back: 'Back',
      months: ['January', 'February', 'March', 'April', 'May', 'June',
               'July', 'August', 'September', 'October', 'November', 'December'],
      weekdays: ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'],
      helpSections: [
        { title: 'Adding a voucher',
          text: 'Press the + button to open the form, then enter the site URL (optional: when given, the site name fills in automatically from it and stays editable; leave it empty for a local merchant with no website), the voucher code (optional), its value (optional) and its expiration date (optional too), and press Add Voucher. The date format is YYYY-MM-DD, use the calendar button to pick a date. If you close the popup mid-entry, your progress is restored when you reopen it.',
          items: [] },
        { title: 'Managing vouchers',
          text: '',
          items: ['Edit loads a voucher back into the form.',
                  'Delete is a two-step action: press it once, then Confirm.',
                  'Remove expired clears every expired voucher at once.',
                  'The site name on each row is a clickable link to the site.',
                  'Sort by date, code or value with the selector.'] },
        { title: 'Notifications',
          text: 'You are notified when you open a site you have valid vouchers for, and again before a voucher expires. Settings turns each kind off and sets the expiry lead time (days before).',
          items: ['Click an expiry notification (or its "Remind me tomorrow" button) to be reminded again the next day; just dismiss it otherwise.'] },
        { title: 'Sync across devices',
          text: 'Vouchers replicate through your browser account (Firefox account on Firefox, Google/Microsoft account on Chromium) once the browser is signed in. Safari keeps everything local.',
          items: [] },
        { title: 'Privacy',
          text: 'bandWagon stores everything locally in your browser. It requests no network access and sends nothing anywhere.',
          items: [] }
      ],
      changelogEntries: [
                        { version: '1.2.0',
          items: ['Export your vouchers to a JSON file and import them back — the import accepts a bandWagon export or a bare voucher array (a site URL alone is enough, the site name is deduced from it).',
                  'Duplicates (same code on the same site) are skipped on import, and the free 10-voucher limit applies to imports too.'] },
{ version: '1.1.0',
          items: ['Free up to 10 vouchers; a one-time 1 € unlock removes the limit (no subscription, no ads, no tracking — see docs/monetization.md).',
                  'Adding an 11th voucher opens the unlock view, with a link to the payment page and a field for the unlock code.',
                  'The stats line shows the free limit until the extension is unlocked.'] },
{ version: '1.0.1',
          items: ['About view: a "Rate this extension" link opens the store listing of the detected browser (AMO on Firefox, Edge Add-ons when the browser is Edge, Chrome Web Store otherwise).',
                  'Accessibility pass on the popup: menu roles with aria-expanded and focus management, Escape goes back from sub-views, calendar buttons get aria-labels, arrow-key navigation and focus return, status messages in a polite live region, labeled sort selector.',
                  'Dark-theme contrast fixed, prefers-reduced-motion honored, expired vouchers get a text badge instead of a color-only marker.'] },
        { version: '1.0.0',
          items: ['First release: keep track of vouchers and gift cards for any site.',
                  'Only the site name is required: the URL, code, value and expiry date are all optional (a voucher can be just the name of a local merchant).',
                  'Enter the site URL first: the site name is deduced from it, reusing the name you already use for that site, and stays editable.',
                  'Site names render as a clickable link on each row.',
                  'The Add button stays greyed out until a site name is typed.',
                  'Amounts display in your currency of choice, € or $ (Settings).',
                  'Arrival notifications fire for every site you hold valid vouchers for, not just one.',
                  'Duplicate detection is per site: the same code on two different sites is not a duplicate.',
                  'Site URLs are normalized on save (scheme added when missing, host lowercased, leading www. ignored for matching).',
                  'Expiry lead-time reminders with a configurable lead time and a "Remind me tomorrow" snooze.',
                  'Vouchers sync across devices through your browser account.',
                  'Also runs on Chrome and Chromium-based browsers; Safari stays code-compatible.'] }
      ],
      aboutTagline: 'A small reminder for the vouchers and gift cards you keep forgetting to use.',
      aboutNote: 'Your vouchers stay in your own browser.',
      madeBy: 'Made by:',
      aboutSite: 'cabon14.com',
      supportLabel: 'Support:',
      supportEmail: 'support@cabon14.com',
      donateTitle: 'Support bandWagon',
      donateLiberapay: 'Donate on Liberapay',
      donateTipeee: 'Tip on Tipeee',
      rateExtension: 'Rate this extension',
      expiredBadge: 'expired',
      paywallTitle: 'Unlock unlimited vouchers',
      paywallCodeLabel: 'Already paid? Enter your unlock code:',
      paywallCodePlaceholder: 'WAGON-XXXX-XXXX',
      paywallUnlockBtn: 'Unlock',
      paywallWrongCode: 'This code is not valid.',
      paywallUnlocked: 'Unlocked — unlimited vouchers. Thank you!',
      limitUnlockLink: 'Unlock unlimited',
      price: '1 €',
      paywallText: 'The free version keeps up to {n} vouchers. Unlock once for {price} to add as many as you need — a one-time payment, no subscription.',
      paywallPayLink: 'Unlock for {price}',
      limitLine: 'Free: up to {n} vouchers',
      settingsData: 'Data',
      settingsDataHint: 'Export your vouchers to a JSON file, or import a previously exported file',
      exportVouchers: 'Export (JSON)',
      importVouchers: 'Import (JSON)',
      exportDone: '{n} vouchers exported.',
      importDone: '{n} vouchers imported.',
      importDup: '{n} duplicate(s) skipped.',
      importAllDup: 'All {n} vouchers are already in your list.',
      importErrFile: 'This file is not a valid JSON voucher export.',
      importErrSchema: 'No valid voucher found in this file (a site name is required).'
    },
    fr: {
      appTitle: 'bandWagon \u2014 Bons',
      menuBtn: 'Menu',
      menuSettings: 'Param\u00e8tres',
      menuHelp: 'Aide',
      menuChangelog: 'Nouveaut\u00e9s',
      menuAbout: '\u00c0 propos',
      addVoucherTitle: 'Ajouter un bon',
      addToggleTitle: 'Ajouter un bon',
      siteLabel: 'Site :',
      sitePlaceholder: 'ex. Amazon',
      siteUrlLabel: 'URL du site (facultatif) :',
      siteUrlPlaceholder: 'ex. www.amazon.fr',
      codeLabel: 'Code (facultatif) :',
      codePlaceholder: 'ex. ABC123XYZ',
      valueLabel: 'Valeur',
      valuePlaceholder: 'ex. 25',
      errValue: 'Saisissez une valeur (ex. 25).',
      expiryLabel: 'Date d\u2019expiration (facultatif) :',
      calendarAria: 'Choisir une date dans le calendrier',
      calendarTitle: 'Choisir une date',
      addVoucher: 'Ajouter',
      updateVoucher: 'Mettre \u00e0 jour',
      cancel: 'Annuler',
      dismissHint: 'Cliquer pour fermer',
      yourVouchers: 'Vos bons',
      removeExpired: 'Supprimer expir\u00e9s',
      confirmQuestion: 'Confirmer ?',
      sortByDate: 'Par date',
      sortByCode: 'Par code',
      sortByValue: 'Par valeur',
      sortOrder: 'Ordre de tri',
      emptyMessage: 'Aucun bon pour l\u2019instant. Ajoutez-en un ci-dessus !',
      statsTotal: 'Total',
      statsValid: 'Valides',
      statsValue: 'Valeur',
      statsVouchers: 'bons',
      settingsTheme: 'Th\u00e8me',
      themeSystem: 'Syst\u00e8me',
      themeLight: 'Clair',
      themeDark: 'Sombre',
      settingsLanguage: 'Langue',
      langSystem: 'Syst\u00e8me',
      settingsCurrency: 'Devise',
      settingsCurrencyHint: 'Devise affich\u00e9e pour les montants des bons',
      settingsNotifications: 'Notifications',
      settingsNotificationsHint: 'Rappels : arriv\u00e9e sur un site et expiration des bons',
      settingsExpiryNotifications: 'Rappels d\u2019expiration',
      settingsExpiryNotificationsHint: 'Notifications d\u2019expiration des bons',
      settingsLeadDays: 'Rappel d\u2019expiration (jours avant)',
      settingsLeadDaysHint: 'M\u2019alerter ce nombre de jours avant l\u2019expiration d\u2019un bon',
      errSiteUrl: 'Saisissez une URL de site valide (ex. www.amazon.fr).',
      errFillRequired: 'Veuillez saisir le nom du site.',
      errValidDate: 'Saisissez une date d\u2019expiration valide (AAAA-MM-JJ).',
      errPastDate: 'La date d\u2019expiration est dans le pass\u00e9.',
      errDuplicate: 'Un bon avec ce code existe d\u00e9j\u00e0 pour ce site !',
      statusUpdated: 'Bon mis \u00e0 jour.',
      removedExpiredOne: '1 bon expir\u00e9 supprim\u00e9.',
      removedExpiredMany: '{n} bons expir\u00e9s supprim\u00e9s.',
      edit: 'Modifier',
      del: 'Supprimer',
      expiresPrefix: 'Expire : ',
      prevMonth: 'Mois pr\u00e9c\u00e9dent',
      nextMonth: 'Mois suivant',
      back: 'Retour',
      months: ['janvier', 'f\u00e9vrier', 'mars', 'avril', 'mai', 'juin',
               'juillet', 'ao\u00fbt', 'septembre', 'octobre', 'novembre', 'd\u00e9cembre'],
      weekdays: ['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di'],
      helpSections: [
        { title: 'Ajouter un bon',
          text: 'Appuyez sur le bouton + pour ouvrir le formulaire, puis saisissez l\u2019URL du site (facultative : si fournie, le nom du site s\u2019y remplit automatiquement et reste modifiable ; laissez-la vide pour un commer\u00e7ant local sans site web), le code du bon (facultatif), sa valeur (facultative) et sa date d\u2019expiration (facultative elle aussi), et appuyez sur Ajouter. Le format de date est AAAA-MM-JJ, utilisez le bouton calendrier pour choisir une date. Si vous fermez le popup en cours de saisie, votre progression est restaur\u00e9e \u00e0 la r\u00e9ouverture.',
          items: [] },
        { title: 'G\u00e9rer les bons',
          text: '',
          items: ['Modifier recharge un bon dans le formulaire.',
                  'Supprimer se fait en deux temps : un premier appui, puis Confirmer.',
                  'Supprimer expir\u00e9s efface d\u2019un coup tous les bons expir\u00e9s.',
                  'Le nom du site sur chaque ligne est un lien cliquable vers le site.',
                  'Triez par date, code ou valeur avec le s\u00e9lecteur.'] },
        { title: 'Notifications',
          text: 'Vous \u00eates averti quand vous ouvrez un site pour lequel vous avez un bon valide, puis avant l\u2019expiration d\u2019un bon. Les Param\u00e8tres d\u00e9sactivent chaque type d\u2019alerte et fixent le d\u00e9lai d\u2019expiration (jours avant).',
          items: ['Cliquez sur une notification d\u2019expiration (ou son bouton \u00ab Me le rappeler demain \u00bb) pour \u00eatre rappel\u00e9 le lendemain ; sinon, fermez-la simplement.'] },
        { title: 'Synchronisation entre appareils',
          text: 'Les bons se r\u00e9pliquent via le compte du navigateur (compte Firefox sur Firefox, compte Google/Microsoft sur Chromium) quand le navigateur est connect\u00e9. Safari reste local.',
          items: [] },
        { title: 'Confidentialit\u00e9',
          text: 'bandWagon stocke tout localement dans votre navigateur. Il n\u2019acc\u00e8de \u00e0 aucun r\u00e9seau et n\u2019envoie rien nulle part.',
          items: [] }
      ],
      changelogEntries: [
                        { version: '1.2.0',
          items: ['Exportez vos bons dans un fichier JSON et r\u00e9importez-les \u2014 l\u2019import accepte un export bandWagon ou un simple tableau de bons (une URL de site suffit, le nom en est d\u00e9duit).',
                  'Les doublons (m\u00eame code sur le m\u00eame site) sont ignor\u00e9s \u00e0 l\u2019import, et la limite gratuite de 10 bons s\u2019applique aussi aux imports.'] },
{ version: '1.1.0',
          items: ['Gratuit jusqu\u2019\u00e0 10 bons ; un d\u00e9blocage unique \u00e0 1 \u20ac supprime la limite (sans abonnement, sans pub, sans tra\u00e7age \u2014 voir docs/monetization.md).',
                  'L\u2019ajout d\u2019un 11e bon ouvre la vue de d\u00e9blocage, avec un lien vers la page de paiement et un champ pour le code.',
                  'La ligne de statistiques affiche la limite gratuite tant que l\u2019extension n\u2019est pas d\u00e9bloqu\u00e9e.'] },
{ version: '1.0.1',
          items: ['Vue \u00c0 propos : un lien \u00ab Noter l\u2019extension \u00bb ouvre la fiche store du navigateur d\u00e9tect\u00e9 (AMO sur Firefox, Edge Add-ons si le navigateur est Edge, Chrome Web Store sinon).',
                  'Passe accessibilit\u00e9 du popup : r\u00f4les de menu avec aria-expanded et gestion du focus, \u00c9chap revient des sous-vues, boutons du calendrier avec aria-labels + fl\u00e8ches + retour du focus, message de statut en live region polite, s\u00e9lecteur de tri \u00e9tiquet\u00e9.',
                  'Contraste du th\u00e8me sombre corrig\u00e9, prefers-reduced-motion pris en compte, les bons expir\u00e9s ont un badge texte \u00ab expir\u00e9 \u00bb au lieu d\u2019un marqueur couleur seul.'] },
        { version: '1.0.0',
          items: ['Premi\u00e8re version : suivez vos bons et cartes cadeaux pour tous vos sites.',
                  'Seul le nom du site est requis : l\u2019URL, le code, la valeur et la date d\u2019expiration sont tous facultatifs (un bon peut n\u2019\u00eatre que le nom d\u2019un commer\u00e7ant local).',
                  'Saisissez d\u2019abord l\u2019URL du site : le nom du site en est d\u00e9duit, reprenant celui que vous utilisez d\u00e9j\u00e0 pour ce site, et reste modifiable.',
                  'Le nom du site s\u2019affiche sous forme de lien cliquable sur chaque ligne.',
                  'Le bouton Ajouter reste gris\u00e9 tant qu\u2019aucun nom de site n\u2019est saisi.',
                  'Les montants s\u2019affichent dans la devise de votre choix, \u20ac ou $ (param\u00e8tres).',
                  'La notification d\u2019arriv\u00e9e se d\u00e9clenche pour chaque site o\u00f9 vous avez des bons valides, pas seulement un.',
                  'Les doublons sont d\u00e9tect\u00e9s par site : le m\u00eame code sur deux sites diff\u00e9rents n\u2019est pas un doublon.',
                  'Les URL sont normalis\u00e9es \u00e0 l\u2019enregistrement (sch\u00e9ma ajout\u00e9 si manquant, h\u00f4te en minuscules, \u00ab www. \u00bb initial ignor\u00e9 pour la correspondance).',
                  'Rappels avant expiration avec un d\u00e9lai configurable et un report \u00ab me le rappeler demain \u00bb.',
                  'Les bons se synchronisent entre appareils via le compte du navigateur.',
                  'Fonctionne aussi sur Chrome et les navigateurs bas\u00e9s sur Chromium ; Safari reste compatible.'] }
      ],
      aboutTagline: 'Un petit rappel pour les bons et cartes cadeaux que vous oubliez d\u2019utiliser.',
      aboutNote: 'Vos bons restent dans votre navigateur.',
      madeBy: 'Cr\u00e9\u00e9 par :',
      aboutSite: 'cabon14.com',
      supportLabel: 'Assistance :',
      supportEmail: 'support@cabon14.com',
      donateTitle: 'Soutenir bandWagon',
      donateLiberapay: 'Soutenir sur Liberapay',
      donateTipeee: 'Pourboire sur Tipeee',
      rateExtension: 'Noter l\u2019extension',
      expiredBadge: 'expir\u00e9',
      paywallTitle: 'D\u00e9bloquez les bons illimit\u00e9s',
      paywallCodeLabel: 'D\u00e9j\u00e0 pay\u00e9 ? Saisissez votre code de d\u00e9blocage :',
      paywallCodePlaceholder: 'WAGON-XXXX-XXXX',
      paywallUnlockBtn: 'D\u00e9bloquer',
      paywallWrongCode: 'Ce code n\u2019est pas valide.',
      paywallUnlocked: 'D\u00e9bloqu\u00e9 \u2014 bons illimit\u00e9s. Merci !',
      limitUnlockLink: 'D\u00e9bloquer l\u2019illimit\u00e9',
      price: '1 \u20ac',
      paywallText: 'La version gratuite conserve jusqu\u2019\u00e0 {n} bons. D\u00e9bloquez une fois pour {price} pour en ajouter autant que vous voulez \u2014 un paiement unique, sans abonnement.',
      paywallPayLink: 'D\u00e9bloquer pour {price}',
      limitLine: 'Gratuit : jusqu\u2019\u00e0 {n} bons',
      settingsData: 'Donn\u00e9es',
      settingsDataHint: 'Exportez vos bons dans un fichier JSON, ou importez un fichier pr\u00e9c\u00e9demment export\u00e9',
      exportVouchers: 'Exporter (JSON)',
      importVouchers: 'Importer (JSON)',
      exportDone: '{n} bons export\u00e9s.',
      importDone: '{n} bons import\u00e9s.',
      importDup: '{n} doublon(s) ignor\u00e9(s).',
      importAllDup: 'Les {n} bons sont d\u00e9j\u00e0 dans votre liste.',
      importErrFile: 'Ce fichier n\u2019est pas un export JSON de bons valide.',
      importErrSchema: 'Aucun bon valide dans ce fichier (un nom de site est requis).'
    }
  };

  // Donation links (see AGENTS.md, Donations section)
  const DONATION_LIBERAPAY = 'https://liberapay.com/cabon14/';
  // Tipeee serves a French UI on fr.tipeee.com and an English UI on
  // en.tipeee.com (same campaign) — pick per popup language.
  const DONATION_TIPEEE_FR = 'https://fr.tipeee.com/cabon14/';
  const DONATION_TIPEEE_EN = 'https://en.tipeee.com/cabon14/';

  // Store listing pages, where the user can rate the extension. Firefox
  // gets the AMO page (runtime.getBrowserInfo is Firefox-only); Chromium
  // gets the Edge Add-ons page when the UA says Edge, else the Chrome Web
  // Store listing. The Edge Add-ons listing is still pending validation,
  // so it falls back to the Chrome Web Store page meanwhile.
  const STORE_URL_FIREFOX = 'https://addons.mozilla.org/addon/bandwagon/';
  const STORE_URL_CHROME = 'https://chromewebstore.google.com/detail/bandwagon/eiiafhkbefmdecnjfhkblldakggifhik';
  const STORE_URL_EDGE = STORE_URL_CHROME;

  function storeRatingUrl() {
    if (browser.runtime && browser.runtime.getBrowserInfo) return STORE_URL_FIREFOX;
    if (/Edg\//.test(navigator.userAgent || '')) return STORE_URL_EDGE;
    return STORE_URL_CHROME;
  }

  let currentLang = 'en';

  function t(key, params) {
    let s = (STRINGS[currentLang] && STRINGS[currentLang][key]) ||
             STRINGS.en[key];
    if (s === undefined) return key;
    if (params) {
      Object.keys(params).forEach(function(name) {
        s = s.split('{' + name + '}').join(params[name]);
      });
    }
    return s;
  }

  // Apply the current language to every tagged node in the static markup.
  // data-flag carries a decorative prefix (language-selector flags) that
  // stays put while the label text is swapped
  function applyI18n() {
    document.documentElement.lang = currentLang === 'fr' ? 'fr' : 'en';
    document.querySelectorAll('[data-i18n]').forEach(function(node) {
      node.textContent = (node.dataset.flag ? node.dataset.flag + ' ' : '') +
                         t(node.dataset.i18n);
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(function(node) {
      node.placeholder = t(node.dataset.i18nPlaceholder);
    });
    document.querySelectorAll('[data-i18n-title]').forEach(function(node) {
      node.title = t(node.dataset.i18nTitle);
    });
    document.querySelectorAll('[data-i18n-label]').forEach(function(node) {
      node.setAttribute('aria-label', t(node.dataset.i18nLabel));
    });
    updateValueLabel();
  }

  // ------------------------------------------------------------- settings
  const DEFAULT_SETTINGS = {
    theme: 'system',      // 'system' | 'light' | 'dark'
    language: 'system',   // 'system' | 'en' | 'fr'
    currency: 'EUR',       // 'EUR' | 'USD' (currency for amounts)
    notifications: true,
    expiryNotifications: true,
    notifyLeadDays: 7     // days before expiry to send the lead-time reminder
  };
  let settings = Object.assign({}, DEFAULT_SETTINGS);

  const darkMedia = window.matchMedia('(prefers-color-scheme: dark)');
  if (darkMedia && darkMedia.addEventListener) {
    darkMedia.addEventListener('change', function() {
      if (settings.theme === 'system') applyTheme();
    });
  }

  // The CSS only ever sees "light" or "dark": "system" is resolved here
  function applyTheme() {
    const resolved = settings.theme === 'system'
        ? (darkMedia && darkMedia.matches ? 'dark' : 'light')
        : settings.theme;
    document.documentElement.setAttribute('data-theme', resolved);
  }

  function applyLanguage() {
    currentLang = resolveLanguage(settings.language);
    applyI18n();
    buildHelpContent();
    buildChangelogContent();
    buildAboutContent();
    renderPaywallTexts();
    updateLimitLine();
    // Dynamic labels and any rendered vouchers must follow the language
    submitBtn.textContent = editingId ? t('updateVoucher') : t('addVoucher');
    loadVouchers();
  }

  function resolveLanguage(setting) {
    if (setting === 'en' || setting === 'fr') return setting;
    return ((navigator.language || 'en').toLowerCase().indexOf('fr') === 0)
        ? 'fr' : 'en';
  }

  function loadSettings() {
    browser.storage.local.get('settings').then(function(data) {
      settings = Object.assign({}, DEFAULT_SETTINGS, data.settings || {});
      themeSelect.value = settings.theme;
      languageSelect.value = settings.language;
      currencySelect.value = settings.currency;
      currencySymbolSpan.textContent = currencySymbol();
      notificationsToggle.checked = settings.notifications;
      expiryNotificationsToggle.checked = settings.expiryNotifications;
      leadDaysGroup.hidden = !settings.expiryNotifications;
      leadDaysInput.value = settings.notifyLeadDays;
      applyTheme();
      applyLanguage();
    });
  }

  function saveSettings() {
    browser.storage.local.set({ settings: settings });
  }

  themeSelect.addEventListener('change', function() {
    settings.theme = themeSelect.value;
    applyTheme();
    saveSettings();
  });

  languageSelect.addEventListener('change', function() {
    settings.language = languageSelect.value;
    applyLanguage();
    saveSettings();
  });

  currencySelect.addEventListener('change', function() {
    settings.currency = currencySelect.value;
    currencySymbolSpan.textContent = currencySymbol();
    updateValueLabel();
    saveSettings();
    loadVouchers();
  });

  notificationsToggle.addEventListener('change', function() {
    settings.notifications = notificationsToggle.checked;
    saveSettings();
  });

  expiryNotificationsToggle.addEventListener('change', function() {
    settings.expiryNotifications = expiryNotificationsToggle.checked;
    leadDaysGroup.hidden = !settings.expiryNotifications;
    saveSettings();
  });

  // The lead-time reminder is clamped to 1-30 days (matching the
  // background script's validation)
  leadDaysInput.addEventListener('change', function() {
    const n = parseInt(leadDaysInput.value, 10);
    if (isNaN(n)) return;
    const clamped = Math.min(30, Math.max(1, n));
    if (clamped !== n) leadDaysInput.value = clamped;
    settings.notifyLeadDays = clamped;
    saveSettings();
  });

  // ------------------------------------------------------- export/import
  // Export format: {"app":"bandWagon","formatVersion":1,"exportedAt":...,
  // "vouchers":[...]}. Import accepts that object or a bare array (e.g. a
  // wagonBAR export): a voucher needs at least a site name, or a site URL
  // the name is deduced from.
  function buildExportJson(vouchers) {
    return JSON.stringify({
      app: 'bandWagon',
      formatVersion: 1,
      exportedAt: new Date().toISOString(),
      vouchers: vouchers
    }, null, 2);
  }

  function normalizeImportedVoucher(raw) {
    if (!raw || typeof raw !== 'object') return null;
    let siteName = typeof raw.siteName === 'string' ? raw.siteName.trim() : '';
    let siteUrl = null;
    if (typeof raw.siteUrl === 'string' && raw.siteUrl.trim()) {
      const parsed = parseSiteUrl(raw.siteUrl.trim());
      if (parsed) {
        siteUrl = parsed.url;
        if (!siteName) siteName = parsed.host;
      }
    }
    if (!siteName) return null;
    const v = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
      siteName: siteName,
      createdAt: typeof raw.createdAt === 'string' ? raw.createdAt
                                                   : new Date().toISOString()
    };
    if (siteUrl) v.siteUrl = siteUrl;
    if (typeof raw.code === 'string' && raw.code.trim()) {
      v.code = raw.code.trim().toUpperCase();
    }
    if (raw.amount !== undefined && raw.amount !== null && raw.amount !== '') {
      const a = parseValueInput(String(raw.amount));
      if (a !== undefined && a !== null) v.amount = a;
    }
    if (typeof raw.expiryDate === 'string' && raw.expiryDate.trim()) {
      const d = parseDateInput(raw.expiryDate.trim());
      if (d) v.expiryDate = d;
    }
    return v;
  }

  exportBtn.addEventListener('click', function() {
    browser.storage.local.get('vouchers').then(function(data) {
      const vouchers = data.vouchers || [];
      const json = buildExportJson(vouchers);
      // test hook: the e2e suite reads the export from this attribute
      // (a real blob download cannot be intercepted headlessly)
      document.documentElement.setAttribute('data-e2e-export', json);
      const blob = new Blob([json], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'bandwagon-vouchers-' + new Date().toISOString().slice(0, 10) + '.json';
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(function() { URL.revokeObjectURL(a.href); }, 1000);
      showStatus(t('exportDone', { n: vouchers.length }), 'success');
    });
  });

  importBtn.addEventListener('click', function() {
    importFileInput.click();
  });

  importFileInput.addEventListener('change', function() {
    const file = importFileInput.files && importFileInput.files[0];
    importFileInput.value = '';
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function() {
      let data;
      try { data = JSON.parse(reader.result); } catch (e) {
        showStatus(t('importErrFile'), 'error');
        return;
      }
      const arr = Array.isArray(data) ? data
                : (data && Array.isArray(data.vouchers) ? data.vouchers : null);
      if (!arr) {
        showStatus(t('importErrFile'), 'error');
        return;
      }
      const imported = arr.map(normalizeImportedVoucher).filter(Boolean);
      if (!imported.length) {
        showStatus(t('importErrSchema'), 'error');
        return;
      }
      Promise.all([browser.storage.local.get('vouchers'), isPro()]).then(function(results) {
        const existing = results[0].vouchers || [];
        const pro = results[1];
        // the freemium gate applies to imports too: an import that would
        // exceed the free limit opens the paywall and imports nothing
        if (!pro && existing.length + imported.length > FREE_LIMIT) {
          renderPaywallTexts();
          showView('view-paywall');
          return;
        }
        const fresh = [];
        let dup = 0;
        imported.forEach(function(v) {
          const isDup = existing.some(e => isDuplicate(e, null, v.siteName, v.code || '')) ||
                        fresh.some(e => isDuplicate(e, null, v.siteName, v.code || ''));
          if (isDup) dup++;
          else fresh.push(v);
        });
        if (!fresh.length) {
          showStatus(t('importAllDup', { n: dup }), 'warning');
          return;
        }
        const all = existing.concat(fresh);
        browser.storage.local.set({ vouchers: all }).then(function() {
          loadVouchers();
          let msg = t('importDone', { n: fresh.length });
          if (dup) msg += ' ' + t('importDup', { n: dup });
          showStatus(msg, 'success');
          fresh.forEach(function(v) { syncWriteVoucher(v); });
        });
      });
    };
    reader.readAsText(file);
  });

  // ---------------------------------------------------------------- views
  const VIEWS = ['view-main', 'view-settings', 'view-help', 'view-changelog',
                 'view-about', 'view-paywall'];

  function showView(id) {
    VIEWS.forEach(function(view) {
      document.getElementById(view).hidden = (view !== id);
    });
    // Move focus into the shown view: on a sub-view the back button,
    // on the main view the menu button (keyboard users must not be
    // left on a control that just became hidden)
    const target = id === 'view-main' ? menuBtn
                   : document.getElementById(id).querySelector('.back-btn');
    if (target) target.focus();
  }

  function openMenu() {
    menuPanel.hidden = false;
    menuBtn.classList.add('open');
    menuBtn.setAttribute('aria-expanded', 'true');
    const first = menuPanel.querySelector('button');
    if (first) first.focus();
  }

  function closeMenu() {
    const hadFocus = menuPanel.contains(document.activeElement);
    menuPanel.hidden = true;
    menuBtn.classList.remove('open');
    menuBtn.setAttribute('aria-expanded', 'false');
    if (hadFocus) menuBtn.focus();
  }

  menuBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    if (menuPanel.hidden) openMenu();
    else closeMenu();
  });

  menuPanel.addEventListener('click', function(e) {
    const btn = e.target.closest('button');
    if (!btn) return;
    closeMenu();
    showView('view-' + btn.id.replace('menu', '').toLowerCase());
  });

  document.querySelectorAll('[data-back]').forEach(function(btn) {
    btn.addEventListener('click', function() {
      showView('view-main');
    });
  });

  // ------------------------------------------------------- freemium gate
  // Texts carrying {n}/{price} are set here (not via data-i18n, which
  // has no params) and re-applied on every language change
  function renderPaywallTexts() {
    paywallText.textContent = t('paywallText', { n: FREE_LIMIT, price: t('price') });
    paywallPayLink.textContent = t('paywallPayLink', { price: t('price') });
    paywallPayLink.href = PAYMENT_URL;
  }

  function updateLimitLine() {
    isPro().then(function(pro) {
      limitLine.hidden = pro;
      if (!pro) limitLineText.textContent = t('limitLine', { n: FREE_LIMIT });
    });
  }

  limitUnlockLink.addEventListener('click', function(e) {
    e.preventDefault();
    renderPaywallTexts();
    showView('view-paywall');
  });

  unlockBtn.addEventListener('click', function() {
    paywallStatus.hidden = true;
    unlockWithCode(unlockCodeInput.value).then(function(ok) {
      if (!ok) {
        paywallStatus.textContent = t('paywallWrongCode');
        paywallStatus.className = 'status-message error';
        paywallStatus.hidden = false;
        return;
      }
      unlockCodeInput.value = '';
      showView('view-main');
      updateLimitLine();
      loadVouchers();
      showStatus(t('paywallUnlocked'), 'success');
    });
  });

  // -------------------------------------------------------------- content
  function buildHelpContent() {
    const frag = document.createDocumentFragment();
    t('helpSections').forEach(function(section) {
      const h = document.createElement('h2');
      h.textContent = section.title;
      frag.appendChild(h);
      if (section.text) {
        const p = document.createElement('p');
        p.textContent = section.text;
        frag.appendChild(p);
      }
      if (section.items && section.items.length) {
        const ul = document.createElement('ul');
        section.items.forEach(function(item) {
          const li = document.createElement('li');
          li.textContent = item;
          ul.appendChild(li);
        });
        frag.appendChild(ul);
      }
    });
    helpContent.replaceChildren(frag);
  }

  function buildChangelogContent() {
    const frag = document.createDocumentFragment();
    t('changelogEntries').forEach(function(entry) {
      const h = document.createElement('h2');
      h.textContent = entry.version;
      frag.appendChild(h);
      if (entry.items && entry.items.length) {
        const ul = document.createElement('ul');
        entry.items.forEach(function(item) {
          const li = document.createElement('li');
          li.textContent = item;
          ul.appendChild(li);
        });
        frag.appendChild(ul);
      }
    });
    changelogContent.replaceChildren(frag);
  }

  function buildAboutContent() {
    const name = buildNode('p', 'about-name', 'bandWagon');
    let version = '';
    try {
      if (browser.runtime && browser.runtime.getManifest) {
        version = browser.runtime.getManifest().version;
      }
    } catch (e) {
      // not running as a real extension (e.g. the e2e test page)
    }
    const versionNode = buildNode('p', 'about-version',
                                  version ? 'Version ' + version : '');
    const tagline = buildNode('p', '', t('aboutTagline'));
    const note = buildNode('p', 'about-note', t('aboutNote'));

    const site = document.createElement('a');
    site.href = 'https://cabon14.com/';
    site.target = '_blank';
    site.rel = 'noopener noreferrer';
    site.className = 'about-site';
    site.textContent = t('aboutSite');
    const siteLine = buildNode('p');
    siteLine.appendChild(buildNode('span', '', t('madeBy')));
    siteLine.appendChild(document.createTextNode(' '));
    siteLine.appendChild(site);

    const support = document.createElement('a');
    support.href = 'mailto:' + t('supportEmail');
    support.className = 'about-site';
    support.textContent = t('supportEmail');
    const supportLine = buildNode('p');
    supportLine.appendChild(buildNode('span', '', t('supportLabel')));
    supportLine.appendChild(document.createTextNode(' '));
    supportLine.appendChild(support);

    const rate = document.createElement('a');
    rate.href = storeRatingUrl();
    rate.target = '_blank';
    rate.rel = 'noopener noreferrer';
    rate.className = 'rate-store';
    rate.textContent = t('rateExtension');
    const rateLine = buildNode('p', 'about-rate');
    rateLine.appendChild(rate);

    const donateTitle = buildNode('h2', '', t('donateTitle'));
    const liberapay = document.createElement('a');
    liberapay.href = DONATION_LIBERAPAY;
    liberapay.target = '_blank';
    liberapay.rel = 'noopener noreferrer';
    liberapay.className = 'donate-liberapay';
    liberapay.textContent = t('donateLiberapay');
    const tipeee = document.createElement('a');
    tipeee.href = currentLang === 'fr' ? DONATION_TIPEEE_FR : DONATION_TIPEEE_EN;
    tipeee.target = '_blank';
    tipeee.rel = 'noopener noreferrer';
    tipeee.className = 'donate-tipeee';
    tipeee.textContent = t('donateTipeee');
    const donateRow = buildNode('div', 'donate-row');
    donateRow.appendChild(liberapay);
    donateRow.appendChild(tipeee);

    aboutContent.replaceChildren(name, versionNode, tagline, note,
                                 siteLine, supportLine, rateLine,
                                 donateTitle, donateRow);
  }

  // Firefox cannot open its native date picker inside an extension popup,
  // so the date is a text field with this custom calendar widget
  let viewYear = new Date().getFullYear();
  let viewMonth = new Date().getMonth();

  // Load settings, vouchers and display
  applyTheme();
  loadSettings();
  loadVouchers();
  updateGhost();

  // Re-render when the voucher list changes from outside this popup
  // (a cross-device sync merge done by the background script)
  if (browser.storage.onChanged) {
    browser.storage.onChanged.addListener(function (changes, area) {
      if (area === 'local' && changes.vouchers) {
        loadVouchers();
      }
    });
  }

  // Show an inline status message (no native dialogs). Warnings and
  // successes are transient: they auto-dismiss and can be clicked away.
  // Errors stay until the next action.
  function showStatus(text, type) {
    clearTimeout(statusTimer);
    statusMessage.textContent = text;
    statusMessage.className = 'status-message' + (type ? ' ' + type : '');
    statusMessage.hidden = false;
    if (type === 'success' || type === 'warning') {
      statusTimer = setTimeout(clearStatus, 4000);
    }
  }

  function clearStatus() {
    clearTimeout(statusTimer);
    statusMessage.hidden = true;
    statusMessage.textContent = '';
    statusMessage.className = 'status-message';
  }

  statusMessage.addEventListener('click', clearStatus);

  // Parse ISO (YYYY-MM-DD) text into an ISO date string,
  // or null when it is not a real calendar date
  function parseDateInput(str) {
    const m = str.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
    if (!m) return null;
    return toISO(+m[1], +m[2], +m[3]);
  }

  // Build an ISO date string, or null when the day/month/year combination
  // does not exist (e.g. February 31st)
  function toISO(year, month, day) {
    const date = new Date(year, month - 1, day);
    if (date.getFullYear() !== year || date.getMonth() !== month - 1 ||
        date.getDate() !== day) {
      return null;
    }
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  // Auto-insert the dashes while typing and keep a grey hint showing the
  // remaining part of the date pattern behind the typed text
  expiryInput.addEventListener('input', function() {
    const digits = expiryInput.value.replace(/\D/g, '').slice(0, 8);
    let formatted = digits.slice(0, 4);
    if (digits.length >= 4) formatted += '-' + digits.slice(4, 6);
    if (digits.length >= 6) formatted += '-' + digits.slice(6);
    expiryInput.value = formatted;
    updateGhost();
  });

  function updateGhost() {
    const value = expiryInput.value;
    if (!value || value.length >= DATE_PATTERN.length) {
      expiryGhost.textContent = '';
      return;
    }
    const typed = document.createElement('span');
    typed.className = 'ghost-typed';
    typed.textContent = value;
    const rest = document.createElement('span');
    rest.className = 'ghost-rest';
    rest.textContent = DATE_PATTERN.slice(value.length);
    expiryGhost.replaceChildren(typed, rest);
  }

  // Parse the optional value field. Returns a positive number
  // rounded to cents, or null when the field is empty; invalid input
  // returns undefined (the caller shows an inline error)
  function parseValueInput(str) {
    if (str === '') return null;
    const parsed = Number.parseFloat(str.replace(',', '.'));
    if (!isFinite(parsed) || parsed <= 0 || parsed > 10000) return undefined;
    return Math.round(parsed * 100) / 100;
  }

  // The currency symbol for amounts, from the Settings (EUR default)
  function currencySymbol() {
    return settings.currency === 'USD' ? '$' : '\u20ac';
  }

  // The value label carries the chosen currency symbol
  function updateValueLabel() {
    document.getElementById('valueLabel').textContent =
        t('valueLabel') + ' (' + currencySymbol() + ')' +
        (currentLang === 'fr' ? ' :' : ':');
  }

  // Format the amount for display ("25 €" / "$25"; French decimal
  // comma)
  function formatAmount(amount) {
    let text = String(amount);
    if (currentLang === 'fr') text = text.replace('.', ',');
    return settings.currency === 'USD' ? '$' + text : text + ' \u20ac';
  }

  // Form submission
  // The add form is collapsed by default: the + button (or an Edit
  // click) opens it; a successful add/update or Cancel collapses it
  // again so the popup stays compact
  function setFormOpen(open) {
    addVoucherForm.hidden = !open;
    addToggleBtn.textContent = open ? '\u2212' : '+';
    addToggleBtn.setAttribute('aria-expanded', String(open));
  }

  addToggleBtn.addEventListener('click', function() {
    setFormOpen(addVoucherForm.hidden); // hidden -> open, open -> close
    saveDraft();
  });

  // The popup is destroyed the moment it loses focus (e.g. switching to
  // the email to copy a voucher code): keep the half-filled form as a
  // draft in storage.local and restore it on the next open
  function saveDraft() {
    browser.storage.local.set({
      draft: {
        siteName: siteNameInput.value,
        siteUrl: siteUrlInput.value,
        code: document.getElementById('voucherCode').value,
        value: valueInput.value,
        date: expiryInput.value,
        editingId: editingId,
        open: !addVoucherForm.hidden
      }
    });
  }

  function clearDraft() {
    browser.storage.local.remove('draft');
  }

  function restoreDraft() {
    browser.storage.local.get(['draft', 'vouchers']).then(function(data) {
      const draft = data.draft;
      if (!draft) return;
      siteNameInput.value = draft.siteName || '';
      siteNameAuto = false;
      siteUrlInput.value = draft.siteUrl || '';
      document.getElementById('voucherCode').value = draft.code || '';
      valueInput.value = draft.value || '';
      expiryInput.value = draft.date || '';
      updateSubmitEnabled();
      updateGhost();
      // Edit mode only if the voucher still exists (it may have been
      // deleted from another device while the popup was closed)
      const stillThere = draft.editingId
          && (data.vouchers || []).some(v => v.id === draft.editingId);
      if (stillThere) {
        editingId = draft.editingId;
        submitBtn.textContent = t('updateVoucher');
        cancelEditBtn.hidden = false;
      }
      if (draft.siteName || draft.siteUrl || draft.code || draft.value
          || draft.date || stillThere || draft.open) {
        setFormOpen(true);
      }
    });
  }

  ['siteName', 'siteUrl', 'voucherCode', 'voucherValue', 'expiryDate'].forEach(function(id) {
    document.getElementById(id).addEventListener('input', saveDraft);
  });
  restoreDraft();

  addVoucherForm.addEventListener('submit', function(e) {
    e.preventDefault();

    const siteName = siteNameInput.value.trim();
    const typedUrl = siteUrlInput.value.trim();
    const site = typedUrl ? parseSiteUrl(typedUrl) : null;
    const code = document.getElementById('voucherCode').value.trim().toUpperCase();
    const rawDate = expiryInput.value.trim();
    const amount = parseValueInput(valueInput.value.trim());

    if (typedUrl && !site) {
      showStatus(t('errSiteUrl'), 'error');
      return;
    }

    if (!siteName) {
      showStatus(t('errFillRequired'), 'error');
      return;
    }

    if (amount === undefined) {
      showStatus(t('errValue'), 'error');
      return;
    }

    const expiryDate = rawDate ? parseDateInput(rawDate) : null;
    if (rawDate && !expiryDate) {
      showStatus(t('errValidDate'), 'error');
      return;
    }

    // A voucher that expires today is still valid, anything earlier is not
    const now = new Date();
    const today = toISO(now.getFullYear(), now.getMonth() + 1, now.getDate());
    if (expiryDate && expiryDate < today) {
      showStatus(t('errPastDate'), 'error');
      return;
    }

    Promise.all([browser.storage.local.get('vouchers'), isPro()]).then(function(results) {
      const data = results[0];
      const pro = results[1];
      const vouchers = data.vouchers || [];

      if (editingId) {
        // Update the edited voucher (its own code doesn't count as duplicate)
        const duplicate = vouchers.some(v => v.id !== editingId &&
                                              isDuplicate(v, site, siteName, code));
        if (duplicate) {
          showStatus(t('errDuplicate'), 'error');
          return;
        }
        const edited = vouchers.find(v => v.id === editingId);
        if (!edited) {
          cancelEdit();
          return;
        }
        edited.siteName = siteName;
        if (site) edited.siteUrl = site.url;
        else delete edited.siteUrl;
        if (code) edited.code = code;
        else delete edited.code;
        if (expiryDate) edited.expiryDate = expiryDate;
        else delete edited.expiryDate;
        if (amount === null) delete edited.amount;
        else edited.amount = amount;
        vouchers.sort((a, b) => expiryKey(a) - expiryKey(b));
        browser.storage.local.set({ vouchers: vouchers }).then(function() {
          cancelEdit();
          loadVouchers();
          showStatus(t('statusUpdated'), 'success');
          syncWriteVoucher(edited);
        });
        return;      }

      // Add new voucher

      // Freemium gate (docs/monetization.md): the free tier stops at
      // FREE_LIMIT vouchers — editing an existing one is never gated
      if (!pro && vouchers.length >= FREE_LIMIT) {
        renderPaywallTexts();
        showView('view-paywall');
        return;
      }

      // Check for duplicate (same code on the same site)
      const exists = vouchers.some(v => isDuplicate(v, site, siteName, code));
      if (exists) {
        showStatus(t('errDuplicate'), 'error');
        return;
      }

      const newVoucher = {
        id: Date.now().toString(),
        siteName: siteName,
        createdAt: new Date().toISOString()
      };
      // The URL, code and value are all optional: vouchers without
      // them carry no key
      if (site) newVoucher.siteUrl = site.url;
      if (expiryDate) newVoucher.expiryDate = expiryDate;
      if (code) newVoucher.code = code;
      if (amount !== null) newVoucher.amount = amount;

      vouchers.push(newVoucher);

      // Sort by expiry date (oldest first)
      vouchers.sort((a, b) => expiryKey(a) - expiryKey(b));

      browser.storage.local.set({ vouchers: vouchers }).then(function() {
        clearStatus();
        addVoucherForm.reset();
        closeCalendar();
        addVoucherForm.reset(); // next open starts a clean form
        updateSubmitEnabled();
        updateGhost();
        setFormOpen(false); // added: back to the compact list view
        clearDraft(); // submitted: nothing to restore next time
        loadVouchers();
        syncWriteVoucher(newVoucher);
      });
    });
  });

  // Normalize a user-typed site URL: the scheme is optional, the host
  // is lowercased and a leading "www." is ignored so that two entries
  // for the same site match (see docs/data-model.md). Returns null for
  // anything that does not parse as an http(s) URL.
  function parseSiteUrl(input) {
    const withScheme = /^[a-z][a-z0-9+.-]*:\/\//i.test(input)
        ? input : 'https://' + input;
    try {
      const parsed = new URL(withScheme);
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        return null;
      }
      const host = parsed.hostname.toLowerCase().replace(/^www\./, '');
      if (!host || host.indexOf('.') < 0) return null;
      let url = parsed.protocol + '//' + parsed.hostname.toLowerCase();
      if (parsed.pathname && parsed.pathname !== '/') url += parsed.pathname;
      if (parsed.search) url += parsed.search;
      return { url: url, host: host };
    } catch (e) {
      return null;
    }
  }

  // Matching key of a stored siteUrl (same normalization as parseSiteUrl)
  function siteHost(siteUrl) {
    try {
      return new URL(siteUrl).hostname.toLowerCase().replace(/^www\./, '');
    } catch (e) {
      return '';
    }
  }

  // Two vouchers collide only when they carry the same code for the
  // same site: a code is unique within a site, not across sites
  // Duplicates key on the URL host when a URL is given, otherwise on
  // the site name (URL-less vouchers never collide with URL'd ones)
  function isDuplicate(voucher, site, siteName, code) {
    if (!code || !voucher.code) return false;
    if (voucher.code !== code) return false;
    if (site) return siteHost(voucher.siteUrl) === site.host;
    return !voucher.siteUrl &&
           (voucher.siteName || '').toLowerCase() === siteName.toLowerCase();
  }

  // Editing: load a voucher into the form, or leave edit mode
  function startEdit(id) {
    browser.storage.local.get('vouchers').then(function(data) {
      const voucher = (data.vouchers || []).find(v => v.id === id);
      if (!voucher) return;
      editingId = id;
      siteNameInput.value = voucher.siteName || '';
      siteNameAuto = false;
      siteUrlInput.value = voucher.siteUrl || '';
      document.getElementById('voucherCode').value = voucher.code || '';
      valueInput.value = (voucher.amount !== undefined && voucher.amount !== null)
          ? String(voucher.amount) : '';
      expiryInput.value = voucher.expiryDate || '';
      updateSubmitEnabled();
      updateGhost();
      submitBtn.textContent = t('updateVoucher');
      cancelEditBtn.hidden = false;
      setFormOpen(true); // editing needs the form in view
      saveDraft();
      document.getElementById('voucherCode').focus();
    });
  }

  function cancelEdit() {
    editingId = null;
    addVoucherForm.reset();
    updateSubmitEnabled();
    updateGhost();
    submitBtn.textContent = t('addVoucher');
    cancelEditBtn.hidden = true;
    clearStatus();
    setFormOpen(false); // done editing: back to the compact list view
    clearDraft(); // abandoned: nothing to restore next time
  }

  cancelEditBtn.addEventListener('click', cancelEdit);

  voucherList.addEventListener('click', function(e) {
    const btn = e.target.closest('.edit-btn');
    if (!btn) return;
    startEdit(btn.dataset.id);
  });

  // Load vouchers from storage, applying the remembered sort order
  function loadVouchers() {
    browser.storage.local.get(['vouchers', 'sortOrder']).then(function(data) {
      sortSelect.value =
          (data.sortOrder === 'code' || data.sortOrder === 'value')
              ? data.sortOrder : 'date';
      renderVouchers(data.vouchers || []);
    });
  }

  sortSelect.addEventListener('change', function() {
    browser.storage.local.set({ sortOrder: sortSelect.value }).then(loadVouchers);
  });

  // Create an element with optional class and text
  function buildNode(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  // Render the month grid of the calendar widget
  function renderCalendar() {
    calendarPanel.replaceChildren();

    const header = buildNode('div', 'calendar-header');
    const prevBtn = buildNode('button', 'calendar-nav', '\u2039');
    const nextBtn = buildNode('button', 'calendar-nav', '\u203A');
    prevBtn.type = 'button';
    nextBtn.type = 'button';
    prevBtn.title = t('prevMonth');
    prevBtn.setAttribute('aria-label', t('prevMonth'));
    nextBtn.title = t('nextMonth');
    nextBtn.setAttribute('aria-label', t('nextMonth'));
    const title = buildNode('span', 'calendar-title',
                            t('months')[viewMonth] + ' ' + viewYear);
    header.appendChild(prevBtn);
    header.appendChild(title);
    header.appendChild(nextBtn);
    calendarPanel.appendChild(header);

    const grid = buildNode('div', 'calendar-grid');
    t('weekdays').forEach(function(weekday) {
      grid.appendChild(buildNode('span', 'calendar-weekday', weekday));
    });

    // Blank cells before the first day (Monday-first grid)
    const startCol = (new Date(viewYear, viewMonth, 1).getDay() + 6) % 7;
    for (let i = 0; i < startCol; i++) {
      grid.appendChild(buildNode('span', 'calendar-blank'));
    }

    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const selected = parseDateInput(expiryInput.value.trim());
    const now = new Date();
    const todayISO = toISO(now.getFullYear(), now.getMonth() + 1, now.getDate());
    for (let day = 1; day <= daysInMonth; day++) {
      const iso = toISO(viewYear, viewMonth + 1, day);
      const dayBtn = buildNode('button', 'calendar-day', String(day));
      dayBtn.type = 'button';
      dayBtn.dataset.date = iso;
      dayBtn.setAttribute('aria-label',
        day + ' ' + t('months')[viewMonth] + ' ' + viewYear);
      if (iso === selected) dayBtn.classList.add('selected');
      if (iso === todayISO) dayBtn.classList.add('today');
      // Past days cannot be picked (a voucher expiring today is allowed)
      if (iso < todayISO) dayBtn.disabled = true;
      grid.appendChild(dayBtn);
    }
    calendarPanel.appendChild(grid);

    prevBtn.addEventListener('click', function() {
      viewMonth--;
      if (viewMonth < 0) { viewMonth = 11; viewYear--; }
      renderCalendar();
    });
    nextBtn.addEventListener('click', function() {
      viewMonth++;
      if (viewMonth > 11) { viewMonth = 0; viewYear++; }
      renderCalendar();
    });

    grid.addEventListener('click', function(e) {
      const dayBtn = e.target.closest('.calendar-day');
      if (!dayBtn) return;
      const picked = new Date(dayBtn.dataset.date + 'T00:00:00');
      expiryInput.value = formatDate(picked);
      updateGhost();
      saveDraft(); // programmatic value change fires no input event
      closeCalendar();
      calendarBtn.focus();
    });
    // Arrow keys move between the enabled days of the month grid
    grid.addEventListener('keydown', function(e) {
      const step = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[e.key];
      if (!step) return;
      const cur = e.target.closest('.calendar-day');
      if (!cur) return;
      e.preventDefault();
      const days = Array.from(grid.querySelectorAll('.calendar-day:not(:disabled)'));
      const next = days[days.indexOf(cur) + step];
      if (next) next.focus();
    });
  }

  function openCalendar() {
    const parsed = parseDateInput(expiryInput.value.trim());
    if (parsed) {
      const current = new Date(parsed + 'T00:00:00');
      viewYear = current.getFullYear();
      viewMonth = current.getMonth();
    } else {
      const now = new Date();
      viewYear = now.getFullYear();
      viewMonth = now.getMonth();
    }
    renderCalendar();
    calendarPanel.hidden = false;
  }

  function closeCalendar() {
    calendarPanel.hidden = true;
  }

  calendarBtn.addEventListener('click', function() {
    if (calendarPanel.hidden) {
      openCalendar();
    } else {
      closeCalendar();
    }
  });

  // Close the calendar and the menu when clicking elsewhere in the popup
  // or pressing Escape
  document.addEventListener('click', function(e) {
    if (!calendarPanel.hidden && !calendarPanel.contains(e.target) &&
        !calendarBtn.contains(e.target)) {
      closeCalendar();
    }
    if (!menuPanel.hidden && !menuPanel.contains(e.target) &&
        !menuBtn.contains(e.target)) {
      closeMenu();
    }
  });
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      closeCalendar();
      closeMenu();
      // Escape on a sub-view also goes back to the main view
      const visible = VIEWS.find(function(v) {
        return !document.getElementById(v).hidden;
      });
      if (visible && visible !== 'view-main') showView('view-main');
    }
  });

  // Render vouchers in the list, sorted by date, code or value
  function renderVouchers(vouchers) {
    const sorted = vouchers.slice();
    if (sortSelect.value === 'code') {
      sorted.sort((a, b) => (a.code || '').localeCompare(b.code || ''));
    } else if (sortSelect.value === 'value') {
      // Highest amount first; vouchers without a value last, ties
      // broken by the earliest expiry date
      sorted.sort((a, b) => {
        const av = (a.amount === undefined || a.amount === null) ? -1 : a.amount;
        const bv = (b.amount === undefined || b.amount === null) ? -1 : b.amount;
        if (av !== bv) return bv - av;
        return expiryKey(a) - expiryKey(b);
      });
    } else {
      sorted.sort((a, b) => expiryKey(a) - expiryKey(b));
    }

    if (sorted.length === 0) {
      voucherList.replaceChildren(buildNode('p', 'empty-message', t('emptyMessage')));
      totalVouchersSpan.textContent = '0';
      validVouchersSpan.textContent = '0';
      validValueSpan.textContent = '0';
      removeExpiredBtn.hidden = true;
      updateSiteList([]);
      return;
    }

    const now = new Date();
    now.setHours(0, 0, 0, 0); // Normalize to start of day

    let validCount = 0;
    let expiredCount = 0;
    let validValue = 0;
    const frag = document.createDocumentFragment();

    sorted.forEach(function(voucher) {
      // Parse as local midnight: a date-only string would be read as UTC
      // and make a voucher expiring today look already expired depending
      // on the timezone
      // No expiry date: the voucher is valid indefinitely
      const expiryDate = voucher.expiryDate
          ? new Date(voucher.expiryDate + 'T00:00:00') : null;
      const isValid = !voucher.expiryDate || expiryDate >= now;

      if (isValid) {
        validCount++;
        if (voucher.amount !== undefined && voucher.amount !== null) {
          validValue += voucher.amount;
        }
      } else {
        expiredCount++;
      }

      const info = buildNode('div');
      // No URL (a local merchant): a plain label, not a link
      const siteLine = document.createElement(voucher.siteUrl ? 'a' : 'span');
      if (voucher.siteUrl) {
        siteLine.href = voucher.siteUrl;
        siteLine.target = '_blank';
        siteLine.rel = 'noopener noreferrer';
      }
      siteLine.className = 'site-name';
      siteLine.textContent = voucher.siteName || voucher.siteUrl || '';
      info.appendChild(siteLine);
      if (voucher.code) {
        info.appendChild(buildNode('div', 'code', voucher.code));
      }
      if (voucher.amount !== undefined && voucher.amount !== null) {
        info.appendChild(buildNode('div', 'amount',
                                  formatAmount(voucher.amount)));
      }
      if (expiryDate) {
        info.appendChild(buildNode('div', 'expiry',
                                  t('expiresPrefix') + formatDate(expiryDate) +
                                  (isValid ? '' : ' (' + t('expiredBadge') + ')')));
      }

      const editBtn = buildNode('button', 'btn btn-secondary edit-btn', t('edit'));
      editBtn.dataset.id = voucher.id;

      const deleteBtn = buildNode('button', 'btn btn-danger delete-btn', t('del'));
      deleteBtn.dataset.id = voucher.id;

      const actions = buildNode('div', 'actions');
      actions.appendChild(editBtn);
      actions.appendChild(deleteBtn);

      const item = buildNode('div', 'voucher-item ' + (isValid ? 'valid' : 'expired'));
      item.appendChild(info);
      item.appendChild(actions);
      frag.appendChild(item);
    });

    voucherList.replaceChildren(frag);
    totalVouchersSpan.textContent = vouchers.length;
    validVouchersSpan.textContent = validCount;
    let valueText = String(Math.round(validValue * 100) / 100);
    if (currentLang === 'fr') valueText = valueText.replace('.', ',');
    validValueSpan.textContent = valueText;

    // The bulk-clear action only makes sense when an expired voucher exists
    removeExpiredBtn.hidden = expiredCount === 0;
    if (removeExpiredBtn.hidden) resetRemoveExpiredBtn();

    // Refresh the site autocomplete with the current list
    updateSiteList(sorted);
  }

  // Autocomplete for the site field: the distinct known sites (the
  // datalist matches on the site name and shows the URL as a hint)
  function updateSiteList(vouchers) {
    const seen = new Set();
    const frag = document.createDocumentFragment();
    knownSiteNames = {};
    vouchers.forEach(function(voucher) {
      if (!voucher.siteName) return;
      const host = voucher.siteUrl ? siteHost(voucher.siteUrl) : null;
      if (host && knownSiteNames[host] === undefined) {
        knownSiteNames[host] = voucher.siteName;
      }
      if (seen.has(voucher.siteName)) return;
      seen.add(voucher.siteName);
      const opt = document.createElement('option');
      opt.value = voucher.siteName;
      opt.label = voucher.siteUrl || '';
      frag.appendChild(opt);
    });
    siteList.replaceChildren(frag);
  }

  // Readable name for a hostname: 'deduced-shop.fr' -> 'Deduced Shop'.
  // The label before the TLD is used, stepping over second-level
  // registry suffixes like co.uk (the www prefix is already gone)
  function prettyHost(host) {
    const labels = host.split('.');
    let idx = labels.length - 2;
    if (labels.length >= 3 &&
        ['co', 'com', 'org', 'net', 'gov', 'ac'].indexOf(labels[idx]) >= 0) {
      idx = labels.length - 3;
    }
    const label = labels[idx] || host;
    return label.split(/[-.]/).map(function(word) {
      return word ? word.charAt(0).toUpperCase() + word.slice(1) : '';
    }).join(' ');
  }

  // URL-first: typing the URL prefills the site name, reusing the
  // name already used for that host; a hand-typed name always wins
  siteUrlInput.addEventListener('input', function() {
    const typed = siteUrlInput.value.trim();
    const site = typed ? parseSiteUrl(typed) : null;
    if (!site) return;
    if (siteNameInput.value.trim() !== '' && !siteNameAuto) return;
    siteNameInput.value = knownSiteNames[site.host] || prettyHost(site.host);
    siteNameAuto = true;
    updateSubmitEnabled();
  });

  siteNameInput.addEventListener('input', function() {
    siteNameAuto = false;
  });

  // The site name is the only required field: the submit button
  // stays greyed out until something identifies the voucher
  function updateSubmitEnabled() {
    submitBtn.disabled = siteNameInput.value.trim() === '';
  }

  siteNameInput.addEventListener('input', updateSubmitEnabled);

  // Expiry sort key: vouchers without an expiry date (valid
  // indefinitely) sort last
  function expiryKey(v) {
    return v.expiryDate
        ? new Date(v.expiryDate + 'T00:00:00').getTime() : Infinity;
  }

  // Delete is a two-step action: first click arms the button,
  // a second click within a few seconds confirms
  voucherList.addEventListener('click', function(e) {
    const btn = e.target.closest('.delete-btn');
    if (!btn) return;

    if (btn.classList.contains('confirm')) {
      deleteVoucher(btn.dataset.id);
      return;
    }

    voucherList.querySelectorAll('.delete-btn.confirm').forEach(resetDeleteBtn);
    btn.classList.add('confirm');
    btn.textContent = t('confirmQuestion');
    setTimeout(function() { resetDeleteBtn(btn); }, 4000);
  });

  function resetDeleteBtn(btn) {
    btn.classList.remove('confirm');
    btn.textContent = t('del');
  }

  // Delete a voucher
  function deleteVoucher(id) {
    browser.storage.local.get('vouchers').then(function(data) {
      const vouchers = data.vouchers || [];
      const updatedVouchers = vouchers.filter(v => v.id !== id);

      browser.storage.local.set({ vouchers: updatedVouchers }).then(function() {
        loadVouchers();
        syncWriteVoucher({ id: id }, true);
      });
    });
  }

  // Remove expired uses the same two-step confirm as the single delete
  removeExpiredBtn.addEventListener('click', function() {
    if (removeExpiredBtn.classList.contains('confirm')) {
      resetRemoveExpiredBtn();
      removeExpiredVouchers();
      return;
    }

    removeExpiredBtn.classList.add('confirm');
    removeExpiredBtn.textContent = t('confirmQuestion');
    setTimeout(function() { resetRemoveExpiredBtn(); }, 4000);
  });

  function resetRemoveExpiredBtn() {
    removeExpiredBtn.classList.remove('confirm');
    removeExpiredBtn.textContent = t('removeExpired');
  }

  // Delete every expired voucher; each deletion is mirrored to the sync
  // area as a tombstone, exactly like a single delete
  function removeExpiredVouchers() {
    browser.storage.local.get('vouchers').then(function(data) {
      const vouchers = data.vouchers || [];
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      const expired = vouchers.filter(v => new Date(v.expiryDate + 'T00:00:00') < now);
      if (expired.length === 0) return;

      const expiredIds = {};
      expired.forEach(function(v) { expiredIds[v.id] = true; });
      const updatedVouchers = vouchers.filter(v => !expiredIds[v.id]);

      browser.storage.local.set({ vouchers: updatedVouchers }).then(function() {
        if (editingId && expiredIds[editingId]) cancelEdit();
        loadVouchers();
        showStatus(expired.length === 1 ? t('removedExpiredOne')
                                        : t('removedExpiredMany', { n: expired.length }),
                   'success');
        expired.forEach(function(v) { syncWriteVoucher({ id: v.id }, true); });
      });
    });
  }

  // Format date as ISO YYYY-MM-DD
  function formatDate(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
  }
});
