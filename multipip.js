var multiPip = (function () {

    'use strict';

    //
    // Variables
    //

    //Private
    const glOptions = {
        alpha: true,
        antialias: false,
        depth: false,
        failIfMajorPerformanceCaveat: false,
        powerPreference: "high-performance",
        premultipliedAlpha: true,
        preserveDrawingBuffer: false,
        stencil: false,
        desynchronized: false
    }

    const options = {
        endOnLastSourceEnd: false,
        useVideoElementCache: true,
        videoElementCacheSize: 6,
        webglContextAttributes: glOptions
    }

    var _canvas;
    var _videoCtx;
    var _pipVideo;

    //Public
    var publicAPIs = {};

    /**
     * A private methods
     */
    var _initDependecies = function () {
        var script = document.createElement('script');
        script.src = "https://cdn.jsdelivr.net/npm/videocontext@0.54.0/dist/videocontext.min.js";
        document.head.appendChild(script); //or something of the likes
    };


    var _initCanvas = function () {
        _canvas = document.createElement('canvas');
        _canvas.id = "pipCanvas"
        _canvas.hidden = true;
        _canvas.height = window.screen.height;
        _canvas.width = window.screen.width;
        _canvas.style.position = "absolute";
        _canvas.style.zIndex = "-1";
        document.body.insertAdjacentElement('afterbegin', _canvas);
    };

    var _initVideoContext = function () {
        _videoCtx = new VideoContext(_canvas, () => console.error("Sorry, your browser dosen\'t support WebGL"), options);
    }

    var _start = async function () {
        var x = -0.6;
        var y = -0.6;

        for (var i = 1; i < document.getElementsByTagName("video").length; i++) {

            var videoNode = _videoCtx.video(document.getElementsByTagName("video")[i].captureStream());
            videoNode.start(0);

            var translateNode = _videoCtx.effect(VideoContext.DEFINITIONS.AAF_VIDEO_POSITION);
            translateNode.positionOffsetX = x;
            translateNode.positionOffsetY = y;

            x = x + 0.8;
            if (x > 0.8) {
                x = -0.6;
                y = y + 0.8;
            }

            var scaleNode = _videoCtx.effect(VideoContext.DEFINITIONS.AAF_VIDEO_SCALE);
            scaleNode.scaleX = 0.4;
            scaleNode.scaleY = 0.4;

            scaleNode.connect(translateNode);
            videoNode.connect(scaleNode);

            translateNode.connect(_videoCtx.destination);
        }
        await _play();
    }

    var _play = async function () {
        await _videoCtx.play();
    }

    var _enablePiP = async function () {
        try {
            await _pipVideo.requestPictureInPicture();
        }
        catch (error) {
            console.error("Picture in Picture not supported")
        }
    }

    var _createPiPVideo = async function () {
        _pipVideo = document.createElement('video');
        _pipVideo.id = "pipvideo"
        _pipVideo.hidden = false;
        _pipVideo.controls = true;
        _pipVideo.autoplay = true;
        _pipVideo.muted = true;
        _pipVideo.height = 200;
        _pipVideo.width = 200;
        _pipVideo.style.position = "absolute";
        _pipVideo.style.bottom = "20px";
        _pipVideo.style.right = "20px";
        document.body.appendChild(_pipVideo);
        _pipVideo.srcObject = _canvas.captureStream();
        _pipVideo.onloadedmetadata = (event) => {
            _enablePiP();
        }
    }

    var _isSupported = function () {
        if (!('pictureInPictureEnabled' in document)) {
            console.log('The Picture-in-Picture Web API is not available.');
            return false;
        }
        else if (!document.pictureInPictureEnabled) {
            console.log('The Picture-in-Picture Web API is disabled.');
            return false;
        }
        return true;
    }

    /**
     * Public methods
     */
    publicAPIs.init = function (options) {
        if (_isSupported) {
            _initDependecies();
            _initCanvas();
            _initVideoContext();
            console.log("all ready");
            _start()
            _createPiPVideo();
        }
    };

    return publicAPIs;

})();