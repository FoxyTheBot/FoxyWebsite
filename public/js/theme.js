const themeIcon = document.getElementById('theme-icon');
const sunIcon = document.getElementById('sun-icon');
const moonIcon = document.getElementById('moon-icon');
const foxyImg = document.querySelector('img.foxy');

function switchTheme() {
    const isDark = document.documentElement.classList.toggle('dark-theme');
    document.getElementById('sun-icon').style.display = isDark ? 'none' : 'block';
    document.getElementById('moon-icon').style.display = isDark ? 'block' : 'none';

    localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

function applySavedTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    const isDark = savedTheme === 'dark';

    document.documentElement.classList.toggle('dark-theme', isDark);
    document.getElementById('sun-icon').style.display = isDark ? 'none' : 'block';
    document.getElementById('moon-icon').style.display = isDark ? 'block' : 'none';
}

document.addEventListener('DOMContentLoaded', () => {
    applySavedTheme();
    document.getElementById('theme-icon').addEventListener('click', switchTheme);
});
