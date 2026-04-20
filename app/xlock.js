// ====================== XLOCK CLIENT CHECKER ======================
// Paste this in any protected website
const XLOCK = {
  API: "https://xsafe.stakemail91.workers.dev",
  CACHE_KEY: "xlock_cache",
  CACHE_TTL: 5 * 60 * 1000, // 5 minutes

  async validate(licenseKey) {
    // Check cache
    const cached = localStorage.getItem(this.CACHE_KEY);
    if (cached && Date.now() - JSON.parse(cached).timestamp < this.CACHE_TTL) {
      return true;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    try {
      const res = await fetch(this.API + '/verify', {
        method: 'POST',
        signal: controller.signal,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: licenseKey,
          // domain is auto-detected by Origin header
        })
      });

      clearTimeout(timeout);
      const json = await res.json();

      if (json.success) {
        localStorage.setItem(this.CACHE_KEY, JSON.stringify({ timestamp: Date.now() }));
        return true;
      } else {
        this.showLockScreen(json.message);
        return false;
      }
    } catch (e) {
      console.error("XLock network error");
      this.showLockScreen("License validation failed – network error");
      return false;
    }
  },

  showLockScreen(message) {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position:fixed;inset:0;background:linear-gradient(135deg,#0a0a0a,#1a1a2e);
      display:flex;align-items:center;justify-content:center;z-index:99999;
      color:white;font-family:system-ui`;
    overlay.innerHTML = `
      <div class="text-center max-w-md mx-6">
        <div class="text-7xl mb-6">🔒</div>
        <h1 class="text-4xl font-bold mb-4">License Blocked</h1>
        <p class="text-xl mb-8">${message}</p>
        <p class="text-zinc-400">Contact the website owner for a valid license.</p>
      </div>`;
    document.body.appendChild(overlay);
  }
};

// Auto-run example (uncomment if you want automatic check)
// window.addEventListener('load', () => {
//   const KEY = "YOUR-LICENSE-KEY-HERE";   // ← replace
//   XLOCK.validate(KEY);
// });

window.XLOCK = XLOCK;   // Global export
