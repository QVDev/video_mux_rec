
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
};

for (var i = 0; i < 7; i++) {
    var video = document.createElement('video');
    video.src = 'bill.mp4';
    video.autoplay = true;
    video.muted = true;
    video.width = 200;
    video.height = 200;
    video.loop = true;
    document.body.appendChild(video);
}

async function start() {
    console.log("PIP");

    var x = -0.8;
    var y = -0.8;

    for (var i = 1; i < document.getElementsByTagName("video").length; i++) {

        var cameraNode = videoCtx.video(document.getElementsByTagName("video")[i].captureStream());
        cameraNode.start(0);

        var translateNode = videoCtx.effect(VideoContext.DEFINITIONS.AAF_VIDEO_POSITION);
        translateNode.positionOffsetX = x;
        translateNode.positionOffsetY = y;

        x = x + 0.4;

        console.log("x::" + x);
        console.log("y::" + y);

        if (x > 1.2) {
            x = -0.8;
            y = y + 0.4;
        }

        var scaleNode = videoCtx.effect(VideoContext.DEFINITIONS.AAF_VIDEO_SCALE);
        scaleNode.scaleX = 0.2;
        scaleNode.scaleY = 0.2;

        scaleNode.connect(translateNode);
        cameraNode.connect(scaleNode);

        translateNode.connect(videoCtx.destination);
    }
    await play();
}

async function play() {
    // audioTimerLoop(anim, 1000 / 60);
    // videoCtx._useVideoElementCache = false

    await videoCtx.play();
    setTimeout(function () {
        // if (videoCtx.state == VideoContext.STATE.PLAYING) {
        const video = document.getElementById('output');
        const stream = document.getElementById("canvas").captureStream();
        const button = document.getElementById('start');
        button.disabled = true;
        video.srcObject = stream;
        video.hidden = false;
        video.onloadedmetadata = (event) => {
            video.requestPictureInPicture();
        };        
    }, 500);
}