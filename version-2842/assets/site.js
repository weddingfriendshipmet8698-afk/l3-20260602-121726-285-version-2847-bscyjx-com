(function () {
  function closestHeaderSearch(input) {
    var parent = input.closest('.header-search') || input.closest('.hero-search-panel') || input.parentElement;
    return parent ? parent.querySelector('.global-search-results') : null;
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[char];
    });
  }

  function renderSearch(input) {
    var results = closestHeaderSearch(input);
    if (!results || !Array.isArray(window.SEARCH_INDEX)) {
      return;
    }
    var query = normalize(input.value);
    if (!query) {
      results.classList.remove('is-open');
      results.innerHTML = '';
      return;
    }
    var matches = window.SEARCH_INDEX.filter(function (item) {
      return normalize(item.title + ' ' + item.year + ' ' + item.type + ' ' + item.region + ' ' + item.category + ' ' + item.text).indexOf(query) !== -1;
    }).slice(0, 10);
    results.innerHTML = matches.map(function (item) {
      return '<a class="search-item" href="' + escapeHtml(item.url) + '">' +
        '<img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '">' +
        '<div><h3>' + escapeHtml(item.title) + '</h3><p>' + escapeHtml(item.region) + ' · ' + escapeHtml(item.type) + ' · ' + escapeHtml(item.year) + '</p></div>' +
        '</a>';
    }).join('');
    results.classList.toggle('is-open', matches.length > 0);
  }

  document.querySelectorAll('.global-search-input').forEach(function (input) {
    input.addEventListener('input', function () {
      renderSearch(input);
    });
    input.addEventListener('focus', function () {
      renderSearch(input);
    });
  });

  document.addEventListener('click', function (event) {
    if (!event.target.closest('.header-search') && !event.target.closest('.hero-search-panel')) {
      document.querySelectorAll('.global-search-results').forEach(function (box) {
        box.classList.remove('is-open');
      });
    }
  });

  var toggle = document.querySelector('.mobile-toggle');
  var mobileNav = document.querySelector('.mobile-nav');
  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
    var input = scope.querySelector('.local-filter-input');
    var selects = scope.querySelectorAll('.local-filter-select');
    var list = document.querySelector('[data-card-list]');
    if (!list) {
      return;
    }
    var cards = Array.prototype.slice.call(list.querySelectorAll('[data-card]'));
    function applyFilter() {
      var q = normalize(input ? input.value : '');
      var active = {};
      selects.forEach(function (select) {
        active[select.getAttribute('data-filter')] = normalize(select.value);
      });
      cards.forEach(function (card) {
        var text = normalize(card.dataset.title + ' ' + card.dataset.genre + ' ' + card.dataset.tags + ' ' + card.dataset.year + ' ' + card.dataset.region + ' ' + card.dataset.type);
        var ok = !q || text.indexOf(q) !== -1;
        Object.keys(active).forEach(function (key) {
          if (active[key] && normalize(card.dataset[key]) !== active[key]) {
            ok = false;
          }
        });
        card.classList.toggle('is-hidden', !ok);
      });
    }
    if (input) {
      input.addEventListener('input', applyFilter);
    }
    selects.forEach(function (select) {
      select.addEventListener('change', applyFilter);
    });
  });

  document.querySelectorAll('[data-hero-slider]').forEach(function (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    if (!slides.length) {
      return;
    }
    var index = 0;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
      });
    });
    setInterval(function () {
      show(index + 1);
    }, 5200);
  });

  function loadHlsScript() {
    return new Promise(function (resolve, reject) {
      if (window.Hls) {
        resolve();
        return;
      }
      var existing = document.querySelector('script[data-hls-loader]');
      if (existing) {
        existing.addEventListener('load', resolve, { once: true });
        existing.addEventListener('error', reject, { once: true });
        return;
      }
      var script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.18/dist/hls.min.js';
      script.async = true;
      script.setAttribute('data-hls-loader', 'true');
      script.addEventListener('load', resolve, { once: true });
      script.addEventListener('error', reject, { once: true });
      document.head.appendChild(script);
    });
  }

  function startVideo(video) {
    var playRequest = video.play();
    if (playRequest && typeof playRequest.catch === 'function') {
      playRequest.catch(function () {});
    }
  }

  window.initMoviePlayer = function (url) {
    var wrap = document.querySelector('[data-player]');
    if (!wrap) {
      return;
    }
    var video = wrap.querySelector('video');
    var cover = wrap.querySelector('.player-cover');
    var ready = false;
    var preparing = false;

    function reveal() {
      if (cover) {
        cover.classList.add('is-hidden');
      }
      video.setAttribute('controls', 'controls');
    }

    function prepare() {
      if (ready) {
        return Promise.resolve();
      }
      if (preparing) {
        return new Promise(function (resolve) {
          video.addEventListener('canplay', resolve, { once: true });
          setTimeout(resolve, 2400);
        });
      }
      preparing = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
        video.load();
        ready = true;
        return Promise.resolve();
      }
      return loadHlsScript().then(function () {
        if (window.Hls && window.Hls.isSupported()) {
          return new Promise(function (resolve) {
            var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true, backBufferLength: 90 });
            hls.loadSource(url);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
              ready = true;
              resolve();
            });
            hls.on(window.Hls.Events.ERROR, function () {
              ready = true;
              resolve();
            });
            setTimeout(function () {
              ready = true;
              resolve();
            }, 3200);
          });
        }
        video.src = url;
        video.load();
        ready = true;
        return Promise.resolve();
      }).catch(function () {
        video.src = url;
        video.load();
        ready = true;
      });
    }

    function play() {
      reveal();
      prepare().then(function () {
        startVideo(video);
      });
    }

    if (cover) {
      cover.addEventListener('click', play);
    }
    video.addEventListener('click', function () {
      if (!ready) {
        play();
      }
    });
    prepare();
  };
})();
