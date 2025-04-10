import Tiff from 'tiff.js';
export default function convertTiffToPng(base64Tiff) {
    return new Promise((resolve, reject) => {
        // Decode base64 to binary
        const binaryString = atob(base64Tiff);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }

        // Create a buffer from the binary data
        const tiff = new Tiff({ buffer: bytes.buffer });
        const canvas = tiff.toCanvas();

        // Convert the canvas to a PNG blob
        canvas.toBlob(blob => {
            const reader = new FileReader();
            reader.onloadend = function () {
                const base64Png = reader.result.split(',')[1];
                resolve(base64Png);
            };
            reader.readAsDataURL(blob);
        }, 'image/png');
    });
}
