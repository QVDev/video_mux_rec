
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

const url = 'https://gist.githubusercontent.com/jsturgis/3b19447b304616f18657/raw/a8c1f60074542d28fa8da4fe58c3788610803a65/gistfile1.txt'
fetch(url).then(function (response) {
    response.text().then(function (text) {
        text = text.replace('var mediaJSON = ','');
        text = text.slice(0, -1)
        var videos = JSON.parse(text);
        console.log(videos);
        addVideos(videos.categories[0].videos);
    });
});

let videoCtx;
let canvas;


window.onload = function () {
    canvas = document.getElementById("canvas");
    canvas.height = window.screen.height;
    canvas.width = window.screen.width;

    videoCtx = new VideoContext(canvas, () => console.error("Sorry, your browser dosen\'t support WebGL"), options);
};

function addVideos(videos) {
    for (var i = 0; i < videos.length; i++) {
        var video = document.createElement('video');
        video.crossOrigin = "anonymous"
        video.src = videos[i].sources[0];
        video.autoplay = true;
        video.muted = true;
        video.width = 200;
        video.height = 200;
        video.loop = true;
        document.body.appendChild(video);
    }
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