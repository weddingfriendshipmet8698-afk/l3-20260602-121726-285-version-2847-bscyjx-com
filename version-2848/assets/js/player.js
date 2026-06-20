(function () {
  window.setupMoviePlayer = function (streamUrl) {
    var video = document.getElementById("movie-player");
    var trigger = document.getElementById("player-trigger");
    var hls = null;
    var ready = false;
    if (!video || !streamUrl) {
      return;
    }
    function bind() {
      if (ready) {
        return;
      }
      ready = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          maxBufferLength: 30,
          enableWorker: true
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        return;
      }
      video.src = streamUrl;
    }
    function play() {
      bind();
      if (trigger) {
        trigger.classList.add("is-hidden");
      }
      var result = video.play();
      if (result && typeof result.catch === "function") {
        result.catch(function () {
          if (trigger) {
            trigger.classList.remove("is-hidden");
          }
        });
      }
    }
    if (trigger) {
      trigger.addEventListener("click", play);
    }
    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      } else {
        video.pause();
      }
    });
    video.addEventListener("play", function () {
      if (trigger) {
        trigger.classList.add("is-hidden");
      }
    });
    video.addEventListener("ended", function () {
      if (trigger) {
        trigger.classList.remove("is-hidden");
      }
    });
    window.addEventListener("beforeunload", function () {
      if (hls) {
        hls.destroy();
      }
    });
  };
})();
