// === Mostrar / Ocultar contraseña ===
const togglePassword = document.getElementById("togglePassword");
const passwordInput = document.getElementById("clave");

togglePassword.addEventListener("click", () => {
    const type = passwordInput.getAttribute("type") === "password" ? "text" : "password";
    passwordInput.setAttribute("type", type);

    // Cambia el ícono dinámicamente
    togglePassword.innerHTML = type === "password"
      ? '<i class="fa-regular fa-eye"></i>'
      : '<i class="fa-regular fa-eye-slash"></i>';
});