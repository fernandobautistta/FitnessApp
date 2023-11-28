let videoStream;

async function encenderCamara() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        document.getElementById('video').srcObject = stream;
        videoStream = stream;
    } catch (error) {
        console.error('Error al acceder a la cámara:', error);
    }
}
function apagarCamara() {
    if (videoStream) {
        const tracks = videoStream.getTracks();
        tracks.forEach(track => track.stop());
        document.getElementById('video').srcObject = null;
    }
}