(function () {
  var nav = document.querySelector('.main-nav');
  if (!nav) return;
  var links = Array.prototype.slice.call(nav.querySelectorAll('a'));
  if (!links.length) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var MAX_SCALE = 1.28;
  var MAX_DIST = 90;

  nav.addEventListener('mousemove', function (e) {
    links.forEach(function (link) {
      var rect = link.getBoundingClientRect();
      var center = rect.left + rect.width / 2;
      var dist = Math.abs(e.clientX - center);
      var scale = 1 + (MAX_SCALE - 1) * Math.max(0, 1 - dist / MAX_DIST);
      link.style.transform = 'scale(' + scale.toFixed(3) + ')';
    });
  });

  nav.addEventListener('mouseleave', function () {
    links.forEach(function (link) { link.style.transform = 'scale(1)'; });
  });
})();
