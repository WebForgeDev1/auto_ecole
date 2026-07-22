(function () {
  document.querySelectorAll('[data-faq-limit]').forEach(function (container) {
    var limit = parseInt(container.dataset.faqLimit, 10);
    var items = Array.prototype.slice.call(container.querySelectorAll('details'));
    if (!limit || items.length <= limit) return;

    items.slice(limit).forEach(function (item) { item.hidden = true; });

    var remaining = items.length - limit;
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'faq-more';
    btn.innerHTML = 'Voir plus de questions <span>(+' + remaining + ')</span>';
    btn.addEventListener('click', function () {
      items.forEach(function (item) { item.hidden = false; });
      btn.remove();
    });
    container.appendChild(btn);
  });
})();
