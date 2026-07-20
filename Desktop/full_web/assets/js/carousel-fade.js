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
      dot.setAttribute('aria-label', 'Aller à l’élément ' + (i + 1) + ' sur ' + cards.length);
      dot.addEventListener('click', function () {
        card.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', inline: 'center', block: 'nearest' });
      });
      dots.appendChild(dot);
      return dot;
    });
    var anchor = container.closest('.carousel-wrap') || container;
    anchor.insertAdjacentElement('afterend', dots);
    dotEls[0].classList.add('is-active');

    if (!('IntersectionObserver' in window)) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var isActive = entry.intersectionRatio >= 0.6;
        entry.target.classList.toggle('is-active', isActive);
        var index = cards.indexOf(entry.target);
        if (isActive && index > -1) {
          dotEls.forEach(function (d, i) { d.classList.toggle('is-active', i === index); });
        }
      });
    }, { root: container, threshold: [0, 0.25, 0.5, 0.6, 0.75, 1] });

    cards.forEach(function (card) { observer.observe(card); });
  });
})();
