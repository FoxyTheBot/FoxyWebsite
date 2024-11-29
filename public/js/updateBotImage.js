function updateBotImage() {
    const botSelect = document.getElementById("botSelect");
    const botImage = document.getElementById("botImage");

    const botImages = {
        "loritta": "https://pbs.twimg.com/profile_images/1676231413970923523/JsPxx5Xx_400x400.jpg",
        "carl-bot": "https://cdn.discordapp.com/avatars/235148962103951360/ed3dac3b6e7a851df781632a4295fcb9.png?size=2048"
    };

    const selectedBot = botSelect.value;

    if (selectedBot && botImages[selectedBot]) {
        botImage.src = botImages[selectedBot];
        botImage.alt = selectedBot;
        botImage.style.display = "block";
    } else {
        botImage.src = "";
        botImage.alt = "Selecione um bot";
        botImage.style.display = "none";
    }
}

window.updateBotImage = updateBotImage;