(function () {
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var containers = document.querySelectorAll('.review-grid-static, .team-grid');
  if (!containers.length) return;

  containers.forEach(function (container) {
    var cards = Array.prototype.slice.call(container.children);
    if (cards.length < 2) return;

    var dots = document.createElement('div');
    dots.className = 'carousel-dots';
    var dotEls = cards.map(function (card, i) {
      var dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'carousel-dot';
      dot.setAttribute('aria-label', 'Aller à la carte ' + (i + 1));
      dot.addEventListener('click', function () {
        card.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', inline: 'center', block: 'nearest' });
      });
      dots.appendChild(dot);
      return dot;
    });
    var anchor = container.closest('.carousel-wrap') || container;
    anchor.insertAdjacentElement('afterend', dots);

    var setActive = function (index) {
      cards.forEach(function (card, i) { card.classList.toggle('is-active', i === index); });
      dotEls.forEach(function (dot, i) {
        var isActive = i === index;
        dot.classList.toggle('is-active', isActive);
        dot.setAttribute('aria-current', isActive ? 'true' : 'false');
      });
    };

    var getActiveIndex = function () {
      var gap = parseFloat(getComputedStyle(container).columnGap || '0');
      var step = cards[0].getBoundingClientRect().width + gap;
      if (!step) return 0;
      var index = Math.round(container.scrollLeft / step);
      return Math.max(0, Math.min(cards.length - 1, index));
    };

    setActive(0);

    // Recompute the active card directly from scrollLeft on every scroll frame,
    // so the dots (and the opacity dimming) track a finger swipe in real time —
    // not just discrete snap/arrow-click events.
    var ticking = false;
    container.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        setActive(getActiveIndex());
        ticking = false;
      });
    }, { passive: true });
  });
})();
