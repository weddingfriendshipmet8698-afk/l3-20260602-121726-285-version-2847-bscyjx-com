document.addEventListener("DOMContentLoaded", function () {
  var menuButton = document.querySelector(".menu-toggle");
  var mobileNav = document.querySelector(".mobile-nav");

  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", function () {
      mobileNav.classList.toggle("open");
    });
  }

  var searchInputs = document.querySelectorAll("[data-site-search]");

  searchInputs.forEach(function (input) {
    input.addEventListener("input", function () {
      var query = input.value.trim().toLowerCase();
      var cards = document.querySelectorAll(".movie-card[data-search]");

      cards.forEach(function (card) {
        var text = card.getAttribute("data-search").toLowerCase();
        card.style.display = text.indexOf(query) >= 0 ? "" : "none";
      });
    });
  });

  var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
  var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dots button"));
  var previous = document.querySelector(".hero-control.prev");
  var next = document.querySelector(".hero-control.next");
  var current = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    current = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("active", slideIndex === current);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("active", dotIndex === current);
    });
  }

  if (previous) {
    previous.addEventListener("click", function () {
      showSlide(current - 1);
    });
  }

  if (next) {
    next.addEventListener("click", function () {
      showSlide(current + 1);
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener("click", function () {
      showSlide(index);
    });
  });

  if (slides.length > 1) {
    window.setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  var video = document.querySelector(".movie-player");
  var playButton = document.querySelector(".player-play");
  var playerBox = document.querySelector(".player-box");

  if (video) {
    var src = video.getAttribute("data-src");
    var hlsInstance = null;

    function attachVideo() {
      if (!src) {
        return;
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = src;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ enableWorker: true });
        hlsInstance.loadSource(src);
        hlsInstance.attachMedia(video);
      } else {
        video.src = src;
      }
    }

    function playVideo() {
      if (video.paused) {
        var result = video.play();

        if (result && typeof result.catch === "function") {
          result.catch(function () {});
        }
      }
    }

    attachVideo();

    if (playButton) {
      playButton.addEventListener("click", playVideo);
    }

    video.addEventListener("click", playVideo);
    video.addEventListener("play", function () {
      if (playerBox) {
        playerBox.classList.add("is-playing");
      }
    });
    video.addEventListener("pause", function () {
      if (playerBox) {
        playerBox.classList.remove("is-playing");
      }
    });
    window.addEventListener("beforeunload", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }
});
