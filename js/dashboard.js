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

    // Cerrar con tecla ESC
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && searchOverlay.classList.contains("active")) {
        searchOverlay.classList.remove("active");
        searchOverlay.setAttribute("aria-hidden", "true");
      }
    });
  }

  // -------------------------------
  //  MENÚ DE USUARIO (AVATAR)
  // -------------------------------
  const avatar = document.querySelector(".user-avatar");
  const dropdown = document.querySelector(".dropdown-menu");

  if (avatar && dropdown) {
    avatar.addEventListener("click", (e) => {
      e.stopPropagation(); // Evita cierre inmediato
      dropdown.classList.toggle("active");
    });

    // Cerrar si haces clic fuera del menú
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
  const mainContent = document.getElementById("mainContent");

  if (navLinks.length > 0 && mainContent) {
    navLinks.forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();

        // Quitar clase "active" de todos los enlaces
        navLinks.forEach((l) => l.classList.remove("active"));

        // Activar enlace actual
        link.classList.add("active");

        // Cambiar contenido principal
        const section = link.dataset.section || "inicio";
        mainContent.className = "main-content " + section;

        mainContent.innerHTML = `<h1>${section.charAt(0).toUpperCase() + section.slice(1)}</h1>`;
      });
    });
  }



  const API_URL = "http://localhost:8081/api/vehiculos/mios";

  // Escucha clics en el sidebar
  navLinks.forEach(link => {
    link.addEventListener("click", async (e) => {
      e.preventDefault();
      navLinks.forEach(l => l.classList.remove("active"));
      link.classList.add("active");

      const section = link.dataset.section;
      mainContent.className = "main-content " + section;

      if (section === "vehiculos") {
        await cargarVehiculos();
      } else if (section === "reservas") {
        cargarReservas(); // tu función anterior
      }
    });
  });



  // -------------------------------
  //  FUNCIÓN: CARGAR VEHÍCULOS
  // -------------------------------
  async function cargarVehiculos() {
    mainContent.innerHTML = `
    <div class="vehiculos-container">
      <div class="vehiculos-header">
        <h1>Mis Vehículos</h1>
        <button class="btn-agregar">Registrar nuevo vehículo</button>
      </div>
      <div id="vehiculos-list" class="vehiculos-list"></div>
    </div>
  `;

    const listContainer = document.getElementById("vehiculos-list");
    const token = localStorage.getItem("token"); // 🔑 Recuperamos el token guardado

    if (!token) {
      listContainer.innerHTML = `<p style="color:red;">No se encontró el token. Por favor, inicia sesión nuevamente.</p>`;
      return;
    }

    try {
      const response = await fetch("http://localhost:8081/api/vehiculos/mios", {
        headers: {
          "Authorization": `Bearer ${token}`, // 👈 Enviamos el token
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) throw new Error("Error al obtener vehículos");

      const data = await response.json();

      if (!data || data.length === 0) {
        listContainer.innerHTML = `<p class="sin-vehiculos">No tienes vehículos registrados.</p>`;
        return;
      }

      data.forEach(v => {
        const card = document.createElement("div");
        card.classList.add("vehiculo-card");
        card.innerHTML = `
        <div class="vehiculo-info">
          <h3>Placa: ${v.placa}</h3>
          <p><strong>Tipo:</strong> ${v.tipo}</p>
          <p><strong>Propietario:</strong> ${v.propietario}</p>
        </div>
        <button class="btn-eliminar" data-id="${v.idVehiculo}">Eliminar</button>
      `;
        listContainer.appendChild(card);
      });

    } catch (error) {
      console.error("Error cargando vehículos:", error);
      listContainer.innerHTML = `<p style="color:red;">Error al cargar los vehículos.</p>`;
    }
  }


  // === Función para cargar los vehículos desde la API ===
  /*async function cargarVehiculos() {
    mainContent.innerHTML = `
    <div class="vehiculos-container">
      <div class="vehiculos-header">
        <h1>Mis Vehículos</h1>
        <button class="btn-agregar">Registrar nuevo vehículo</button>
      </div>
      <div id="vehiculos-list" class="vehiculos-list"></div>
    </div>
  `;

    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error("Error al obtener vehículos");
      const data = await response.json();

      const listContainer = document.getElementById("vehiculos-list");
      const token = localStorage.getItem("token");

      if (!token) {
        listContainer.innerHTML = `<p style="color:red;">No se encontró el token. Por favor, inicia sesión nuevamente.</p>`;
        return;
      }

      if (data.length === 0) {
        listContainer.innerHTML = `<p class="sin-vehiculos">No tienes vehículos registrados.</p>`;
        return;
      }

      data.forEach(v => {
        const card = document.createElement("div");
        card.classList.add("vehiculo-card");
        card.innerHTML = `
        <div class="vehiculo-info">
          <h3>Placa: ${v.placa}</h3>
          <p><strong>Tipo:</strong> ${v.tipo}</p>
          <p><strong>Propietario:</strong> ${v.propietario}</p>
        </div>
        <button class="btn-eliminar" data-id="${v.idVehiculo}">Eliminar</button>
      `;
        listContainer.appendChild(card);
      });

    } catch (error) {
      console.error("Error cargando vehículos:", error);
      mainContent.innerHTML = `<p style="color:red;">Error al cargar los vehículos.</p>`;
    }
  }*/

});








