(function () {
  var ready = function (fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  };

  var normalize = function (value) {
    return (value || "").toString().trim().toLowerCase();
  };

  ready(function () {
    var menuButton = document.querySelector("[data-menu-toggle]");
    var mobileMenu = document.querySelector("[data-mobile-menu]");

    if (menuButton && mobileMenu) {
      menuButton.addEventListener("click", function () {
        mobileMenu.classList.toggle("open");
      });
    }

    var hero = document.querySelector("[data-hero]");
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var prev = hero.querySelector("[data-hero-prev]");
      var next = hero.querySelector("[data-hero-next]");
      var current = 0;
      var timer = null;

      var show = function (index) {
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle("is-active", i === current);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle("active", i === current);
        });
      };

      var start = function () {
        window.clearInterval(timer);
        timer = window.setInterval(function () {
          show(current + 1);
        }, 5600);
      };

      if (slides.length > 1) {
        if (prev) {
          prev.addEventListener("click", function () {
            show(current - 1);
            start();
          });
        }
        if (next) {
          next.addEventListener("click", function () {
            show(current + 1);
            start();
          });
        }
        dots.forEach(function (dot) {
          dot.addEventListener("click", function () {
            show(parseInt(dot.getAttribute("data-hero-dot"), 10));
            start();
          });
        });
        start();
      }
    }

    document.querySelectorAll("[data-local-filter]").forEach(function (input) {
      var scope = document.querySelector("[data-filter-scope]");
      var empty = document.querySelector("[data-empty-state]");
      if (!scope) {
        return;
      }
      var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-search-card]"));
      var applyLocal = function () {
        var keyword = normalize(input.value);
        var shown = 0;
        cards.forEach(function (card) {
          var match = normalize(card.getAttribute("data-title")).indexOf(keyword) !== -1;
          card.hidden = !match;
          if (match) {
            shown += 1;
          }
        });
        if (empty) {
          empty.hidden = shown !== 0;
        }
      };
      input.addEventListener("input", applyLocal);
      applyLocal();
    });

    var searchPanel = document.querySelector("[data-search-panel]");
    if (searchPanel) {
      var params = new URLSearchParams(window.location.search);
      var input = searchPanel.querySelector("[data-search-input]");
      var region = searchPanel.querySelector("[data-filter-region]");
      var year = searchPanel.querySelector("[data-filter-year]");
      var genre = searchPanel.querySelector("[data-filter-genre]");
      var sort = searchPanel.querySelector("[data-sort]");
      var reset = searchPanel.querySelector("[data-search-reset]");
      var grid = document.querySelector("[data-search-results]");
      var empty = document.querySelector("[data-search-empty]");
      var cards = grid ? Array.prototype.slice.call(grid.querySelectorAll("[data-search-card]")) : [];

      if (input && params.get("q")) {
        input.value = params.get("q");
      }

      var applySearch = function () {
        var keyword = normalize(input && input.value);
        var regionValue = region ? region.value : "";
        var yearValue = year ? year.value : "";
        var genreValue = genre ? genre.value : "";
        var visible = [];

        cards.forEach(function (card) {
          var text = normalize(card.getAttribute("data-title"));
          var ok = true;
          if (keyword && text.indexOf(keyword) === -1) {
            ok = false;
          }
          if (regionValue && card.getAttribute("data-region") !== regionValue) {
            ok = false;
          }
          if (yearValue && card.getAttribute("data-year") !== yearValue) {
            ok = false;
          }
          if (genreValue && card.getAttribute("data-genre") !== genreValue) {
            ok = false;
          }
          card.hidden = !ok;
          if (ok) {
            visible.push(card);
          }
        });

        if (sort && grid) {
          var mode = sort.value;
          visible.sort(function (a, b) {
            if (mode === "popular") {
              return Number(b.getAttribute("data-views")) - Number(a.getAttribute("data-views"));
            }
            if (mode === "rating") {
              return Number(b.getAttribute("data-rating")) - Number(a.getAttribute("data-rating"));
            }
            return parseInt(b.getAttribute("data-year"), 10) - parseInt(a.getAttribute("data-year"), 10);
          });
          visible.forEach(function (card) {
            grid.appendChild(card);
          });
        }

        if (empty) {
          empty.hidden = visible.length !== 0;
        }
      };

      [input, region, year, genre, sort].forEach(function (node) {
        if (node) {
          node.addEventListener("input", applySearch);
          node.addEventListener("change", applySearch);
        }
      });

      if (reset) {
        reset.addEventListener("click", function () {
          if (input) {
            input.value = "";
          }
          if (region) {
            region.value = "";
          }
          if (year) {
            year.value = "";
          }
          if (genre) {
            genre.value = "";
          }
          if (sort) {
            sort.value = "newest";
          }
          applySearch();
        });
      }

      applySearch();
    }
  });
})();
