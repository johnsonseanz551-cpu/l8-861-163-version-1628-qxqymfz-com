const menuButton = document.querySelector('[data-menu-toggle]');
const navLinks = document.querySelector('[data-nav-links]');

if (menuButton && navLinks) {
    menuButton.addEventListener('click', () => {
        navLinks.classList.toggle('open');
    });
}

const hero = document.querySelector('[data-hero]');

if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    const prev = hero.querySelector('[data-hero-prev]');
    const next = hero.querySelector('[data-hero-next]');
    let activeIndex = 0;
    let timer = null;

    const setActive = (index) => {
        activeIndex = (index + slides.length) % slides.length;
        slides.forEach((slide, slideIndex) => {
            slide.classList.toggle('active', slideIndex === activeIndex);
        });
        dots.forEach((dot, dotIndex) => {
            dot.classList.toggle('active', dotIndex === activeIndex);
        });
    };

    const restart = () => {
        if (timer) {
            window.clearInterval(timer);
        }
        timer = window.setInterval(() => setActive(activeIndex + 1), 5200);
    };

    dots.forEach((dot) => {
        dot.addEventListener('click', () => {
            setActive(Number(dot.dataset.heroDot || 0));
            restart();
        });
    });

    if (prev) {
        prev.addEventListener('click', () => {
            setActive(activeIndex - 1);
            restart();
        });
    }

    if (next) {
        next.addEventListener('click', () => {
            setActive(activeIndex + 1);
            restart();
        });
    }

    restart();
}

const searchPage = document.querySelector('[data-search-page]');

if (searchPage) {
    const form = searchPage.querySelector('[data-search-form]');
    const input = searchPage.querySelector('[data-search-input]');
    const grid = searchPage.querySelector('[data-search-grid]');
    const status = searchPage.querySelector('[data-search-status]');
    const emptyState = searchPage.querySelector('[data-empty-state]');
    const cards = Array.from(searchPage.querySelectorAll('[data-movie-card]'));
    let category = 'all';
    let type = 'all';
    let sortMode = 'default';

    const setActiveButton = (selector, currentButton) => {
        searchPage.querySelectorAll(selector).forEach((button) => {
            button.classList.toggle('active', button === currentButton);
        });
    };

    const applyFilters = () => {
        const keyword = (input.value || '').trim().toLowerCase();
        const matched = cards.filter((card) => {
            const text = (card.dataset.text || '').toLowerCase();
            const title = (card.dataset.title || '').toLowerCase();
            const cardCategory = card.dataset.category || '';
            const cardType = card.dataset.type || '';
            const keywordPass = !keyword || text.includes(keyword) || title.includes(keyword);
            const categoryPass = category === 'all' || cardCategory === category;
            const typePass = type === 'all' || cardType === type;
            return keywordPass && categoryPass && typePass;
        });

        const sorted = matched.slice();

        if (sortMode === 'year') {
            sorted.sort((a, b) => Number(b.dataset.year || 0) - Number(a.dataset.year || 0));
        }

        if (sortMode === 'title') {
            sorted.sort((a, b) => (a.dataset.title || '').localeCompare(b.dataset.title || '', 'zh-CN'));
        }

        cards.forEach((card) => {
            card.hidden = true;
        });

        sorted.forEach((card) => {
            card.hidden = false;
            grid.appendChild(card);
        });

        if (status) {
            status.textContent = keyword ? `“${keyword}” 的筛选结果` : '影片结果';
        }

        if (emptyState) {
            emptyState.hidden = sorted.length > 0;
        }
    };

    if (form) {
        form.addEventListener('submit', (event) => {
            event.preventDefault();
            applyFilters();
        });
    }

    if (input) {
        input.addEventListener('input', applyFilters);
    }

    searchPage.querySelectorAll('[data-filter-category]').forEach((button) => {
        button.addEventListener('click', () => {
            category = button.dataset.filterCategory || 'all';
            setActiveButton('[data-filter-category]', button);
            applyFilters();
        });
    });

    searchPage.querySelectorAll('[data-filter-type]').forEach((button) => {
        button.addEventListener('click', () => {
            type = button.dataset.filterType || 'all';
            setActiveButton('[data-filter-type]', button);
            applyFilters();
        });
    });

    searchPage.querySelectorAll('[data-sort]').forEach((button) => {
        button.addEventListener('click', () => {
            sortMode = button.dataset.sort || 'default';
            setActiveButton('[data-sort]', button);
            applyFilters();
        });
    });

    applyFilters();
}

const preparePlayer = async (video, src) => {
    if (!video || !src || video.dataset.ready === 'true') {
        return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl') || video.canPlayType('application/x-mpegURL')) {
        video.src = src;
        video.dataset.ready = 'true';
        return;
    }

    const Hls = window.Hls;

    if (Hls && Hls.isSupported()) {
        const hls = new Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(src);
        hls.attachMedia(video);
        video.hlsInstance = hls;
        video.dataset.ready = 'true';
        return;
    }

    video.src = src;
    video.dataset.ready = 'true';
};

document.querySelectorAll('[data-player]').forEach((player) => {
    const video = player.querySelector('video');
    const source = video ? video.querySelector('source') : null;
    const button = player.querySelector('.play-cover');
    const src = source ? source.src : '';

    const start = async () => {
        await preparePlayer(video, src);
        player.classList.add('playing');
        const playPromise = video.play();

        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(() => {
                player.classList.remove('playing');
            });
        }
    };

    if (button) {
        button.addEventListener('click', start);
    }

    if (video) {
        video.addEventListener('play', () => player.classList.add('playing'));
        video.addEventListener('pause', () => {
            if (video.currentTime === 0 || video.ended) {
                player.classList.remove('playing');
            }
        });
    }
});
