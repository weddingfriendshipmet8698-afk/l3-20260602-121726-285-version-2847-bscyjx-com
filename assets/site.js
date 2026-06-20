(function () {
  const hero = document.querySelector("[data-hero]");
  if (hero) {
    const slides = Array.from(hero.querySelectorAll(".hero-slide"));
    const dots = Array.from(hero.querySelectorAll(".hero-dot"));
    let index = 0;
    const show = function (next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    };
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
      });
    });
    if (slides.length > 1) {
      setInterval(function () {
        show(index + 1);
      }, 5600);
    }
  }

  const forms = Array.from(document.querySelectorAll("[data-filter-form]"));
  forms.forEach(function (form) {
    const scope = document.querySelector(form.getAttribute("data-filter-form")) || document;
    const cards = Array.from(scope.querySelectorAll(".movie-card"));
    const input = form.querySelector("[data-keyword]");
    const year = form.querySelector("[data-year]");
    const region = form.querySelector("[data-region]");
    const type = form.querySelector("[data-type]");
    const empty = document.querySelector(form.getAttribute("data-empty"));
    const apply = function () {
      const keyword = (input ? input.value : "").trim().toLowerCase();
      const yearValue = year ? year.value : "";
      const regionValue = region ? region.value : "";
      const typeValue = type ? type.value : "";
      let visible = 0;
      cards.forEach(function (card) {
        const text = [card.dataset.title, card.dataset.genre, card.dataset.region, card.dataset.type, card.dataset.year].join(" ").toLowerCase();
        const okKeyword = !keyword || text.indexOf(keyword) !== -1;
        const okYear = !yearValue || card.dataset.year === yearValue;
        const okRegion = !regionValue || card.dataset.region === regionValue;
        const okType = !typeValue || card.dataset.type === typeValue;
        const ok = okKeyword && okYear && okRegion && okType;
        card.style.display = ok ? "" : "none";
        if (ok) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    };
    [input, year, region, type].forEach(function (el) {
      if (el) {
        el.addEventListener("input", apply);
        el.addEventListener("change", apply);
      }
    });
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      apply();
    });
  });
})();
