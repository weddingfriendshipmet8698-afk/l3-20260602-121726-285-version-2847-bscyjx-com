const ready = (fn) => {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", fn);
  } else {
    fn();
  }
};

ready(() => {
  bindMenu();
  bindSearchForms();
  bindHero();
  bindFilters();
  bindPlayers();
});

function bindMenu() {
  const button = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".main-nav");
  if (!button || !nav) return;
  button.addEventListener("click", () => {
    nav.classList.toggle("open");
  });
}

function bindSearchForms() {
  document.querySelectorAll(".search-form").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const input = form.querySelector("input[name='q']");
      const query = input ? input.value.trim() : "";
      const action = form.getAttribute("action") || "search.html";
      if (query) {
        window.location.href = `${action}?q=${encodeURIComponent(query)}`;
      } else {
        window.location.href = action;
      }
    });
  });
}

function bindHero() {
  const slides = Array.from(document.querySelectorAll(".hero-slide"));
  const dots = Array.from(document.querySelectorAll(".hero-dots button"));
  if (!slides.length) return;
  let index = 0;
  const show = (next) => {
    index = (next + slides.length) % slides.length;
    slides.forEach((slide, i) => slide.classList.toggle("active", i === index));
    dots.forEach((dot, i) => dot.classList.toggle("active", i === index));
  };
  dots.forEach((dot, i) => dot.addEventListener("click", () => show(i)));
  show(0);
  window.setInterval(() => show(index + 1), 5200);
}

function bindFilters() {
  document.querySelectorAll(".filter-panel").forEach((panel) => {
    const input = panel.querySelector("input");
    const select = panel.querySelector("select");
    const grid = document.querySelector(panel.getAttribute("data-target") || ".card-grid");
    if (!grid) return;
    const cards = Array.from(grid.querySelectorAll(".movie-card"));
    const apply = () => {
      const keyword = input ? input.value.trim().toLowerCase() : "";
      cards.forEach((card) => {
        const haystack = [
          card.dataset.title || "",
          card.dataset.region || "",
          card.dataset.genre || ""
        ].join(" ").toLowerCase();
        card.style.display = !keyword || haystack.includes(keyword) ? "" : "none";
      });
      if (select) {
        const sorted = [...cards].sort((a, b) => {
          if (select.value === "year") return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
          if (select.value === "title") return (a.dataset.title || "").localeCompare(b.dataset.title || "", "zh-Hans-CN");
          return Number(b.dataset.score || 0) - Number(a.dataset.score || 0);
        });
        sorted.forEach((card) => grid.appendChild(card));
      }
    };
    if (input) input.addEventListener("input", apply);
    if (select) select.addEventListener("change", apply);
    apply();
  });
}

function bindPlayers() {
  document.querySelectorAll(".player-stage").forEach((stage) => {
    const video = stage.querySelector("video");
    const button = stage.querySelector(".play-overlay button");
    const note = stage.parentElement ? stage.parentElement.querySelector(".player-note") : null;
    if (!video || !button) return;
    const url = video.getAttribute("data-video-url");
    let loaded = false;
    button.addEventListener("click", async () => {
      if (!loaded) {
        await loadStream(video, url, note);
        loaded = true;
      }
      stage.classList.add("ready");
      const play = video.play();
      if (play && typeof play.catch === "function") {
        play.catch(() => {
          if (note) note.textContent = "点击视频控制栏可继续播放。";
        });
      }
    });
  });
}

async function loadStream(video, url, note) {
  if (!url) {
    if (note) note.textContent = "播放遇到问题，请稍后重试。";
    return;
  }
  if (video.canPlayType("application/vnd.apple.mpegurl")) {
    video.src = url;
    return;
  }
  try {
    const module = await import("./hls-dru42stk.js");
    const Hls = module.H || module.default;
    if (Hls && Hls.isSupported()) {
      const hls = new Hls({
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hls.loadSource(url);
      hls.attachMedia(video);
      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data && data.fatal && note) {
          note.textContent = "播放遇到问题，请刷新后重试。";
        }
      });
      return;
    }
  } catch (error) {
    if (note) note.textContent = "播放组件载入失败，请稍后重试。";
    return;
  }
  if (note) note.textContent = "播放遇到问题，请稍后重试。";
}
