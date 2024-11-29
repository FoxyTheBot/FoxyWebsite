function showPopup() {
    document.getElementById('popup').classList.add('visible');
    document.getElementById('popup').classList.remove('hidden');
}

function hidePopup() {
    const popup = document.getElementById('popup');
    popup.classList.remove('visible');
    document.getElementById("jsonInput").value = "";
    document.getElementById("botSelect").value = "";
    document.getElementById("botImage").src = "https://cdn.discordapp.com/embed/avatars/0.png";

    setTimeout(() => {
        popup.classList.add('hidden');
    }, 300);
}

window.showPopup = showPopup;
window.hidePopup = hidePopup;