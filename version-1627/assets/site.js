(function () {
    function qs(selector, scope) {
        return (scope || document).querySelector(selector);
    }

    function qsa(selector, scope) {
        return Array.from((scope || document).querySelectorAll(selector));
    }

    function escapeHtml(value) {
        return String(value || '').replace(/[&<>"]/g, function (match) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;'
            }[match];
        });
    }

    function initMobileNav() {
        var toggle = qs('[data-mobile-toggle]');
        var panel = qs('[data-mobile-panel]');
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener('click', function () {
            panel.classList.toggle('is-open');
        });
    }

    function initSearchForms() {
        qsa('[data-search-form]').forEach(function (form) {
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                var input = qs('input[name="q"]', form);
                var value = input ? input.value.trim() : '';
                var target = form.getAttribute('action') || './search.html';
                if (value) {
                    window.location.href = target + '?q=' + encodeURIComponent(value);
                } else {
                    window.location.href = target;
                }
            });
        });
    }

    function initHero() {
        var hero = qs('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = qsa('[data-hero-slide]', hero);
        var dots = qsa('[data-hero-dot]', hero);
        var prev = qs('[data-hero-prev]', hero);
        var next = qs('[data-hero-next]', hero);
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        function play() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                play();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                play();
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                play();
            });
        });
        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', play);
        show(0);
        play();
    }

    function initFilters() {
        var list = qs('[data-filter-list]');
        if (!list) {
            return;
        }
        var input = qs('[data-filter-input]');
        var year = qs('[data-filter-year]');
        var cards = qsa('[data-card]', list);

        function apply() {
            var query = input ? input.value.trim().toLowerCase() : '';
            var selectedYear = year ? year.value : '';
            cards.forEach(function (card) {
                var haystack = [
                    card.getAttribute('data-title'),
                    card.getAttribute('data-category'),
                    card.getAttribute('data-genre'),
                    card.getAttribute('data-year')
                ].join(' ').toLowerCase();
                var matchQuery = !query || haystack.indexOf(query) !== -1;
                var matchYear = !selectedYear || card.getAttribute('data-year') === selectedYear;
                card.classList.toggle('is-hidden', !(matchQuery && matchYear));
            });
        }

        if (input) {
            input.addEventListener('input', apply);
        }
        if (year) {
            year.addEventListener('change', apply);
        }
    }

    function renderCard(item) {
        return '<article class="movie-card" data-card>' +
            '<a class="card-cover" href="' + escapeHtml(item.url) + '">' +
            '<img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">' +
            '<span class="card-category">' + escapeHtml(item.category) + '</span>' +
            '<span class="card-duration">' + escapeHtml(item.duration) + '</span>' +
            '<span class="card-play">▶</span>' +
            '</a>' +
            '<div class="card-body">' +
            '<h3><a href="' + escapeHtml(item.url) + '">' + escapeHtml(item.title) + '</a></h3>' +
            '<p>' + escapeHtml(item.description) + '</p>' +
            '<div class="card-meta">' +
            '<span>' + escapeHtml(item.year) + '</span>' +
            '<span>' + escapeHtml(item.region) + '</span>' +
            '<span>' + escapeHtml(item.type) + '</span>' +
            '</div>' +
            '</div>' +
            '</article>';
    }

    function initSearchPage() {
        var results = qs('[data-search-results]');
        if (!results || !window.CATALOG_ITEMS) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var query = (params.get('q') || '').trim();
        var input = qs('[data-search-page-input]');
        var summary = qs('[data-search-summary]');
        if (input) {
            input.value = query;
        }
        if (!query) {
            return;
        }
        var lower = query.toLowerCase();
        var matches = window.CATALOG_ITEMS.filter(function (item) {
            return [item.title, item.category, item.genre, item.year, item.region, item.type, item.description, item.tags]
                .join(' ')
                .toLowerCase()
                .indexOf(lower) !== -1;
        });
        if (summary) {
            summary.textContent = '“' + query + '” 的搜索结果';
        }
        if (matches.length) {
            results.innerHTML = matches.map(renderCard).join('');
        } else {
            results.innerHTML = '<div class="empty-result">没有找到匹配影片</div>';
        }
    }

    function initPlayer() {
        var shell = qs('[data-player]');
        if (!shell) {
            return;
        }
        var video = qs('video', shell);
        var cover = qs('.player-cover', shell);
        var button = qs('.player-button', shell);
        var stream = shell.getAttribute('data-stream');
        var started = false;
        var hls = null;

        function start() {
            if (!video || !stream) {
                return;
            }
            if (cover) {
                cover.classList.add('is-hidden');
            }
            if (!started) {
                started = true;
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = stream;
                    video.play().catch(function () {});
                } else if (window.Hls && window.Hls.isSupported()) {
                    hls = new Hls({ enableWorker: true });
                    hls.loadSource(stream);
                    hls.attachMedia(video);
                    hls.on(Hls.Events.MANIFEST_PARSED, function () {
                        video.play().catch(function () {});
                    });
                } else {
                    video.src = stream;
                    video.play().catch(function () {});
                }
            } else {
                video.play().catch(function () {});
            }
        }

        if (cover) {
            cover.addEventListener('click', start);
        }
        if (button) {
            button.addEventListener('click', function (event) {
                event.stopPropagation();
                start();
            });
        }
        video.addEventListener('click', function () {
            if (video.paused) {
                start();
            } else {
                video.pause();
            }
        });
        window.addEventListener('pagehide', function () {
            if (hls) {
                hls.destroy();
            }
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        initMobileNav();
        initSearchForms();
        initHero();
        initFilters();
        initSearchPage();
        initPlayer();
    });
})();
