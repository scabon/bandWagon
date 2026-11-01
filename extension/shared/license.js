// Freemium gate (see docs/monetization.md): the free tier keeps up to
// FREE_LIMIT vouchers; a one-time payment unlocks unlimited entries.
// The unlock code is static and rotating — regenerate it if it leaks
// publicly (accepted risk, the extension is user-editable JS anyway).
// The payment page is opened in a normal tab: the extension itself
// still requests no network access and sends nothing anywhere.
const FREE_LIMIT = 10;
const UNLOCK_CODE = 'WAGON-1EUR-2026';
const PAYMENT_URL = 'https://cabon14.com/bandwagon-unlock.html';

async function getLicense() {
  const data = await browser.storage.local.get('license');
  return data.license || null;
}

async function isPro() {
  const license = await getLicense();
  return !!(license && license.unlocked);
}

// Checks a code typed by the user and, when it matches, stores the
// license (the raw code is kept so a future verification scheme can
// re-check it). Returns true when the extension is now unlocked.
async function unlockWithCode(rawCode) {
  const code = String(rawCode || '').trim().toUpperCase();
  if (code !== UNLOCK_CODE) return false;
  await browser.storage.local.set({
    license: { unlocked: true, code: code, unlockedAt: new Date().toISOString() }
  });
  return true;
}
