(function () {
  var header = document.querySelector('[data-header]');
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  function syncHeader() {
    if (!header) {
      return;
    }
    header.classList.toggle('is-scrolled', window.scrollY > 16);
  }

  window.addEventListener('scroll', syncHeader, { passive: true });
  syncHeader();

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var activeSlide = 0;
  var heroTimer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    activeSlide = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === activeSlide);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === activeSlide);
    });
  }

  function startHeroTimer() {
    if (heroTimer || slides.length < 2) {
      return;
    }
    heroTimer = window.setInterval(function () {
      showSlide(activeSlide + 1);
    }, 5200);
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showSlide(index);
      if (heroTimer) {
        window.clearInterval(heroTimer);
        heroTimer = null;
      }
      startHeroTimer();
    });
  });

  showSlide(0);
  startHeroTimer();

  var pageSearch = document.querySelector('[data-page-search]');
  var filterButtons = Array.prototype.slice.call(document.querySelectorAll('[data-filter-button]'));
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
  var emptyState = document.querySelector('[data-empty-state]');
  var activeFilter = 'all';

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function applyFilters() {
    if (!cards.length) {
      return;
    }
    var query = normalize(pageSearch ? pageSearch.value : '');
    var visible = 0;

    cards.forEach(function (card) {
      var title = normalize(card.getAttribute('data-title'));
      var tags = normalize(card.getAttribute('data-tags'));
      var genre = normalize(card.getAttribute('data-genre'));
      var matchesQuery = !query || title.indexOf(query) > -1 || tags.indexOf(query) > -1;
      var matchesFilter = activeFilter === 'all' || genre.indexOf(normalize(activeFilter)) > -1 || tags.indexOf(normalize(activeFilter)) > -1;
      var show = matchesQuery && matchesFilter;
      card.style.display = show ? '' : 'none';
      if (show) {
        visible += 1;
      }
    });

    if (emptyState) {
      emptyState.classList.toggle('is-visible', visible === 0);
    }
  }

  if (pageSearch) {
    pageSearch.addEventListener('input', applyFilters);
  }

  filterButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      activeFilter = button.getAttribute('data-filter-button') || 'all';
      filterButtons.forEach(function (item) {
        item.classList.toggle('is-active', item === button);
      });
      applyFilters();
    });
  });

  applyFilters();

  var searchInput = document.querySelector('[data-global-search]');
  var searchResult = document.querySelector('[data-search-results]');
  var searchNote = document.querySelector('[data-search-note]');

  function renderSearchResults(query) {
    if (!searchResult || !window.SEARCH_MOVIES) {
      return;
    }
    var value = normalize(query);
    var data = window.SEARCH_MOVIES;
    var results = value
      ? data.filter(function (movie) {
          var pool = normalize(movie.title + ' ' + movie.region + ' ' + movie.type + ' ' + movie.genre + ' ' + movie.tags + ' ' + movie.line);
          return pool.indexOf(value) > -1;
        }).slice(0, 60)
      : data.slice(0, 36);

    searchResult.innerHTML = results.map(function (movie) {
      return '' +
        '<a class="movie-card" href="./' + movie.url + '">' +
          '<span class="poster-wrap">' +
            '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
            '<span class="card-shade"></span>' +
            '<span class="play-chip">立即播放</span>' +
            '<span class="type-chip">' + escapeHtml(movie.type) + '</span>' +
          '</span>' +
          '<span class="card-body">' +
            '<strong>' + escapeHtml(movie.title) + '</strong>' +
            '<small>' + escapeHtml(movie.year + ' · ' + movie.region + ' · ' + movie.genre) + '</small>' +
            '<p>' + escapeHtml(movie.line) + '</p>' +
          '</span>' +
        '</a>';
    }).join('');

    if (searchNote) {
      searchNote.textContent = value ? '已为你筛选匹配内容' : '可输入片名、类型、地区或标签进行搜索';
    }
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  if (searchInput && searchResult) {
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    searchInput.value = query;
    renderSearchResults(query);
    searchInput.addEventListener('input', function () {
      renderSearchResults(searchInput.value);
    });
  }
})();

function initPlayer(source) {
  var video = document.querySelector('[data-player-video]');
  var shell = document.querySelector('[data-player-shell]');
  var button = document.querySelector('[data-player-button]');
  var hlsInstance = null;
  var ready = false;

  if (!video || !shell || !button || !source) {
    return;
  }

  function attachSource() {
    if (ready) {
      return;
    }
    ready = true;

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
      return;
    }

    video.src = source;
  }

  function playVideo() {
    attachSource();
    shell.classList.add('is-playing');
    var promise = video.play();
    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {
        shell.classList.remove('is-playing');
      });
    }
  }

  button.addEventListener('click', playVideo);
  shell.addEventListener('click', function (event) {
    if (!ready && event.target !== video) {
      playVideo();
    }
  });
  video.addEventListener('play', function () {
    shell.classList.add('is-playing');
  });
  video.addEventListener('pause', function () {
    if (video.currentTime === 0 || video.ended) {
      shell.classList.remove('is-playing');
    }
  });
  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
