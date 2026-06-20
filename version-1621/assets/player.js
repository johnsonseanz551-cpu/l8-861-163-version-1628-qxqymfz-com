(function () {
    function attach(video, url) {
        if (!video || !url) {
            return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = url;
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(url);
            hls.attachMedia(video);
            return;
        }

        video.src = url;
    }

    window.MoviePlayer = {
        init: function (url) {
            var video = document.querySelector('.js-video');
            var layer = document.querySelector('.js-play-layer');
            var ready = false;

            function start(event) {
                if (event) {
                    event.preventDefault();
                }

                if (!video) {
                    return;
                }

                if (!ready) {
                    attach(video, url);
                    ready = true;
                }

                if (layer) {
                    layer.classList.add('is-hidden');
                }

                var promise = video.play();
                if (promise && promise.catch) {
                    promise.catch(function () {});
                }
            }

            if (layer) {
                layer.addEventListener('click', start);
            }

            if (video) {
                video.addEventListener('click', function () {
                    if (!ready) {
                        start();
                    }
                });
                video.addEventListener('play', function () {
                    if (layer) {
                        layer.classList.add('is-hidden');
                    }
                });
            }
        }
    };
}());
