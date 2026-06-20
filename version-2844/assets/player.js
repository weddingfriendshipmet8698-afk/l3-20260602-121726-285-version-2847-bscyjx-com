(function () {
  var ready = function (fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  };

  ready(function () {
    document.querySelectorAll("[data-player]").forEach(function (root) {
      var video = root.querySelector("video[data-stream]");
      var trigger = root.querySelector("[data-play-trigger]");
      var stream = video ? video.getAttribute("data-stream") : "";
      var prepared = false;
      var hls = null;

      if (!video || !trigger || !stream) {
        return;
      }

      var setReady = function () {
        if (prepared) {
          return true;
        }
        prepared = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
          return true;
        }

        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hls.loadSource(stream);
          hls.attachMedia(video);
          return true;
        }

        trigger.querySelector("strong").textContent = "视频加载失败，请稍后再试";
        return false;
      };

      var start = function () {
        if (!setReady()) {
          return;
        }
        root.classList.add("is-playing");
        trigger.hidden = true;
        var playTask = video.play();
        if (playTask && playTask.catch) {
          playTask.catch(function () {
            root.classList.remove("is-playing");
            trigger.hidden = false;
          });
        }
      };

      trigger.addEventListener("click", start);
      video.addEventListener("click", function () {
        if (video.paused) {
          start();
        }
      });
      video.addEventListener("play", function () {
        root.classList.add("is-playing");
        trigger.hidden = true;
      });
      video.addEventListener("ended", function () {
        root.classList.remove("is-playing");
        trigger.hidden = false;
      });
      window.addEventListener("beforeunload", function () {
        if (hls && hls.destroy) {
          hls.destroy();
        }
      });
    });
  });
})();
