import Tiff from 'tiff.js';
export default function TiffToPngConverter(tiffFile) {
    return new Promise((resolve, reject) => {
        if (!tiffFile || tiffFile.type !== 'image/tiff') {
            reject('Please provide a valid TIFF file.');
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            const tiff = new Tiff({ buffer: e.target.result });
            const canvas = tiff.toCanvas();

            // Convert the canvas to a PNG data URL
            const pngDataUrl = canvas.toDataURL('image/png');

            resolve(pngDataUrl);
        };
        reader.onerror = (error) => {
            reject('Error reading the file.');
        };
        reader.readAsArrayBuffer(tiffFile);
    });
}
