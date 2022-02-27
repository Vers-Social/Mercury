const secretKey = "F56Pw5RhKEPuKsnn";

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

function snapshot() {
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
        if (code.data === "GET READY" && code.data !== lastCode) {
            console.log("GET READY");
            lastCode = code.data;
        } else if (code.data !== lastCode && code.data !== "GET READY") {
            let codeExploded = code.data.split(":");
            let progressExploded = codeExploded[0].split("/");
            let arrayKey = progressExploded[0];
            downloadedData[arrayKey] = codeExploded[1].trim();
            lastCode = code.data;
            console.log(codeExploded[0] + " " + code.data);
            if (progressExploded[0] === progressExploded[1]) {
                console.log(JSON.stringify(downloadedData));
                let decryptedCipher = decryptPayload(downloadedData.join(""), secretKey);
                alert(decryptedCipher)
                downloadedData = [];
                lastCode = "";
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