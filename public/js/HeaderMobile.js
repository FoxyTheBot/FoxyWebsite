const menuOpen = document.getElementById("menu-open");
const menuClose = document.getElementById("menu-close");
const overlay = document.querySelector(".overlay");

menuOpen.addEventListener("click", () => {
    overlay.classList.add("overlay--active");
    menuOpen.style.display = "none";
    menuClose.style.display = "block";
});

menuClose.addEventListener("click", () => {
    overlay.classList.remove("overlay--active");
    menuClose.style.display = "none";
    menuOpen.style.display = "block";
});