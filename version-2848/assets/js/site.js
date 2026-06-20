(function () {
  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function initMenu() {
    var toggle = document.querySelector(".nav-toggle");
    var menu = document.querySelector(".nav-menu");
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener("click", function () {
      var open = menu.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function initHero() {
    var slider = document.querySelector("[data-hero-slider]");
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
    var prev = slider.querySelector("[data-hero-prev]");
    var next = slider.querySelector("[data-hero-next]");
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;
    function show(target) {
      index = (target + slides.length) % slides.length;
      slides.forEach(function (slide, pos) {
        slide.classList.toggle("is-active", pos === index);
      });
      dots.forEach(function (dot, pos) {
        dot.classList.toggle("is-active", pos === index);
      });
    }
    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }
    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }
    dots.forEach(function (dot, pos) {
      dot.addEventListener("click", function () {
        show(pos);
        start();
      });
    });
    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }
    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function fillSelect(select, values) {
    if (!select) {
      return;
    }
    values.forEach(function (value) {
      if (!value) {
        return;
      }
      var option = document.createElement("option");
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  }

  function initFilters() {
    var panel = document.querySelector("[data-filter-panel]");
    var list = document.querySelector("[data-card-list]");
    if (!panel || !list) {
      return;
    }
    var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card, .rank-row"));
    var input = panel.querySelector("[data-filter-input]");
    var yearSelect = panel.querySelector("[data-year-filter]");
    var regionSelect = panel.querySelector("[data-region-filter]");
    var categorySelect = panel.querySelector("[data-category-filter]");
    var empty = panel.querySelector("[data-filter-empty]");
    var years = [];
    var regions = [];
    cards.forEach(function (card) {
      var year = card.getAttribute("data-year") || "";
      var region = card.getAttribute("data-region") || "";
      if (year && years.indexOf(year) === -1) {
        years.push(year);
      }
      if (region && regions.indexOf(region) === -1) {
        regions.push(region);
      }
    });
    years.sort().reverse();
    regions.sort();
    fillSelect(yearSelect, years);
    fillSelect(regionSelect, regions);
    function apply() {
      var keyword = normalize(input ? input.value : "");
      var year = yearSelect ? yearSelect.value : "all";
      var region = regionSelect ? regionSelect.value : "all";
      var category = categorySelect ? categorySelect.value : "all";
      var hasVisible = false;
      cards.forEach(function (card) {
        var text = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-tags"),
          card.textContent
        ].join(" "));
        var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
        var matchYear = year === "all" || card.getAttribute("data-year") === year;
        var matchRegion = region === "all" || card.getAttribute("data-region") === region;
        var matchCategory = category === "all" || card.getAttribute("data-category") === category;
        var visible = matchKeyword && matchYear && matchRegion && matchCategory;
        card.classList.toggle("is-hidden", !visible);
        if (visible) {
          hasVisible = true;
        }
      });
      if (empty) {
        empty.hidden = hasVisible;
      }
    }
    if (input) {
      input.addEventListener("input", apply);
      var params = new URLSearchParams(window.location.search);
      var query = params.get("q");
      if (query) {
        input.value = query;
      }
    }
    [yearSelect, regionSelect, categorySelect].forEach(function (select) {
      if (select) {
        select.addEventListener("change", apply);
      }
    });
    apply();
  }

  document.addEventListener("DOMContentLoaded", function () {
    initMenu();
    initHero();
    initFilters();
  });
})();
