(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobileMenu = document.querySelector('[data-mobile-menu]');

    if (menuButton && mobileMenu) {
        menuButton.addEventListener('click', function () {
            var isHidden = mobileMenu.hasAttribute('hidden');
            if (isHidden) {
                mobileMenu.removeAttribute('hidden');
            } else {
                mobileMenu.setAttribute('hidden', 'hidden');
            }
        });
    }

    var hero = document.querySelector('[data-hero-slider]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        }

        function startHero() {
            clearInterval(timer);
            timer = setInterval(function () {
                showSlide(current + 1);
            }, 5000);
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
                startHero();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(current - 1);
                startHero();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(current + 1);
                startHero();
            });
        }

        showSlide(0);
        startHero();
    }

    var cardList = document.querySelector('[data-card-list]');
    var searchInput = document.querySelector('[data-search-input]');
    var filterFields = Array.prototype.slice.call(document.querySelectorAll('[data-filter]'));
    var resultText = document.querySelector('[data-filter-result]');

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function updateCards() {
        if (!cardList) {
            return;
        }

        var cards = Array.prototype.slice.call(cardList.querySelectorAll('[data-card]'));
        var query = normalize(searchInput ? searchInput.value : '');
        var filters = {};

        filterFields.forEach(function (field) {
            var name = field.getAttribute('data-filter');
            filters[name] = normalize(field.value);
        });

        var visible = 0;

        cards.forEach(function (card) {
            var haystack = normalize(card.getAttribute('data-search') || card.textContent);
            var matched = !query || haystack.indexOf(query) !== -1;

            Object.keys(filters).forEach(function (key) {
                if (!filters[key]) {
                    return;
                }

                var value = normalize(card.getAttribute('data-' + key));

                if (value !== filters[key]) {
                    matched = false;
                }
            });

            card.classList.toggle('is-hidden', !matched);

            if (matched) {
                visible += 1;
            }
        });

        if (resultText) {
            resultText.textContent = '当前显示 ' + visible + ' 部影片';
        }
    }

    if (searchInput) {
        searchInput.addEventListener('input', updateCards);
    }

    filterFields.forEach(function (field) {
        field.addEventListener('change', updateCards);
    });

    updateCards();

    function loadHls(callback) {
        var existing = document.querySelector('script[data-hls-loader]');

        if (window.Hls) {
            callback();
            return;
        }

        if (existing) {
            existing.addEventListener('load', callback, { once: true });
            existing.addEventListener('error', callback, { once: true });
            return;
        }

        var script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.17/dist/hls.min.js';
        script.async = true;
        script.setAttribute('data-hls-loader', 'true');
        script.onload = callback;
        script.onerror = callback;
        document.head.appendChild(script);
    }

    function markReady(video, panel, callback) {
        if (video.getAttribute('data-source-ready') === 'true') {
            if (callback) {
                callback();
            }
            return;
        }

        video.setAttribute('data-source-ready', 'true');
        video.removeAttribute('data-source-loading');
        panel.classList.add('is-ready');
        video.dispatchEvent(new Event('hls-ready'));

        if (callback) {
            callback();
        }
    }

    function attachSource(video, source, panel, callback) {
        var isReady = video.getAttribute('data-source-ready') === 'true';
        var isLoading = video.getAttribute('data-source-loading') === 'true';

        if (!video || !source) {
            return;
        }

        if (isReady) {
            if (callback) {
                callback();
            }
            return;
        }

        if (isLoading) {
            var readyHandler = function () {
                if (callback) {
                    callback();
                }
            };

            video.addEventListener('hls-ready', readyHandler, { once: true });
            video.addEventListener('loadedmetadata', readyHandler, { once: true });
            return;
        }

        video.setAttribute('data-source-loading', 'true');

        function nativeAttach() {
            video.src = source;
            video.load();
            video.addEventListener('loadedmetadata', function () {
                markReady(video, panel, callback);
            }, { once: true });
            setTimeout(function () {
                markReady(video, panel, callback);
            }, 900);
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            nativeAttach();
            return;
        }

        loadHls(function () {
            if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });

                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    markReady(video, panel, callback);
                });

                hls.on(window.Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal) {
                        try {
                            hls.destroy();
                        } catch (error) {
                            video.hlsInstance = null;
                        }

                        nativeAttach();
                    }
                });

                hls.loadSource(source);
                hls.attachMedia(video);
                video.hlsInstance = hls;
            } else {
                nativeAttach();
            }
        });
    }

    function playVideo(video, panel) {
        var playAttempt = video.play();

        if (playAttempt && typeof playAttempt.then === 'function') {
            playAttempt.then(function () {
                panel.classList.add('is-playing');
            }).catch(function () {
                panel.classList.remove('is-playing');
            });
        } else {
            panel.classList.add('is-playing');
        }
    }

    Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(function (panel) {
        var source = panel.getAttribute('data-src');
        var video = panel.querySelector('video');
        var button = panel.querySelector('[data-play-button]');

        if (!video || !source) {
            return;
        }

        attachSource(video, source, panel);

        function prepareAndPlay() {
            attachSource(video, source, panel, function () {
                playVideo(video, panel);
            });
        }

        if (button) {
            button.addEventListener('click', prepareAndPlay);
        }

        video.addEventListener('click', function () {
            attachSource(video, source, panel);
        });

        video.addEventListener('play', function () {
            panel.classList.add('is-playing');
        });

        video.addEventListener('pause', function () {
            if (video.currentTime === 0 || video.ended) {
                panel.classList.remove('is-playing');
            }
        });
    });
}());
