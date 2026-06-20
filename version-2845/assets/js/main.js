(function() {
  var menuButton = document.querySelector('[data-menu-toggle]');
  if (menuButton) {
    menuButton.addEventListener('click', function() {
      document.body.classList.toggle('nav-open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var active = 0;

    function showSlide(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function(slide, i) {
        slide.classList.toggle('active', i === active);
      });
      dots.forEach(function(dot, i) {
        dot.classList.toggle('active', i === active);
      });
    }

    dots.forEach(function(dot, i) {
      dot.addEventListener('click', function() {
        showSlide(i);
      });
    });

    if (slides.length > 1) {
      setInterval(function() {
        showSlide(active + 1);
      }, 5200);
    }
  }

  var searchInput = document.querySelector('[data-movie-search]');
  var list = document.querySelector('[data-movie-list]');
  if (searchInput && list) {
    var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));
    searchInput.addEventListener('input', function() {
      var keyword = searchInput.value.trim().toLowerCase();
      cards.forEach(function(card) {
        var text = [
          card.getAttribute('data-title'),
          card.getAttribute('data-year'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-region'),
          card.textContent
        ].join(' ').toLowerCase();
        card.classList.toggle('hidden-card', keyword && text.indexOf(keyword) === -1);
      });
    });
  }
})();
