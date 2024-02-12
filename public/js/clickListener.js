document.addEventListener('DOMContentLoaded', () => {
    let clickCount = 0;
    const clickableImage = document.getElementById('clickableImage');
    const foxyImage = document.querySelector('.foxy');
    const audio = new Audio('../assets/audios/dori.mp3'); // Caminho para o arquivo de áudio

    clickableImage.addEventListener('click', () => {
        clickCount++;
        
        if (clickCount > 5) {
            document.body.classList.add('melting');
            foxyImage.src = 'https://static.wikia.nocookie.net/vsbattles/images/7/71/Neco-Arc_Remake.png';
            const title = document.querySelector('.title');
            title.textContent = 'Neco Arc';

            audio.play();
            audio.addEventListener('ended', () => {
                audio.pause();
                audio.currentTime = 0;
            });
        }
    });
});