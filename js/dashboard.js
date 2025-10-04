const searchBtn = document.querySelector(".search-btn");
const searchOverlay = document.getElementById("searchOverlay");
const closeSearch = document.getElementById("closeSearch");

searchBtn.addEventListener("click", () => {
  searchOverlay.classList.add("active");
  searchOverlay.querySelector("input").focus();
  searchOverlay.setAttribute("aria-hidden", "false");
});

closeSearch.addEventListener("click", () => {
  searchOverlay.classList.remove("active");
  searchOverlay.setAttribute("aria-hidden", "true");
});

// Cerrar con tecla ESC
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && searchOverlay.classList.contains("active")) {
    searchOverlay.classList.remove("active");
    searchOverlay.setAttribute("aria-hidden", "true");
  }
});


const avatar = document.querySelector(".user-avatar");
const dropdown = document.querySelector(".dropdown-menu");

avatar.addEventListener("click", () => {
  dropdown.classList.toggle("active");
});

// Cerrar si haces clic fuera del menú
document.addEventListener("click", (e) => {
  if (!dropdown.contains(e.target) && !avatar.contains(e.target)) {
    dropdown.classList.remove("active");
  }
});

