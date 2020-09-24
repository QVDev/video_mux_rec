let recButton = document.getElementById("recButton");
let mediaRecorder;
let recordedBlobs;

recButton.classList.add("notRec")

recButton.onclick = function () {
    if (recButton.classList.contains('notRec')) {
        startRecording();
        recButton.classList.remove("notRec");
        recButton.classList.add("Rec");
    }
    else {
        stopRecording();
        recButton.classList.remove("Rec");
        recButton.classList.add("notRec");
    }
};

function startRecording() {
    let stream = document.getElementById("canvas").captureStream();
    let options = { mimeType: 'video/webm; codecs="opus,vp8"' };
    recordedBlobs = [];
    try {
        mediaRecorder = new MediaRecorder(stream, options);
    } catch (e0) {
        console.log('Unable to create MediaRecorder with options Object: ', e0);
    }
    console.log('Created MediaRecorder', mediaRecorder, 'with options', options);
    mediaRecorder.onstop = handleStop;
    mediaRecorder.ondataavailable = handleDataAvailable;
    mediaRecorder.start(); // collect 100ms of data
    console.log('MediaRecorder started', mediaRecorder);
}

function handleDataAvailable(event) {
    if (event.data && event.data.size > 0) {
        recordedBlobs.push(event.data);
    }
}

function handleStop(event) {
    console.log('Recorder stopped: ', event);
    download();
}

function stopRecording() {
    mediaRecorder.stop();
    console.log('Recorded Blobs: ', recordedBlobs);
}

function download() {
    const blob = new Blob(recordedBlobs, { type: 'video/webm' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = 'test.webm';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }, 100);
}