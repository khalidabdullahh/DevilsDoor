/* play.js — landing "PLAY NOW".
   Fullscreen is lost whenever the browser navigates to a new page. So on touch devices we do NOT navigate:
   we open the game in a full-viewport frame inside this same document, which keeps the single fullscreen
   the player already granted. Desktop (mouse) still does a normal navigation to /game. */
(function () {
  'use strict';
  var link = document.querySelector('a.play');
  if (!link) return;
  var touch = window.matchMedia && matchMedia('(pointer: coarse)').matches;
  var frame = null;

  function close() {
    if (!frame) return;
    frame.remove(); frame = null;
    document.documentElement.style.overflow = '';
  }

  link.addEventListener('click', function (e) {
    if (!touch || window.self !== window.top) return;   // desktop / already framed: normal link
    e.preventDefault();
    // The tap is a user gesture: make sure we are fullscreen (no-op if the player already is, or skipped it).
    if (window.DDImmersive && !window.DDImmersive.isFullscreen()) window.DDImmersive.enter();
    if (frame) return;
    frame = document.createElement('iframe');
    frame.src = '/game';
    frame.title = "Devil's Door";
    frame.setAttribute('allow', 'fullscreen; autoplay; gamepad');
    frame.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;border:0;background:#05060b;z-index:2147482000';
    document.documentElement.style.overflow = 'hidden';
    document.body.appendChild(frame);
    try { history.pushState({ dd: 'game' }, '', location.href); } catch (err) {}
  });

  // The game asks us to close it (its HOME button), or the player presses the browser Back button.
  window.addEventListener('message', function (e) {
    if (e.origin === location.origin && e.data && e.data.type === 'dd-home') {
      close();
      try { if (history.state && history.state.dd === 'game') history.back(); } catch (err) {}
    }
  });
  window.addEventListener('popstate', close);
})();
