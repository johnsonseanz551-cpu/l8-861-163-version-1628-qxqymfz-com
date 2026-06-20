(function () {
  const toggle = document.querySelector('[data-menu-toggle]');
  const menu = document.querySelector('[data-mobile-menu]');
  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      menu.classList.toggle('open');
    });
  }

  const panel = document.querySelector('[data-filter-panel]');
  if (panel) {
    const input = panel.querySelector('[data-filter-input]');
    const category = panel.querySelector('[data-filter-category]');
    const year = panel.querySelector('[data-filter-year]');
    const type = panel.querySelector('[data-filter-type]');
    const cards = Array.from(document.querySelectorAll('[data-search]'));
    const empty = document.querySelector('[data-empty-state]');

    const run = function () {
      const q = input ? input.value.trim().toLowerCase() : '';
      const c = category ? category.value : '';
      const y = year ? year.value : '';
      const t = type ? type.value : '';
      let shown = 0;

      cards.forEach(function (card) {
        const text = card.getAttribute('data-search') || '';
        const cardCategory = card.getAttribute('data-category') || '';
        const cardYear = card.getAttribute('data-year') || '';
        const cardType = card.getAttribute('data-type') || '';
        const ok = (!q || text.indexOf(q) !== -1) && (!c || cardCategory === c) && (!y || cardYear === y) && (!t || cardType === t);
        card.hidden = !ok;
        if (ok) {
          shown += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('show', shown === 0);
      }
    };

    [input, category, year, type].forEach(function (item) {
      if (item) {
        item.addEventListener('input', run);
        item.addEventListener('change', run);
      }
    });
  }
})();
