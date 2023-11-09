
function cropAndSubmit() {
    const image = document.getElementById('file-upload');
    cropper = new Cropper(image, {
        aspectRatio: 1,
        viewMode: 2,
    });
    return true
}
