(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function setupMenu() {
        var toggle = document.querySelector('[data-menu-toggle]');
        var menu = document.querySelector('[data-menu]');
        if (!toggle || !menu) {
            return;
        }
        toggle.addEventListener('click', function () {
            var isOpen = menu.classList.toggle('is-open');
            document.body.classList.toggle('is-menu-open', isOpen);
            toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
            toggle.textContent = isOpen ? '×' : '☰';
        });
    }

    function setupHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        if (slides.length <= 1) {
            return;
        }
        var index = 0;
        var timer = null;
        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }
        function start() {
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }
        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                window.clearInterval(timer);
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                start();
            });
        });
        start();
    }

    function setupFilters() {
        var scopes = Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]'));
        scopes.forEach(function (scope) {
            var input = scope.querySelector('[data-filter-input]');
            var categorySelect = scope.querySelector('[data-category-filter]');
            var yearSelect = scope.querySelector('[data-year-filter]');
            var sortSelect = scope.querySelector('[data-sort-select]');
            var buttonWrap = scope.querySelector('[data-filter-buttons]');
            var grid = document.querySelector('[data-card-grid]');
            var noResults = document.querySelector('[data-no-results]');
            if (!grid) {
                return;
            }
            var cards = Array.prototype.slice.call(grid.querySelectorAll('[data-card]'));
            var activeType = '';
            var params = new URLSearchParams(window.location.search);
            if (input && input.hasAttribute('data-url-query') && params.get('q')) {
                input.value = params.get('q');
            }
            function normalize(value) {
                return String(value || '').trim().toLowerCase();
            }
            function apply() {
                var query = normalize(input ? input.value : '');
                var category = categorySelect ? categorySelect.value : '';
                var year = yearSelect ? yearSelect.value : '';
                var visible = 0;
                cards.forEach(function (card) {
                    var text = normalize(card.getAttribute('data-search'));
                    var cardCategory = card.getAttribute('data-category') || '';
                    var cardType = card.getAttribute('data-type') || '';
                    var cardYear = card.getAttribute('data-year') || '';
                    var matched = true;
                    if (query && text.indexOf(query) === -1) {
                        matched = false;
                    }
                    if (category && cardCategory !== category) {
                        matched = false;
                    }
                    if (activeType && cardType !== activeType) {
                        matched = false;
                    }
                    if (year && cardYear !== year) {
                        matched = false;
                    }
                    card.hidden = !matched;
                    if (matched) {
                        visible += 1;
                    }
                });
                if (sortSelect) {
                    sortCards(cards, grid, sortSelect.value);
                }
                if (noResults) {
                    noResults.hidden = visible !== 0;
                }
            }
            function sortCards(cardList, gridElement, mode) {
                var sorted = cardList.slice();
                if (mode === 'year-desc') {
                    sorted.sort(function (a, b) {
                        return Number(b.getAttribute('data-year') || 0) - Number(a.getAttribute('data-year') || 0);
                    });
                }
                if (mode === 'title-asc') {
                    sorted.sort(function (a, b) {
                        return String(a.getAttribute('data-title') || '').localeCompare(String(b.getAttribute('data-title') || ''), 'zh-Hans-CN');
                    });
                }
                sorted.forEach(function (card) {
                    gridElement.appendChild(card);
                });
            }
            if (input) {
                input.addEventListener('input', apply);
            }
            if (categorySelect) {
                categorySelect.addEventListener('change', apply);
            }
            if (yearSelect) {
                yearSelect.addEventListener('change', apply);
            }
            if (sortSelect) {
                sortSelect.addEventListener('change', apply);
            }
            if (buttonWrap) {
                buttonWrap.addEventListener('click', function (event) {
                    var button = event.target.closest('[data-filter-value]');
                    if (!button) {
                        return;
                    }
                    activeType = button.getAttribute('data-filter-value') || '';
                    Array.prototype.slice.call(buttonWrap.querySelectorAll('[data-filter-value]')).forEach(function (item) {
                        item.classList.toggle('is-active', item === button);
                    });
                    apply();
                });
            }
            apply();
        });
    }

    function setupPlayers() {
        var playerCards = Array.prototype.slice.call(document.querySelectorAll('[data-hls-player]'));
        playerCards.forEach(function (card) {
            var video = card.querySelector('video[data-src]');
            var button = card.querySelector('[data-player-button]');
            if (!video || !button) {
                return;
            }
            var initialized = false;
            var hlsInstance = null;
            function initSource() {
                if (initialized) {
                    return;
                }
                initialized = true;
                var source = video.getAttribute('data-src');
                if (!source) {
                    return;
                }
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = source;
                    return;
                }
                if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(source);
                    hlsInstance.attachMedia(video);
                    hlsInstance.on(window.Hls.Events.ERROR, function (_, data) {
                        if (data && data.fatal) {
                            try {
                                hlsInstance.destroy();
                            } catch (error) {
                                console.warn(error);
                            }
                        }
                    });
                    return;
                }
                video.src = source;
            }
            function playVideo() {
                initSource();
                card.classList.add('is-playing');
                var playPromise = video.play();
                if (playPromise && typeof playPromise.catch === 'function') {
                    playPromise.catch(function () {
                        card.classList.remove('is-playing');
                    });
                }
            }
            button.addEventListener('click', playVideo);
            video.addEventListener('play', function () {
                card.classList.add('is-playing');
            });
            video.addEventListener('pause', function () {
                if (video.currentTime === 0) {
                    card.classList.remove('is-playing');
                }
            });
        });
    }

    function setupPlayerScroll() {
        Array.prototype.slice.call(document.querySelectorAll('[data-scroll-player]')).forEach(function (link) {
            link.addEventListener('click', function (event) {
                var player = document.querySelector('.player-section');
                if (!player) {
                    return;
                }
                event.preventDefault();
                player.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
        });
    }

    ready(function () {
        setupMenu();
        setupHero();
        setupFilters();
        setupPlayers();
        setupPlayerScroll();
    });
}());
