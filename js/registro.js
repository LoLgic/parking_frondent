const form = document.getElementById("registerForm");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const clave = document.getElementById("clave").value;
  const confirmar = document.getElementById("confirmar").value;

  if (clave !== confirmar) {
    alert("Las contraseñas no coinciden");
    return;
  }

  const nuevoUsuario = {
    nombre: document.getElementById("nombre").value,
    apellido: document.getElementById("apellido").value,
    celular: document.getElementById("celular").value,
    email: document.getElementById("email").value,
    clave: document.getElementById("clave").value,
  };

  try {
    const response = await fetch("http://localhost:8081/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nuevoUsuario),
    });

    if (!response.ok) {
      let errorMessage = "No se pudo registrar el usuario";
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        errorMessage = `Error ${response.status}: ${response.statusText}`;
      }
      document.getElementById("mensajeError").innerText = errorMessage;
      return;
    }

    const data = await response.json();

    // mostrar modal de éxito
    openModal();

    // cuando haga clic en "Continuar" lo lleva a login.html
    document.getElementById("continueBtn").addEventListener("click", () => {
      window.location.href = "login.html";
    });


  } catch (err) {
    console.error("Error de red:", err);
    document.getElementById("mensajeError").innerText =
      "Error de conexión con el servidor";
    document.getElementById("mensajeExito").innerText = "";
  }
});



// Helpers modal
const modal = document.getElementById('successModal');
const continueBtn = document.getElementById('continueBtn');

function openModal() {
  modal.classList.add('is-open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
  // focus en el botón para accesibilidad
  continueBtn.focus();
}

function closeModal() {
  modal.classList.remove('is-open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
}

// cerrar si hacen click fuera del contenido
modal.addEventListener('click', (e) => {
  if (e.target === modal) closeModal();
});

// cerrar con ESC
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modal.classList.contains('is-open')) {
    closeModal();
  }
});

// al pulsar continuar -> ir a login
continueBtn.addEventListener('click', () => {
  // opcional: primero cerrar modal (visual)
  closeModal();
  // redirigir a login
  window.location.href = 'login.html';
});
