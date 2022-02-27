const secretKey = "F56Pw5RhKEPuKsnn";

let main = document.querySelector("main");
let qrArea = document.querySelector("main #qrArea");
let transmitButton = document.querySelector("#transmitButton");

transmitButton.onclick = function() {
    let message = prompt("Please enter a message", "");
    let text;
    if (message !== null && message !== "") {
        transmitButton.remove();
        // Encrypt Payload
        let cipherText = encryptPayload(message, secretKey);

        let payloadCount = 1;
        let payloadArray = [];

        // Multiple Payloads Required
        if (cipherText.toString().length > 100) {
            payloadArray = chunkString(cipherText.toString(), 100);
            payloadCount = payloadArray.length;
        } else {
            payloadArray.push(cipherText.toString());
        }

        let textValue;

        async function loopThroughPayload() {
            let qrCode = new QRCode(qrArea, {
                text: "GET READY",
                width: 1000,
                height: 1000,
                colorDark : "#995fa3",
                colorLight : "#000",
                correctLevel : QRCode.CorrectLevel.H
            }); 
            await sleep(10000);
            let i = 0;
            for (const value of payloadArray) {
                if (i === 0) {
                    textValue = `${i+1}/${payloadCount}: ` + value;
                } else {
                    qrCode.clear();
                    textValue = `${i+1}/${payloadCount}: ` + value;
                }
                qrCode.makeCode(textValue);
                await sleep(2000);
                i++;
            }
        }

        loopThroughPayload();

        //setTimeout(function() {
        //payload = JSON.stringify({
        //    "message": "Another test"
        //});
        // Encrypt Payload
        //cipherText = encryptPayload(payload, secretKey);
        //qrCode.clear();
        //qrCode.makeCode(cipherText.toString());
        //}, 5000);

        /* Functions */

        function encryptPayload(data) {
            return CryptoJS.AES.encrypt(data, secretKey);
        }

        function decryptPayload(cipherText) {
            let bytes = CryptoJS.AES.decrypt(cipherText.toString(), secretKey);
            return bytes.toString(CryptoJS.enc.Utf8);
        }

        function chunkString(str, len) {
            const size = Math.ceil(str.length/len)
            const r = Array(size)
            let offset = 0
            for (let i = 0; i < size; i++) {
            r[i] = str.substr(offset, len)
            offset += len
            }
            return r
        }

        function sleep(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }
    }
}