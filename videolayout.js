let webConstraints = {
    video: { width: { exact: 1280 }, height: { exact: 720 }, resizeMode: "none" },
    audio: true
};

let screenConstraints = {
    video: { width: { ideal: 1280 }, height: { ideal: 720 }, resizeMode: "none" },
    audio: false
};

let glOptions = {
    alpha: true,
    antialias: true,
    depth: true,
    failIfMajorPerformanceCaveat: false,
    powerPreference: "default",
    premultipliedAlpha: true,
    preserveDrawingBuffer: false,
    stencil: false,
    desynchronized: false
}

let options = {
    endOnLastSourceEnd: false,
    useVideoElementCache: false,
    videoElementCacheSize: 0,
    webglContextAttributes: glOptions
}



let videoCtx;
let canvas;

window.onload = function () {
    canvas = document.getElementById("canvas");
    canvas.height = window.screen.height;
    canvas.width = window.screen.width;

    videoCtx = new VideoContext(canvas, () => console.error("Sorry, your browser dosen\'t support WebGL"), options);
    this.main();
};

async function main() {
    // await this.getScreen();
    // await this.getWebCam();
    await this.getCombined();
    await this.play()
}

async function getCombined() {
    //Create the combine compositing node (from the above Combine effect description).    
    var camera = await navigator.mediaDevices.getUserMedia(webConstraints)
    var screen = await navigator.mediaDevices.getDisplayMedia(screenConstraints);

    var screenNode = videoCtx.video(screen);
    screenNode.start(0)
    var cameraNode = videoCtx.video(camera);
    cameraNode.start(0)

    var scaleNode = videoCtx.effect(VideoContext.DEFINITIONS.AAF_VIDEO_SCALE);
    scaleNode.scaleX = 0.1;
    scaleNode.scaleY = 0.1;

    cameraNode.connect(scaleNode)

    var translateNode = videoCtx.effect(VideoContext.DEFINITIONS.AAF_VIDEO_POSITION);
    translateNode.positionOffsetX = 0.78;
    translateNode.positionOffsetY = -0.78;

    scaleNode.connect(translateNode)

    var combined = videoCtx.compositor(VideoContext.DEFINITIONS.COMBINE);

    screenNode.connect(combined);
    translateNode.connect(combined);
    combined.connect(videoCtx.destination);
}

async function getScreen() {
    var screen = await navigator.mediaDevices.getDisplayMedia(screenConstraints);
    console.log(JSON.stringify(screen.getVideoTracks()[0].getSettings(), null, 2));
    var screenNode = videoCtx.video(screen);
    screenNode.start(0);

    // var translateNode = videoCtx.effect(VideoContext.DEFINITIONS.AAF_VIDEO_POSITION);
    // screenNode.connect(translateNode);

    screenNode.connect(videoCtx.destination);
}

async function getWebCam() {
    var camera = await navigator.mediaDevices.getUserMedia(webConstraints)
    console.log(JSON.stringify(camera.getVideoTracks()[0].getSettings(), null, 2));
    var cameraNode = videoCtx.video(camera);
    cameraNode.start(0);

    var translateNode = videoCtx.effect(VideoContext.DEFINITIONS.AAF_VIDEO_POSITION);
    translateNode.positionOffsetX = 0.78;
    translateNode.positionOffsetY = -0.78;

    var scaleNode = videoCtx.effect(VideoContext.DEFINITIONS.AAF_VIDEO_SCALE);
    scaleNode.scaleX = 0.2;
    scaleNode.scaleY = 0.2;

    scaleNode.connect(translateNode);
    cameraNode.connect(scaleNode);

    translateNode.connect(videoCtx.destination);
}

function anim() {
}

async function play() {
    // audioTimerLoop(anim, 1000 / 60);
    // videoCtx._useVideoElementCache = false

    await videoCtx.play();
    setTimeout(function () {
        if (videoCtx.state == VideoContext.STATE.PLAYING) {
            const video = document.getElementById('video');
            const stream = document.getElementById("canvas").captureStream();
            video.srcObject = stream;
        } else {
            console.log("STATE::" + videoCtx.state);
        }
    }, 500);
}

function audioTimerLoop(callback, frequency) {

    var freq = frequency / 1000;      // AudioContext time parameters are in seconds
    var aCtx = new AudioContext();
    // Chrome needs our oscillator node to be attached to the destination
    // So we create a silent Gain Node
    var silence = aCtx.createGain();
    silence.gain.value = 0.5;
    silence.connect(aCtx.destination);

    onOSCend();

    var stopped = false;       // A flag to know when we'll stop the loop
    function onOSCend() {
        var osc = aCtx.createOscillator();
        osc.onended = onOSCend; // so we can loop
        osc.connect(silence);
        osc.start(0); // start it now
        osc.stop(aCtx.currentTime + freq); // stop it next frame
        callback(aCtx.currentTime); // one frame is done
        if (stopped) {  // user broke the loop
            osc.onended = function () {
                aCtx.close(); // clear the audioContext
                return;
            };
        }
    };
    // return a function to stop our loop
    return function () {
        stopped = true;
    };
}