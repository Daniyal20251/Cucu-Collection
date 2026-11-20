/* Cucu Collection — PWA: service worker + professional "Install app" card
   - Service worker har page par register hota hai (offline + fast load)
   - Install card SIRF home (index.html / store) par dikhta hai
   - Cross (×) ya native "Cancel" dabane ke baad card us visit me dobara nahi aata,
    lekin site band karke dobara kholne par WAPIS aata hai
   - In-app browsers (Facebook, Instagram, TikTok, WebView) me card nahi dikhta,
     kyun ke wahan install ho hi nahi sakta */
(function () {
  'use strict';

  /* ---------- Service worker ---------- */
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('/sw.js').catch(function () {});
    });
  }

  /* ---------- Storage helpers (multi-layer) ---------- */
  var KEY = 'cucuInstallDismissed';
  var DONE = 'cucuInstalled';
  var ICON = 'icon-192.png';
  var KEEP_MS = 365 * 24 * 3600 * 1000;           // cancel ke baad 1 saal tak dobara nahi

  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function ckGet(k) {
    try {
      var m = document.cookie.match(new RegExp('(?:^|;\\s*)' + k + '=([^;]*)'));
      return m ? decodeURIComponent(m[1]) : null;
    } catch (e) { return null; }
  }
  function ckSet(k, v) {
    try {
      document.cookie = k + '=' + encodeURIComponent(v) + ';max-age=' + Math.floor(KEEP_MS / 1000) +
        ';path=/;SameSite=Lax' + (location.protocol === 'https:' ? ';Secure' : '');
    } catch (e) {}
  }
  function wnHas(k) { try { return String(window.name || '').indexOf(k + '=1') !== -1; } catch (e) { return false; } }
  function wnSet(k) { try { if (!wnHas(k)) window.name = (window.name ? window.name + ';' : '') + k + '=1'; } catch (e) {} }

  /* Cross (×) / Cancel: sirf is visit ke liye chhupata hai (sessionStorage).
     Site band kar ke dobara kholne par card phir se aata hai.
     Sirf app INSTALL hone ke baad card permanently band hota hai. */
  function ssGet(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } }
  function ssSet(k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} }
  var dismissedNow = false;                       // memory fallback agar sessionStorage na ho

  function markDismissed() { dismissedNow = true; ssSet(KEY, '1'); }
  function markInstalled() { lsSet(DONE, '1'); ckSet(DONE, '1'); wnSet(DONE); }
  function isBlocked() {
    if (dismissedNow || ssGet(KEY) === '1') return true;
    return lsGet(DONE) === '1' || ckGet(DONE) === '1' || wnHas(DONE);
  }

  /* ---------- Environment checks ---------- */
  var standalone = (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) ||
    window.navigator.standalone === true;
  if (standalone) { markInstalled(); return; }

  var path = decodeURIComponent(location.pathname).toLowerCase();
  var isHome = path === '/' || /\/index\.html$/.test(path);
  if (!isHome) return;

  var ua = navigator.userAgent || '';
  var inApp = /FBAN|FBAV|FB_IAB|Instagram|Line\/|MicroMessenger|TikTok|musical_ly|Snapchat|; wv\)/i.test(ua);
  if (inApp) return;

  var isIOS = /iphone|ipad|ipod/i.test(ua) && !/crios|fxios|edgios|opios/i.test(ua);

  /* ---------- UI ---------- */
  function injectStyle() {
    if (document.getElementById('cucuInstallStyle')) return;
    var st = document.createElement('style');
    st.id = 'cucuInstallStyle';
    st.textContent =
      '#cucuInstallCard{position:fixed;left:12px;right:12px;bottom:calc(96px + env(safe-area-inset-bottom,0px));z-index:100000;' +
      'max-width:420px;margin:0 auto;display:flex;align-items:center;gap:12px;padding:12px;border-radius:18px;' +
      'background:var(--card-bg,#fff);color:var(--text-dark,#1f2126);border:1px solid var(--border,#e6e6e6);' +
      'box-shadow:0 12px 36px rgba(0,0,0,.22);font-family:Nunito,system-ui,-apple-system,"Segoe UI",sans-serif;' +
      'transform:translateY(24px);opacity:0;animation:cucuInstallIn .45s cubic-bezier(.22,1,.36,1) forwards}' +
      '@keyframes cucuInstallIn{to{transform:translateY(0);opacity:1}}' +
      '#cucuInstallCard .ci-icon{width:46px;height:46px;border-radius:12px;flex-shrink:0;object-fit:cover;box-shadow:0 2px 8px rgba(0,0,0,.18)}' +
      '#cucuInstallCard .ci-text{flex:1;min-width:0}' +
      '#cucuInstallCard .ci-title{font-size:14px;font-weight:800;line-height:1.2;margin:0}' +
      '#cucuInstallCard .ci-sub{font-size:11.5px;font-weight:600;line-height:1.35;margin:3px 0 0;color:var(--text-mid,#666)}' +
      '#cucuInstallCard .ci-actions{display:flex;align-items:center;gap:4px;flex-shrink:0}' +
      '#cucuInstallCard .ci-btn{border:0;border-radius:999px;padding:10px 18px;font:800 12px Nunito,system-ui,sans-serif;cursor:pointer;' +
      'background:var(--primary-dark,#2b2d33);color:#fff;letter-spacing:.2px;min-height:40px}' +
      '#cucuInstallCard .ci-btn:active{transform:scale(.96)}' +
      '#cucuInstallCard .ci-close{border:0;background:transparent;color:var(--text-light,#999);font-size:24px;line-height:1;' +
      'width:40px;height:40px;display:flex;align-items:center;justify-content:center;cursor:pointer;border-radius:50%}' +
      '#cucuInstallCard .ci-close:hover{background:rgba(127,127,127,.15)}' +
      '@media (min-width:900px){#cucuInstallCard{left:auto;right:24px;bottom:24px;margin:0;width:380px}}' +
      '@media (prefers-reduced-motion:reduce){#cucuInstallCard{animation-duration:.01s}}';
    document.head.appendChild(st);
  }

  function showCard(subtitle, onTap, tapLabel) {
    if (document.getElementById('cucuInstallCard') || isBlocked() || !document.body) return;
    injectStyle();

    var card = document.createElement('div');
    card.id = 'cucuInstallCard';
    card.setAttribute('role', 'dialog');
    card.setAttribute('aria-label', 'Install Cucu Collection app');

    var img = document.createElement('img');
    img.className = 'ci-icon'; img.src = ICON; img.alt = 'Cucu Collection';
    card.appendChild(img);

    var txt = document.createElement('div'); txt.className = 'ci-text';
    var t = document.createElement('p'); t.className = 'ci-title'; t.textContent = 'Cucu Collection';
    var sub = document.createElement('p'); sub.className = 'ci-sub'; sub.textContent = subtitle;
    txt.appendChild(t); txt.appendChild(sub); card.appendChild(txt);

    var actions = document.createElement('div'); actions.className = 'ci-actions';
    if (onTap) {
      var go = document.createElement('button');
      go.className = 'ci-btn'; go.type = 'button'; go.textContent = tapLabel;
      go.onclick = function () { card.remove(); onTap(); };
      actions.appendChild(go);
    }
    var x = document.createElement('button');
    x.className = 'ci-close'; x.type = 'button';
    x.setAttribute('aria-label', 'Close'); x.textContent = '\u00d7';
    x.onclick = function () { markDismissed(); card.remove(); };
    actions.appendChild(x);
    card.appendChild(actions);
    document.body.appendChild(card);
  }

  /* ---------- Android / Chrome / Edge / Samsung ---------- */
  var deferred = null, shown = false;
  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    if (isBlocked()) return;                       // pehle cancel kiya tha → kuch nahi dikhana
    deferred = e;
    var open = function () {
      if (shown || isBlocked()) return;
      shown = true;
      showCard('Install our app for faster shopping and exclusive offers', function () {
        if (!deferred) return;
        var d = deferred; deferred = null;
        d.prompt();
        if (d.userChoice && d.userChoice.then) {
          d.userChoice.then(function (c) {
            if (c && c.outcome === 'accepted') markInstalled(); else markDismissed();
          }).catch(function () { markDismissed(); });
        }
      }, 'Install');
    };
    if (document.readyState === 'complete') setTimeout(open, 2500);
    else window.addEventListener('load', function () { setTimeout(open, 2500); });
  });
  window.addEventListener('appinstalled', function () {
    markInstalled();
    var b = document.getElementById('cucuInstallCard');
    if (b) b.remove();
  });

  /* ---------- iPhone Safari: sirf hint ---------- */
  if (isIOS) {
    window.addEventListener('load', function () {
      setTimeout(function () {
        showCard('Tap Share, then "Add to Home Screen" to install the app', null, '');
      }, 3000);
    });
  }

  /* Manual trigger (e.g. Settings page me "Install app" button) */
  window.CucuInstall = {
    available: function () { return !!deferred; },
    prompt: function () {
      if (!deferred) return false;
      var d = deferred; deferred = null; d.prompt(); return true;
    }
  };
})();