// ===============================
// INTERACCIÓN DE PESTAÑAS RESERVAS
// ===============================

/*
document.addEventListener("DOMContentLoaded", () => {
  const tabs = document.querySelectorAll(".nav-tab");
  const contenido = document.getElementById("reservasContenido");

  // Datos de ejemplo (puedes reemplazar luego con fetch al backend)
  const reservasData = {
    actuales: [
      {
        titulo: "Tu reserva activa",
        ubicacion: "Central Tower",
        fecha: "2025-09-16T23:16:36",
        espacio: "Nivel 1 - A2",
        tipo: "Carro",
        placa: "0052FF",
        estado: "Activa"
      },
      {
        titulo: "Reserva activa",
        ubicacion: "Parqueadero Norte",
        fecha: "2025-09-18T10:00:00",
        espacio: "Nivel 2 - B5",
        tipo: "Moto",
        placa: "XYZ87C",
        estado: "Activa"
      }
    ],
    futuras: [
      {
        titulo: "Reserva programada",
        ubicacion: "Central Tower",
        fecha: "2025-10-10T09:00:00",
        espacio: "Nivel 3 - C1",
        tipo: "Carro",
        placa: "AAA111",
        estado: "Pendiente"
      }
    ],
    historial: [
      {
        titulo: "Reserva finalizada",
        ubicacion: "Parking Sur",
        fecha: "2025-09-01T18:00:00",
        espacio: "Nivel 1 - D2",
        tipo: "Carro",
        placa: "XYZ321",
        estado: "Finalizada"
      }
    ]
  };

  // Función para renderizar las tarjetas según la pestaña
  function renderReservas(tipo) {
    const reservas = reservasData[tipo];
    if (!reservas || reservas.length === 0) {
      contenido.innerHTML = `<p class="no-reservas">No hay reservas ${tipo}.</p>`;
      return;
    }

    contenido.innerHTML = reservas
      .map(
        (r) => `
      <article class="reserva-card">
        <div class="reserva-info">
          <h2>${r.titulo}</h2>
          <p><strong>Ubicación:</strong> ${r.ubicacion}</p>
          <p><strong>Fecha de entrada:</strong> ${r.fecha}</p>
          <p><strong>Espacio:</strong> ${r.espacio}</p>
          <p><strong>Tipo de vehículo:</strong> ${r.tipo}</p>
          <p><strong>Placa:</strong> ${r.placa}</p>
        </div>
        <div class="reserva-acciones">
          <span class="reserva-estado ${r.estado.toLowerCase()}">${r.estado}</span>
          ${
            r.estado === "Activa"
              ? `<button class="btn-cancelar"><i class="fa-solid fa-xmark"></i> Cancelar reserva</button>`
              : ""
          }
        </div>
      </article>
    `
      )
      .join("");
  }

  // Listener de las pestañas
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      // Quitar clase active de todos
      tabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");

      // Obtener tipo y renderizar
      const tipo = tab.dataset.tab;
      renderReservas(tipo);
    });
  });

  // Mostrar "Actuales" por defecto
  renderReservas("actuales");
});
*/