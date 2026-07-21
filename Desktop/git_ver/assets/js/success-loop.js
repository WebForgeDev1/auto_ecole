(function () {
  var track = document.querySelector('[data-loop-track]');
  if (!track) return;
  var viewport = track.parentElement;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reduced) {
    track.querySelectorAll('[aria-hidden="true"]').forEach(function (dup) { dup.remove(); });
    viewport.style.overflowX = 'auto';
    viewport.style.webkitOverflowScrolling = 'touch';
    return;
  }

  var cards = track.querySelectorAll('.loop-card');
  var half = cards.length / 2;
  // Exact distance from the first card to its duplicate — not scrollWidth/2, which is
  // thrown off by the track's own left/right padding and would cause a visible hitch.
  var loopDistance = cards[half].offsetLeft - cards[0].offsetLeft;

  var x = 0;
  var paused = false;
  var speed = 0.5;

  function step() {
    if (!paused) {
      x -= speed;
      if (x <= -loopDistance) x += loopDistance;
      track.style.transform = 'translateX(' + x + 'px)';
    }
    requestAnimationFrame(step);
  }
  requestAnimationFrame(step);

  viewport.addEventListener('mouseenter', function () { paused = true; });
  viewport.addEventListener('mouseleave', function () { paused = false; });
  viewport.addEventListener('focusin', function () { paused = true; });
  viewport.addEventListener('focusout', function () { paused = false; });
})();
