/* Scales each headline line so all three share one width, then caps the block height so it never
   runs into the bottom of the frame. Without JS the CSS sizes in landing.css still give a good layout. */
(function () {
  var h = document.getElementById('headline');
  if (!h) return;
  var frame = h.parentElement;
  var lines = Array.prototype.slice.call(h.querySelectorAll('.ln'));
  var LH = 0.9;

  function fit() {
    var W = frame.clientWidth, H = frame.clientHeight;
    var portrait = W / H < 0.8;
    var targetW = (portrait ? 0.88 : 0.68) * W;
    var maxH = (portrait ? 0.4 : 0.74) * H;
    var inv = 0, widths = lines.map(function (ln) {
      var s = ln.firstElementChild; ln.style.fontSize = '100px';
      var w = s.getBoundingClientRect().width || 1; inv += 1 / w; return w;
    });
    var k = Math.min(targetW, maxH / (LH * 100 * inv));
    lines.forEach(function (ln, i) { ln.style.fontSize = (k / widths[i] * 100) + 'px'; });
    h.style.width = k + 'px';
  }

  var raf = 0;
  function schedule() { cancelAnimationFrame(raf); raf = requestAnimationFrame(fit); }
  window.addEventListener('resize', schedule);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
  fit();
})();
