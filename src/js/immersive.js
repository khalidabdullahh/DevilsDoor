/* immersive.js — phone "full screen + landscape" helper (classic script, no imports).
   Browsers only allow fullscreen / orientation lock right after a user tap, so this shows a
   one-tap prompt and also tries on the first tap of the page. iPhone Safari has no fullscreen
   API for pages, so there it can only ask the player to rotate. */
(function () {
  'use strict';
  // Go back to the landing page. When the game runs inside the landing's full-screen frame, ask the parent to close it
  // (a normal navigation would drop fullscreen); otherwise just navigate.
  window.ddGoHome = function () {
    if (window.self !== window.top) { try { window.parent.postMessage({ type: 'dd-home' }, location.origin); return; } catch (e) {} }
    window.location.href = '/';
  };
  // 1) Only touch-first devices, never inside an iframe (e.g. CrazyGames embeds handle this themselves).
  if (!window.matchMedia || !matchMedia('(pointer: coarse)').matches || window.self !== window.top) return;
  // Already running as an installed app (manifest display: fullscreen/standalone) -> nothing to do.
  if (matchMedia('(display-mode: fullscreen)').matches || matchMedia('(display-mode: standalone)').matches || navigator.standalone) return;

  var script = document.currentScript;
  var wantGate = !!(script && script.dataset.gate === 'true'); // landing page asks even when already landscape
  var de = document.documentElement;
  var canFS = !!(de.requestFullscreen || de.webkitRequestFullscreen);
  var SKIP_KEY = 'dd-immersive-skip';
  var skipped = false;
  try { skipped = sessionStorage.getItem(SKIP_KEY) === '1'; } catch (e) {}

  function isFS() { return !!(document.fullscreenElement || document.webkitFullscreenElement); }
  function isPortrait() { return matchMedia('(orientation: portrait) and (max-width: 900px)').matches; }

  // Ask for fullscreen (hides the address/tab bars), then lock to landscape (works in fullscreen on Android Chrome).
  function enter() {
    if (isFS() || !canFS) return Promise.resolve();
    var req;
    try {
      req = de.requestFullscreen ? de.requestFullscreen({ navigationUI: 'hide' }) : de.webkitRequestFullscreen();
    } catch (e) { return Promise.resolve(); }
    return Promise.resolve(req).then(function () {
      if (screen.orientation && screen.orientation.lock) return screen.orientation.lock('landscape').catch(function () {});
    }).catch(function () {});
  }

  window.DDImmersive = { enter: enter, isFullscreen: isFS };

  // ---- overlay UI (only transform/opacity animation) ----
  var css = '.dd-gate{position:fixed;inset:0;z-index:2147483000;display:none;flex-direction:column;align-items:center;justify-content:center;gap:14px;' +
    'background:#d9d7e9;color:#4a5568;text-align:center;padding:24px;font-family:"Barlow Condensed","Arial Narrow",sans-serif;font-weight:700}' +
    '.dd-gate.on{display:flex}' +
    '.dd-gate h2{font-size:clamp(24px,7vw,40px);letter-spacing:.06em;margin:0}' +
    '.dd-gate p{font-size:clamp(14px,4vw,20px);color:#e8481c;margin:0}' +
    '.dd-gate button{font:inherit;font-size:clamp(16px,4.6vw,22px);letter-spacing:.06em;border:0;border-radius:.6em;padding:.7em 1.4em;background:#e8481c;color:#fff;cursor:pointer}' +
    '.dd-gate .skip{background:none;color:#4a5568;text-decoration:underline;font-size:clamp(13px,3.6vw,16px);padding:.3em}' +
    '.dd-phone{width:44px;height:78px;border:5px solid #4a5568;border-radius:10px;animation:dd-rot 2.2s ease-in-out infinite}' +
    '@keyframes dd-rot{0%,15%{transform:rotate(0)}60%,100%{transform:rotate(-90deg)}}' +
    '@media (prefers-reduced-motion:reduce){.dd-phone{animation:none;transform:rotate(-90deg)}}';
  var gate = null;

  function build() {
    var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
    gate = document.createElement('div');
    gate.className = 'dd-gate'; gate.setAttribute('role', 'dialog'); gate.setAttribute('aria-live', 'polite');
    gate.innerHTML = '<div class="dd-phone" aria-hidden="true"></div><h2></h2><p></p>' +
      '<button type="button" class="go"></button><button type="button" class="skip">Continue anyway</button>';
    gate.querySelector('.go').addEventListener('click', function () { enter().then(update); });
    gate.querySelector('.skip').addEventListener('click', function () {
      skipped = true; try { sessionStorage.setItem(SKIP_KEY, '1'); } catch (e) {} update();
    });
    document.body.appendChild(gate);
  }

  function needed() {
    if (skipped || isFS()) return false;
    if (isPortrait()) return true;           // always ask phones in portrait to rotate
    return wantGate && canFS;                // landing: one tap to go fullscreen even if already landscape
  }

  function update() {
    var on = needed();
    if (!gate && !on) return;
    if (!gate) build();
    var portrait = isPortrait();
    gate.querySelector('h2').textContent = portrait ? 'ROTATE YOUR PHONE' : 'PLAY FULL SCREEN';
    gate.querySelector('p').textContent = portrait ? 'Devil\u2019s Door plays best in landscape.' : 'Tap once to hide the browser bars.';
    var go = gate.querySelector('.go');
    go.textContent = 'ENTER FULLSCREEN'; go.style.display = canFS ? '' : 'none';
    gate.querySelector('.dd-phone').style.display = portrait ? '' : 'none';
    gate.classList.toggle('on', on);
  }

  // First tap anywhere (pages without the gate, e.g. the game): silently go fullscreen. Capture phase, never blocks the tap.
  function firstTap() {
    document.removeEventListener('pointerup', firstTap, true);
    if (!skipped) enter().then(update);
  }
  if (!wantGate) document.addEventListener('pointerup', firstTap, true);

  ['resize', 'orientationchange', 'fullscreenchange', 'webkitfullscreenchange'].forEach(function (ev) {
    window.addEventListener(ev, update); document.addEventListener(ev, update);
  });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', update); else update();
})();
