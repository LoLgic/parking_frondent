document.addEventListener("DOMContentLoaded", () => {
  // -------------------------------
  //  BUSCADOR OVERLAY
  // -------------------------------
  const searchBtn = document.querySelector(".search-btn");
  const searchOverlay = document.getElementById("searchOverlay");
  const closeSearch = document.getElementById("closeSearch");


  if (searchBtn && searchOverlay && closeSearch) {
    searchBtn.addEventListener("click", () => {
      searchOverlay.classList.add("active");
      const input = searchOverlay.querySelector("input");
      if (input) input.focus();
      searchOverlay.setAttribute("aria-hidden", "false");
    });

    closeSearch.addEventListener("click", () => {
      searchOverlay.classList.remove("active");
      searchOverlay.setAttribute("aria-hidden", "true");
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && searchOverlay.classList.contains("active")) {
        searchOverlay.classList.remove("active");
        searchOverlay.setAttribute("aria-hidden", "true");
      }
    });
  }

  // -------------------------------
  //  🔹 AUTO CARGAR VEHÍCULOS AL INICIAR SESIÓN
  // -------------------------------
  const token = localStorage.getItem("token");
  const mainContent = document.getElementById("mainContent");

  if (token && mainContent) {
    document.querySelectorAll(".section").forEach(s => s.style.display = "none");
    document.getElementById("sectionVehiculos").style.display = "block";
    cargarVehiculos();

    const navLinks = document.querySelectorAll(".nav-link");
    navLinks.forEach((link) => {
      if (link.dataset.section === "vehiculos") link.classList.add("active");
      else link.classList.remove("active");
    });
  }

  // -------------------------------
  //  MENÚ DE USUARIO (AVATAR)
  // -------------------------------
  const avatar = document.querySelector(".user-avatar");
  const dropdown = document.querySelector(".dropdown-menu");

  if (avatar && dropdown) {
    avatar.addEventListener("click", (e) => {
      e.stopPropagation();
      dropdown.classList.toggle("active");
    });

    document.addEventListener("click", (e) => {
      if (!dropdown.contains(e.target) && !avatar.contains(e.target)) {
        dropdown.classList.remove("active");
      }
    });
  }

  // -------------------------------
  //  NAVEGACIÓN LATERAL
  // -------------------------------
  const navLinks = document.querySelectorAll(".nav-link");

  if (navLinks.length > 0 && mainContent) {
    navLinks.forEach((link) => {
      link.addEventListener("click", async (e) => {
        e.preventDefault();

        navLinks.forEach((l) => l.classList.remove("active"));
        link.classList.add("active");

        const section = link.dataset.section;
        mainContent.className = "main-content " + section;

        // Ocultar todas las secciones
        document.querySelectorAll(".section").forEach(s => s.style.display = "none");

        // Mostrar solo la sección seleccionada
        const sectionToShow = document.getElementById(`section${section.charAt(0).toUpperCase() + section.slice(1)}`);
        if (sectionToShow) {
          sectionToShow.style.display = "block";
        }

        // Si es la sección de vehículos, recargar lista dinámica
        if (section === "vehiculos") {
          await cargarVehiculos();
        }

      });
    });
  }

  // -------------------------------
  // FUNCIÓN: CARGAR VEHÍCULOS (CON FILTRO)
  // -------------------------------
  async function cargarVehiculos(tipo = "TODOS") {
    const listContainer = document.getElementById("vehiculos-list");
    const token = localStorage.getItem("token");

    if (!listContainer) {
      console.error("No se encontró el contenedor #vehiculos-list");
      return;
    }

    if (!token) {
      listContainer.innerHTML = `<p style="color:red;">No se encontró el token. Por favor, inicia sesión nuevamente.</p>`;
      return;
    }

    listContainer.innerHTML = `<p>Cargando vehículos...</p>`;

    let url = "http://localhost:8081/api/vehiculos/mios";
    if (tipo !== "TODOS") {
      url += `/tipo/${tipo}`;
    }

    try {
      const res = await fetch(url, {
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (!res.ok) throw new Error("Error al obtener los vehículos");
      const data = await res.json();

      listContainer.innerHTML = "";

      if (!data || data.length === 0) {
        listContainer.innerHTML = `<p class="sin-vehiculos">No tienes vehículos registrados de este tipo.</p>`;
        return;
      }

      data.forEach(v => {
        const card = document.createElement("div");
        card.classList.add("vehiculo-card");
        card.innerHTML = `
        <div class="vehiculo-info">
          <h3><strong>Tipo:</strong> ${v.tipo}</h3>
          <p><strong>Placa:</strong> ${v.placa}</p>
          <p><strong>Propietario:</strong> ${v.propietario}</p>
        </div>
        <button class="btn-eliminar" data-id="${v.idVehiculo}">Eliminar</button>
      `;
        listContainer.appendChild(card);
      });

    } catch (err) {
      console.error("Error cargando vehículos:", err);
      listContainer.innerHTML = `<p style="color:red;">Error al cargar los vehículos.</p>`;
    }

    // -------------------------------
    // EVENTOS: FILTRO DE VEHÍCULOS
    // -------------------------------
    document.addEventListener("click", (e) => {
      // Verificar si se hizo clic en un botón de filtro
      const btn = e.target.closest(".filtro-btn");
      if (!btn) return;

      const tipo = btn.dataset.tipo;

      // Actualiza el estilo del botón activo
      document.querySelectorAll(".filtro-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      // Llama a la función de carga con el tipo seleccionado
      cargarVehiculos(tipo);
    });

  }



  // Validación adicional en JavaScript
  document.getElementById("vehiculoForm").addEventListener("submit", (e) => {
    const placaInput = document.getElementById("placa");
    const placa = placaInput.value.trim().toUpperCase();
    const mensaje = document.getElementById("vehiculoMessage");

    // Evitar que se envíe si la placa no cumple
    if (!/^[A-Z0-9]{6}$/.test(placa)) {
      e.preventDefault();
      mensaje.textContent = "La placa debe tener exactamente 6 caracteres alfanuméricos (sin espacios).";
      mensaje.style.color = "red";
      placaInput.focus();
      return;
    }

    // Si es válida, limpiar mensaje y permitir envío
    mensaje.textContent = "";
    placaInput.value = placa; // Normaliza a mayúsculas
  });

  // -------------------------------
  //  MODAL: REGISTRO VEHÍCULO
  // -------------------------------
  const modal = document.getElementById("vehiculoModal");
  const form = document.getElementById("vehiculoForm");
  const btnSubmit = document.getElementById("vehiculoSubmit");
  const btnCancel = document.getElementById("vehiculoCancel");
  const btnClose = modal?.querySelector(".modal-close");
  const msg = document.getElementById("vehiculoMessage");

  function openModal() {
    if (!modal) return;
    form.reset();
    msg.textContent = "";
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    document.getElementById("tipo").focus();
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  // Abrir modal (delegación porque el botón se crea dinámicamente)
  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".btn-agregar");
    if (btn) openModal();
  });

  // Cerrar modal
  btnCancel?.addEventListener("click", closeModal);
  btnClose?.addEventListener("click", closeModal);
  modal?.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal?.classList.contains("is-open")) closeModal();
  });

  // -------------------------------
  //  SUBMIT: REGISTRAR VEHÍCULO
  // -------------------------------
  form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    msg.textContent = "";

    const tipo = document.getElementById("tipo").value.trim();
    const placa = document.getElementById("placa").value.trim().toUpperCase();

    if (!tipo || !placa) {
      msg.textContent = "Completa todos los campos.";
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      msg.textContent = "No se encontró el token. Inicia sesión nuevamente.";
      return;
    }

    btnSubmit.disabled = true;
    btnSubmit.textContent = "Registrando...";

    try {
      const res = await fetch("http://localhost:8081/api/vehiculos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ placa, tipo })
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Error al registrar el vehículo");
      }

      msg.textContent = "Vehículo registrado correctamente ✅";
      await cargarVehiculos();
      setTimeout(closeModal, 700);

    } catch (err) {
      console.error("Error registrar vehículo:", err);
      msg.textContent = `Error: ${err.message}`;
    } finally {
      btnSubmit.disabled = false;
      btnSubmit.textContent = "Registrar";
    }
  });
});
