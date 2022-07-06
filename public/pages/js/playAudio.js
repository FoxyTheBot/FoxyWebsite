function awnser(url) {
    const audio = document.querySelector("#audio");
    audio.pause();
    audio.currentTime = 0;
    ring(url);
    hideButtons();
}

function ring(a) {
    new Audio(a).play();
}

function stop() {
    new Audio().pause();
}

function hideButtons() {
    const buttons = document.querySelectorAll(".btn");
    buttons.forEach(button => {
        button.classList.add("button--hidden");
    });
    const enabled = document.querySelector(".disabled");
    enabled.classList.remove("disabled");
    enabled.classList.add("enabled");
}