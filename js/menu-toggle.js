document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.querySelector(".menu-toggle");
  const navMenu = document.querySelector(".nav-menu");

  toggle.addEventListener("click", () => {
    navMenu.classList.toggle("active");
  });
});