(function () {
  var nav = document.querySelector('.main-nav');
  if (!nav) return;
  var links = Array.prototype.slice.call(nav.querySelectorAll('a'));
  if (!links.length) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var MAX_SCALE = 1.28;
  var MAX_DIST = 90;

  // Cache link rects once per animation frame instead of re-reading layout
  // geometry on every raw mousemove event (which can fire 60-120+ times/sec) —
  // avoids piling up forced-layout reads on the main thread.
  var rects = null;
  var pendingX = null;
  var ticking = false;

  function applyScale() {
    ticking = false;
    if (!rects) rects = links.map(function (link) { return link.getBoundingClientRect(); });
    links.forEach(function (link, i) {
      var rect = rects[i];
      var center = rect.left + rect.width / 2;
      var dist = Math.abs(pendingX - center);
      var scale = 1 + (MAX_SCALE - 1) * Math.max(0, 1 - dist / MAX_DIST);
      link.style.transform = 'scale(' + scale.toFixed(3) + ')';
    });
  }

  nav.addEventListener('mousemove', function (e) {
    pendingX = e.clientX;
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(applyScale);
  });

  nav.addEventListener('mouseleave', function () {
    rects = null;
    links.forEach(function (link) { link.style.transform = 'scale(1)'; });
  });
})();
