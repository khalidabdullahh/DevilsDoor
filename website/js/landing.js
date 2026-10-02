/**
 * Landing page behavior: scroll-reveal, hero entrance, count-up numbers, card tilt,
 * nav highlight, and lazy loading of the 3D scene. Plain JS, no dependencies.
 */
(function () {
  'use strict';

  var doc = document.documentElement;
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var canHover = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  // ---------- 1. Scroll reveal ----------
  // Elements marked .reveal fade/slide in when they enter the viewport. After the animation the
  // classes are removed again, so normal hover transforms (card lift etc.) work as before.
  function initReveal() {
    // Classes are added HERE (not in the HTML): if this script never runs, nothing is hidden.
    var items = [];
    document.querySelectorAll('.section-header').forEach(function (el) { el.classList.add('reveal'); items.push(el); });
    document.querySelectorAll('[data-stagger]').forEach(function (group) {
      Array.prototype.forEach.call(group.children, function (child, i) {
        child.classList.add('reveal');
        child.style.setProperty('--d', Math.min(i, 8) * 90 + 'ms'); // stagger siblings
        items.push(child);
      });
    });
    if (!items.length) return;

    var showAll = function () { items.forEach(function (el) { el.classList.remove('reveal', 'in'); }); };
    if (reduceMotion || !('IntersectionObserver' in window)) { showAll(); return; }

    // Safety net: whatever happens, nothing stays hidden for more than a few seconds
    setTimeout(showAll, 8000);

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        io.unobserve(el);
        el.classList.add('in');
        var delay = parseInt((el.style.getPropertyValue('--d') || '0'), 10) || 0;
        // once visible, drop the classes so normal hover transforms (card lift) work again
        setTimeout(function () { el.classList.remove('reveal', 'in'); }, delay + 1000);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

    items.forEach(function (el) { io.observe(el); });
  }

  // ---------- 2. Count-up numbers ([data-count]) ----------
  function initCounters() {
    var nodes = document.querySelectorAll('[data-count]');
    if (!nodes.length || reduceMotion || !('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target, end = parseInt(el.getAttribute('data-count'), 10), t0 = performance.now(), dur = 1100;
        io.unobserve(el);
        (function tick(now) {
          var p = Math.min(1, (now - t0) / dur);
          el.textContent = String(Math.round(end * (1 - Math.pow(1 - p, 3)))); // ease-out
          if (p < 1) requestAnimationFrame(tick);
        })(t0);
      });
    }, { threshold: 0.6 });
    nodes.forEach(function (n) { n.textContent = '0'; io.observe(n); });
  }

  // ---------- 3. 3D tilt on shinobi cards (mouse only) ----------
  function initTilt() {
    if (reduceMotion || !canHover) return;
    document.querySelectorAll('.hero-showcase-card').forEach(function (card) {
      var raf = 0;
      card.addEventListener('pointermove', function (e) {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(function () {
          var r = card.getBoundingClientRect();
          var x = ((e.clientX - r.left) / r.width) * 2 - 1;   // -1..1
          var y = ((e.clientY - r.top) / r.height) * 2 - 1;
          card.style.transition = 'transform 0.12s ease-out';
          card.style.transform = 'perspective(900px) rotateX(' + (-y * 7).toFixed(2) + 'deg) rotateY(' + (x * 9).toFixed(2) + 'deg) translateY(-6px)';
        });
      });
      card.addEventListener('pointerleave', function () {
        cancelAnimationFrame(raf);
        card.style.transition = 'transform 0.35s ease';
        card.style.transform = '';
      });
    });
  }

  // ---------- 4. Header state + active nav link ----------
  function initNav() {
    var header = document.querySelector('.site-header');
    if (header) {
      var onScroll = function () { header.classList.toggle('scrolled', window.scrollY > 24); };
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    }
    if (!('IntersectionObserver' in window)) return;
    var links = {};
    document.querySelectorAll('.nav-links a[href^="#"]').forEach(function (a) { links[a.getAttribute('href').slice(1)] = a; });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting || !links[entry.target.id]) return;
        Object.keys(links).forEach(function (id) { links[id].classList.toggle('active', id === entry.target.id); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(links).forEach(function (id) {
      var sec = document.getElementById(id);
      if (sec) io.observe(sec);
    });
  }

  // ---------- 5. Lazy-load the 3D scene ----------
  function webglSupported() {
    try {
      var c = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && (c.getContext('webgl') || c.getContext('experimental-webgl')));
    } catch (e) { return false; }
  }

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = src;
      s.async = true;
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  function init3D() {
    var conn = navigator.connection || {};
    // No 3D when WebGL is missing or the visitor asked to save data: the page keeps its 2D look
    if (!webglSupported() || conn.saveData) { doc.classList.add('no-webgl'); return; }
    var start = function () {
      loadScript('/website/js/vendor/three.min.js')
        .then(function () { return loadScript('/website/js/scene3d.js'); })
        .catch(function () { doc.classList.add('no-webgl'); });
    };
    // after first paint + idle: the 150KB (gzip) library never blocks the hero
    if ('requestIdleCallback' in window) requestIdleCallback(start, { timeout: 2500 });
    else setTimeout(start, 800);
  }

  function boot() {
    initReveal();
    initCounters();
    initTilt();
    initNav();
    if (document.readyState === 'complete') init3D();
    else window.addEventListener('load', init3D);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
