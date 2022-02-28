const secretKey = "F56Pw5RhKEPuKsnn";
let span = document.querySelector("span");

init();
function startRecording() {
    if (!navigator.mediaDevices && !navigator.mediaDevices.getUserMedia) {
        navigator.userMedia = navigator.mozGetUserMedia || navigator.getUserMedia
        if (!navigator.userMedia) {
            alert("Please Update or Use Different Browser");
            return
        }
        navigator.userMedia({
            video: { width: 1000, height: 1000, zoom: true, facingMode: "environment" },
            audio: false
        }, (stream) => startWebcam(stream), (err) => showErr(err))
        return
    }
    navigator.mediaDevices.getUserMedia({
        video: { width: 1000, height: 1000, zoom: true, facingMode: "environment" }
    })
    .then((stream) => startWebcam(stream))
    .catch((err) => showErr(err));
    let video;
    let webcamStream;
    let interval1;
    let webcamButton = document.querySelector("#webcamButton");
    function startWebcam(localMediaStream) {
        span.innerHTML = `<h2>Position QR code in view of camera to initiate download.</h2>`;
        video = document.querySelector("video");
        video.style.display = "block";
        //canvas.style.opactity = "1";
        video.srcObject=localMediaStream;
        webcamStream = localMediaStream;
        interval1 = setInterval(snapshot, 100);
        webcamButton.innerText = "Cancel";
        webcamButton.setAttribute("onclick", `window.location = "transmitter.html"`);
    }
        
    function showErr(err) {
        let message = err.name === "NotFoundError" ? "Please Attach Camera" :
        err.name === "NotAllowedError" ? "Please Grant Permission to Access Camera" : err
        alert(message)
    }
}

function init() {
    // Get the canvas and obtain a context for
    // drawing in it
    canvas = document.getElementById("myCanvas");
    ctx = canvas.getContext('2d');
}

let lastCode = "";
let downloadedData = [];
let finishedDownloading = false;

async function snapshot() {
    // Draws current image from the video element into the canvas
    ctx.drawImage(video, 0,0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(
        0,
        0,
        canvas.width,
        canvas.height
    );
    const code = jsQR(imageData.data, canvas.width, canvas.height);
    if (code) {
        if (finishedDownloading && code.data !== "GET READY") {
            // This appears to be an invalid code. Did you already download this?
            return;
        }
        if (code.data === "GET READY" && code.data !== lastCode) {
            span.innerHTML = `<h2>Download about to begin. Make sure your camera stays focused on QR code.</h2>`;
            lastCode = code.data;
            finishedDownloading = false;
        } else if (code.data !== lastCode && code.data !== "GET READY") {
            let codeExploded = code.data.split(":");
            let progressExploded = codeExploded[0].split("/");
            let arrayKey = progressExploded[0];
            downloadedData[arrayKey] = codeExploded[1].trim();
            lastCode = code.data;
            span.innerHTML = `<h2>Download Progress: ${codeExploded[0]}</h2>`;
            let newDownloadedData = downloadedData.filter(x => x);
            if (progressExploded[0] === progressExploded[1]) {
                if (newDownloadedData.length != progressExploded[0]) {
                    span.innerHTML = `<h2>Download failed because parts of data are missing. Sorry about that please restart data transmission.</h2>`;
                    downloadedData = [];
                    lastCode = "";
                    return;
                }
                console.log(JSON.stringify(newDownloadedData));
                let decryptedCipher = decryptPayload(newDownloadedData.join(""), secretKey);
                span.innerHTML = `<div class="message">Message Downloaded: ${decryptedCipher}</div>`;
                downloadedData = [];
                lastCode = "";
                finishedDownloading = true;
            }
        } else {
            //
        }
    }
}

function encryptPayload(data) {
    return CryptoJS.AES.encrypt(data, secretKey);
}

function decryptPayload(cipherText) {
    let bytes = CryptoJS.AES.decrypt(cipherText.toString(), secretKey);
    return bytes.toString(CryptoJS.enc.Utf8);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}