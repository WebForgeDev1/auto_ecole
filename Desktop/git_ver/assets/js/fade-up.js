(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var targets = document.querySelectorAll('.section, .hero-content, .ready-cta, .project-contact, .stats-row, .google-proof-section, .formula-section');
  if (!targets.length || !('IntersectionObserver' in window)) return;

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry, i) {
      if (!entry.isIntersecting) return;
      var el = entry.target;
      setTimeout(function () { el.classList.add('is-visible'); }, Math.min(i * 80, 240));
      observer.unobserve(el);
    });
  }, { threshold: 0.12 });

  targets.forEach(function (el) {
    el.classList.add('fade-up');
    observer.observe(el);
  });
})();
