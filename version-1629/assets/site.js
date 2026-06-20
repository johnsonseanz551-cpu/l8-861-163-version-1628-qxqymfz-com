
(function () {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  function initNav() {
    const toggle = $(".js-nav-toggle");
    const mobileNav = $(".js-mobile-nav");
    if (toggle && mobileNav) {
      toggle.addEventListener("click", () => {
        mobileNav.classList.toggle("open");
      });
    }
  }

  function initBackToTop() {
    const btn = $(".js-back-to-top");
    if (!btn) return;
    const handle = () => {
      btn.classList.toggle("show", window.scrollY > 500);
    };
    window.addEventListener("scroll", handle, { passive: true });
    handle();
    btn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  function initHeroSlider() {
    const slider = $(".js-hero-slider");
    if (!slider) return;
    const slides = $$(".hero-slide", slider);
    const prev = $(".js-hero-prev");
    const next = $(".js-hero-next");
    if (!slides.length) return;

    let index = slides.findIndex((el) => el.classList.contains("active"));
    if (index < 0) index = 0;

    const show = (n) => {
      slides[index].classList.remove("active");
      index = (n + slides.length) % slides.length;
      slides[index].classList.add("active");
    };

    if (prev) prev.addEventListener("click", () => show(index - 1));
    if (next) next.addEventListener("click", () => show(index + 1));
    setInterval(() => show(index + 1), 6500);
  }

  function initMovieFilters() {
    const input = $(".js-filter-input");
    const select = $(".js-filter-select");
    const cards = $$(".js-movie-card");
    if (!input && !select) return;

    const apply = () => {
      const q = (input?.value || "").trim().toLowerCase();
      const cat = (select?.value || "").trim();
      cards.forEach((card) => {
        const text = (card.dataset.search || "").toLowerCase();
        const category = card.dataset.category || "";
        const matchQuery = !q || text.includes(q);
        const matchCat = !cat || cat === "all" || category === cat;
        card.style.display = matchQuery && matchCat ? "" : "none";
      });
    };

    input?.addEventListener("input", apply);
    select?.addEventListener("change", apply);
    apply();
  }

  function initPlayer() {
    const videos = $$("video[data-m3u8], video[data-mp4]");
    if (!videos.length) return;

    videos.forEach((video) => {
      const mp4 = video.dataset.mp4;
      const m3u8 = video.dataset.m3u8;
      const poster = video.dataset.poster;

      if (poster) video.setAttribute("poster", poster);

      // Prefer HLS when the browser can handle it directly or when Hls.js is present.
      if (m3u8 && window.Hls && window.Hls.isSupported()) {
        const hls = new window.Hls();
        hls.loadSource(m3u8);
        hls.attachMedia(video);
      } else if (m3u8 && video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = m3u8;
      } else if (mp4) {
        video.src = mp4;
      }
    });

    $$(".tab-btn[data-src]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const video = $(".player-shell video");
        if (!video) return;
        $$(".tab-btn[data-src]").forEach((el) => el.classList.remove("active"));
        btn.classList.add("active");
        const src = btn.dataset.src || "";
        const type = btn.dataset.type || "";
        video.pause();
        video.removeAttribute("src");
        video.load();
        if (type === "m3u8" && video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = src;
        } else if (type === "mp4" || src) {
          video.src = src;
        }
        video.play().catch(() => {});
      });
    });
  }

  async function initSearchPage() {
    const root = $(".js-search-page");
    if (!root) return;
    const grid = $(".js-search-results", root);
    const qInput = $(".js-search-q", root);
    const yearSelect = $(".js-search-year", root);
    const catSelect = $(".js-search-cat", root);
    const count = $(".js-search-count", root);

    let data = Array.isArray(window.MOVIES_DATA) ? window.MOVIES_DATA : [];
    if (!data.length) {
      try {
        const res = await fetch("assets/movies.json", { cache: "no-store" });
        data = await res.json();
      } catch (err) {
        if (grid) grid.innerHTML = '<div class="loading">搜索数据加载失败，请检查本地文件是否完整。</div>';
        return;
      }
    }

    const params = new URLSearchParams(window.location.search);
    if (qInput && params.get("q")) qInput.value = params.get("q");
    if (catSelect && params.get("cat")) catSelect.value = params.get("cat");
    if (yearSelect && params.get("year")) yearSelect.value = params.get("year");

    const render = () => {
      const q = (qInput?.value || "").trim().toLowerCase();
      const year = (yearSelect?.value || "").trim();
      const cat = (catSelect?.value || "").trim();

      const filtered = data.filter((m) => {
        const text = [
          m.title, m.region, m.type, m.genre, (m.tags || []).join(" "), m.one_line, m.summary, m.review
        ].join(" ").toLowerCase();

        const matchQ = !q || text.includes(q);
        const matchYear = !year || year === "all" || String(m.year) === year;
        const matchCat = !cat || cat === "all" || m.category === cat;
        return matchQ && matchYear && matchCat;
      });

      if (count) count.textContent = `${filtered.length} 部影片`;
      if (grid) {
        grid.innerHTML = filtered.slice(0, 240).map((m) => `
          <a class="movie-card" href="${m.detail_url}">
            <div class="movie-poster">
              <img src="${m.poster}" alt="${escapeHtml(m.title)}" loading="lazy">
              <div class="movie-badges">
                <span class="tag">${escapeHtml(m.category_name)}</span>
                <span class="tag">${escapeHtml(String(m.year))}</span>
              </div>
            </div>
            <div class="movie-body">
              <h3>${escapeHtml(m.title)}</h3>
              <div class="movie-meta">
                <span>${escapeHtml(m.region)}</span>
                <span>${escapeHtml(m.type)}</span>
              </div>
              <p class="movie-excerpt">${escapeHtml(m.one_line || "").slice(0, 80)}${(m.one_line || "").length > 80 ? "…" : ""}</p>
            </div>
          </a>
        `).join("") || '<div class="loading">没有找到匹配结果。</div>';
      }
    };

    [qInput, yearSelect, catSelect].forEach((el) => el && el.addEventListener("input", render));
    [yearSelect, catSelect].forEach((el) => el && el.addEventListener("change", render));
    render();
  }

  function escapeHtml(str) {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  window.addEventListener("DOMContentLoaded", () => {
    initNav();
    initBackToTop();
    initHeroSlider();
    initMovieFilters();
    initPlayer();
    initSearchPage();
  });
})();
