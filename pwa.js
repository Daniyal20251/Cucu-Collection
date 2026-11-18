/* Cucu Collection — PWA: service worker + professional "Install app" card
   - Service worker har page par register hota hai (offline + fast load)
   - Install card SIRF home (index.html / store) par dikhta hai, baqi pages par nahi */
(function () {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('/sw.js').catch(function () {});
    });
  }

  var standalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  if (standalone) return;

  var path = location.pathname.toLowerCase();
  var isHome = path === '/' || path.endsWith('/index.html');
  if (!isHome) return;

  var KEY = 'cucuInstallDismissed';
  var DONE = 'cucuInstalled';
  var ICON = 'icon-192.png';

  function dismissedRecently() {
    try {
      if (localStorage.getItem(DONE) === '1') return true;
      return Date.now() - Number(localStorage.getItem(KEY) || 0) < 7 * 24 * 3600 * 1000;
    } catch (e) { return false; }
  }
  function remember() { try { localStorage.setItem(KEY, String(Date.now())); } catch (e) {} }

  function injectStyle() {
    if (document.getElementById('cucuInstallStyle')) return;
    var st = document.createElement('style');
    st.id = 'cucuInstallStyle';
    st.textContent =
      '#cucuInstallCard{position:fixed;left:12px;right:12px;bottom:96px;z-index:100000;max-width:420px;margin:0 auto;' +
      'display:flex;align-items:center;gap:12px;padding:12px 12px 12px 12px;border-radius:18px;' +
      'background:var(--card-bg,#fff);color:var(--text-dark,#1f2126);border:1px solid var(--border,#e6e6e6);' +
      'box-shadow:0 12px 36px rgba(0,0,0,.22);font-family:Nunito,system-ui,-apple-system,Segoe UI,sans-serif;' +
      'transform:translateY(24px);opacity:0;animation:cucuInstallIn .45s cubic-bezier(.22,1,.36,1) forwards}' +
      '@keyframes cucuInstallIn{to{transform:translateY(0);opacity:1}}' +
      '#cucuInstallCard .ci-icon{width:46px;height:46px;border-radius:12px;flex-shrink:0;object-fit:cover;box-shadow:0 2px 8px rgba(0,0,0,.18)}' +
      '#cucuInstallCard .ci-text{flex:1;min-width:0}' +
      '#cucuInstallCard .ci-title{font-size:14px;font-weight:800;line-height:1.2;margin:0}' +
      '#cucuInstallCard .ci-sub{font-size:11.5px;font-weight:600;line-height:1.35;margin:3px 0 0;color:var(--text-mid,#666)}' +
      '#cucuInstallCard .ci-actions{display:flex;align-items:center;gap:6px;flex-shrink:0}' +
      '#cucuInstallCard .ci-btn{border:0;border-radius:999px;padding:9px 16px;font:800 12px Nunito,system-ui,sans-serif;cursor:pointer;' +
      'background:var(--primary-dark,#2b2d33);color:#fff;letter-spacing:.2px}' +
      '#cucuInstallCard .ci-btn:active{transform:scale(.96)}' +
      '#cucuInstallCard .ci-close{border:0;background:transparent;color:var(--text-light,#999);font-size:22px;line-height:1;padding:2px 4px;cursor:pointer}' +
      '@media (prefers-reduced-motion:reduce){#cucuInstallCard{animation-duration:.01s}}';
    document.head.appendChild(st);
  }

  function showCard(subtitle, onTap, tapLabel) {
    if (document.getElementById('cucuInstallCard') || dismissedRecently() || !document.body) return;
    injectStyle();
    var card = document.createElement('div');
    card.id = 'cucuInstallCard';
    card.setAttribute('role', 'dialog');
    card.setAttribute('aria-label', 'Install Cucu Collection app');

    var img = document.createElement('img');
    img.className = 'ci-icon';
    img.src = ICON;
    img.alt = 'Cucu Collection';
    card.appendChild(img);

    var txt = document.createElement('div');
    txt.className = 'ci-text';
    var t = document.createElement('p');
    t.className = 'ci-title';
    t.textContent = 'Cucu Collection';
    var sub = document.createElement('p');
    sub.className = 'ci-sub';
    sub.textContent = subtitle;
    txt.appendChild(t);
    txt.appendChild(sub);
    card.appendChild(txt);

    var actions = document.createElement('div');
    actions.className = 'ci-actions';
    if (onTap) {
      var go = document.createElement('button');
      go.className = 'ci-btn';
      go.type = 'button';
      go.textContent = tapLabel;
      go.onclick = function () { onTap(); card.remove(); };
      actions.appendChild(go);
    }
    var x = document.createElement('button');
    x.className = 'ci-close';
    x.type = 'button';
    x.setAttribute('aria-label', 'Close');
    x.textContent = '\u00d7';
    x.onclick = function () { remember(); card.remove(); };
    actions.appendChild(x);
    card.appendChild(actions);
    document.body.appendChild(card);
  }

  // Android / Chrome / Edge
  var deferred = null;
  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    deferred = e;
    var open = function () {
      showCard('Install our app for faster shopping and exclusive offers', function () {
        if (!deferred) return;
        deferred.prompt();
        deferred.userChoice.then(function (c) {
          if (c && c.outcome === 'dismissed') remember();
        }).catch(function () {}).then(function () { deferred = null; });
      }, 'Install');
    };
    if (document.readyState === 'complete') setTimeout(open, 2500);
    else window.addEventListener('load', function () { setTimeout(open, 2500); });
  });
  window.addEventListener('appinstalled', function () {
    try { localStorage.setItem(DONE, '1'); } catch (e) {}
    var b = document.getElementById('cucuInstallCard');
    if (b) b.remove();
  });

  // iPhone Safari: install prompt nahi hota, sirf hint
  var ua = navigator.userAgent;
  var isIOS = /iphone|ipad|ipod/i.test(ua) && !/crios|fxios|edgios/i.test(ua);
  if (isIOS) {
    window.addEventListener('load', function () {
      setTimeout(function () {
        showCard('Tap Share, then "Add to Home Screen" to install the app', null, '');
      }, 3000);
    });
  }
})();
