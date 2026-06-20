(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var navPanel = document.querySelector('[data-nav-panel]');

    if (menuButton && navPanel) {
        menuButton.addEventListener('click', function () {
            navPanel.classList.toggle('is-open');
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var active = 0;
        var timer = null;

        function show(index) {
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === active);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === active);
            });
        }

        function play() {
            timer = window.setInterval(function () {
                show(active + 1);
            }, 5200);
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                window.clearInterval(timer);
                show(i);
                play();
            });
        });

        if (slides.length > 1) {
            play();
        }
    }

    var roots = Array.prototype.slice.call(document.querySelectorAll('[data-filter-root]'));

    roots.forEach(function (root) {
        var wrap = root.parentElement;
        var input = root.querySelector('[data-filter-input]');
        var type = root.querySelector('[data-filter-type]');
        var year = root.querySelector('[data-filter-year]');
        var category = root.querySelector('[data-filter-category]');
        var cards = Array.prototype.slice.call(wrap.querySelectorAll('.searchable-card'));
        var empty = wrap.querySelector('[data-empty-state]');
        var params = new URLSearchParams(window.location.search);
        var initial = params.get('q') || '';

        if (input && initial) {
            input.value = initial;
        }

        function value(node) {
            return node ? node.value.trim().toLowerCase() : '';
        }

        function apply() {
            var q = value(input);
            var t = value(type);
            var y = value(year);
            var c = value(category);
            var visible = 0;

            cards.forEach(function (card) {
                var bag = (card.getAttribute('data-search') || '').toLowerCase();
                var cardType = (card.getAttribute('data-type') || '').toLowerCase();
                var cardYear = (card.getAttribute('data-year') || '').toLowerCase();
                var cardCategory = (card.getAttribute('data-category') || '').toLowerCase();
                var ok = true;

                if (q && bag.indexOf(q) === -1) {
                    ok = false;
                }
                if (t && cardType.indexOf(t) === -1) {
                    ok = false;
                }
                if (y && cardYear.indexOf(y) === -1) {
                    ok = false;
                }
                if (c && cardCategory.indexOf(c) === -1) {
                    ok = false;
                }

                card.classList.toggle('is-hidden', !ok);
                if (ok) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.classList.toggle('is-visible', visible === 0);
            }
        }

        [input, type, year, category].forEach(function (node) {
            if (node) {
                node.addEventListener('input', apply);
                node.addEventListener('change', apply);
            }
        });

        apply();
    });

    Array.prototype.slice.call(document.querySelectorAll('.js-scroll-play')).forEach(function (link) {
        link.addEventListener('click', function () {
            var layer = document.querySelector('.js-play-layer');
            if (layer) {
                window.setTimeout(function () {
                    layer.click();
                }, 180);
            }
        });
    });
}());
