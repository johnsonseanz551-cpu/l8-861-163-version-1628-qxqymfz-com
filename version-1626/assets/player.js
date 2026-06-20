(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function () {
    var widgets = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));

    widgets.forEach(function (widget) {
      var video = widget.querySelector("video");
      var button = widget.querySelector("button");
      var prepared = false;
      var hlsInstance = null;

      function prepare() {
        if (prepared || !video) {
          return;
        }

        var stream = video.getAttribute("data-stream");

        if (!stream) {
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });
          hlsInstance.loadSource(stream);
          hlsInstance.attachMedia(video);
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
        }

        prepared = true;
      }

      function play() {
        prepare();

        if (!video) {
          return;
        }

        var promise = video.play();

        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {
            widget.classList.remove("playing");
          });
        }
      }

      if (button) {
        button.addEventListener("click", play);
      }

      if (video) {
        video.addEventListener("click", function () {
          if (video.paused) {
            play();
          }
        });

        video.addEventListener("play", function () {
          widget.classList.add("playing");
        });

        video.addEventListener("pause", function () {
          widget.classList.remove("playing");
        });

        video.addEventListener("ended", function () {
          widget.classList.remove("playing");
        });
      }

      window.addEventListener("pagehide", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
          hlsInstance = null;
        }
      });
    });
  });
})();
