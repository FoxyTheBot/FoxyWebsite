const imageRegex = /\.(jpeg|jpg|png|gif|bmp|webp|svg)$/i;

document.getElementById('imageLink').addEventListener('input', function (event) {
    const input = event.target.value;
    const imageLink = document.getElementById('imageLink');
    const saveButton = document.getElementById('saveButton');

    if (input && !imageRegex.test(input)) {
        imageLink.style.border = '2px solid red';
        saveButton.disabled = true;
    } else {
        imageLink.style.border = 'none';
        saveButton.disabled = false;
    }
});

document.getElementById('goodbyeImageLink').addEventListener('input', function (event) {
    const input = event.target.value;
    const imageLink = document.getElementById('goodbyeImageLink');
    const saveButton = document.getElementById('saveButton');

    if (input && !imageRegex.test(input)) {
        imageLink.style.border = '2px solid red';
        saveButton.disabled = true;
    } else {
        imageLink.style.border = 'none';
        saveButton.disabled = false;
    }
});