(function () {
  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function initNav() {
    var toggle = $('[data-nav-toggle]');
    var nav = $('[data-main-nav]');
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  function initHero() {
    var hero = $('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = $all('.hero-slide', hero);
    var dots = $all('[data-hero-dot]', hero);
    var prev = $('[data-hero-prev]', hero);
    var next = $('[data-hero-next]', hero);
    var index = 0;
    var timer;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }

    function play() {
      clearInterval(timer);
      timer = setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        play();
      });
    });

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

    show(0);
    play();
  }

  function initSearch() {
    var input = $('#siteSearchInput');
    var clear = $('#siteSearchClear');
    var grid = $('#siteSearchGrid');
    var count = $('#siteSearchCount');
    if (!input || !grid) {
      return;
    }
    var cards = $all('.movie-card', grid);
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    input.value = query;

    function apply() {
      var value = input.value.trim().toLowerCase();
      var visible = 0;
      cards.forEach(function (card) {
        var text = (card.getAttribute('data-search') || '').toLowerCase();
        var match = value === '' || text.indexOf(value) !== -1;
        card.style.display = match ? '' : 'none';
        if (match) {
          visible += 1;
        }
      });
      if (count) {
        count.textContent = value ? '筛选结果：' + visible + ' 部影片' : '输入关键词后可筛选影片';
      }
    }

    input.addEventListener('input', apply);
    if (clear) {
      clear.addEventListener('click', function () {
        input.value = '';
        apply();
        input.focus();
      });
    }
    apply();
  }

  function initPlayer() {
    var shell = $('.player-shell');
    var video = $('.movie-video');
    var overlay = $('.player-overlay');
    if (!shell || !video || !overlay) {
      return;
    }
    var source = overlay.getAttribute('data-player-src');
    var started = false;

    function start() {
      if (!source) {
        return;
      }
      shell.classList.add('playing');
      if (!started) {
        started = true;
        if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(source);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {});
          });
        } else {
          video.src = source;
          video.addEventListener('loadedmetadata', function () {
            video.play().catch(function () {});
          }, { once: true });
          video.load();
        }
      } else {
        video.play().catch(function () {});
      }
    }

    overlay.addEventListener('click', start);
    video.addEventListener('click', function () {
      if (video.paused) {
        start();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initNav();
    initHero();
    initSearch();
    initPlayer();
  });
})();
