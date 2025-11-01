// dashboard.js (versión corregida)
// -----------------------------------
// 🔔 TOAST GLOBAL (esquina inferior derecha)
// -----------------------------------
function showToast(message, type = "info") {
  const container = document.getElementById("toastContainer");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerHTML = `${type === "success" ? "✅" : type === "error" ? "❌" : "ℹ️"} ${message}`;
  container.appendChild(toast);

  // Forzar animación
  setTimeout(() => toast.classList.add("show"), 50);

  // Ocultar automáticamente
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 400);
  }, 3000);
}

// -----------------------------------
// 🧩 EVENTO PRINCIPAL
// -----------------------------------
document.addEventListener("DOMContentLoaded", () => {
  // -------------------------------
  // 🔍 BUSCADOR OVERLAY
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
  // 🔹 VARIABLES GLOBALES (referencias DOM)
  // -------------------------------
  const mainContent = document.getElementById("mainContent");
  const modal = document.getElementById("vehiculoModal");
  const form = document.getElementById("vehiculoForm");
  const msgVehiculo = document.getElementById("vehiculoMessage");

  // -------------------------------
  // 🔹 NAVEGACIÓN LATERAL (sidebar)
  // -------------------------------
  const navLinks = document.querySelectorAll(".nav-link");

  if (navLinks.length > 0 && mainContent) {
    navLinks.forEach((link) => {
      link.addEventListener("click", async (e) => {
        e.preventDefault();

        // actualizar estado visual
        navLinks.forEach((l) => l.classList.remove("active"));
        link.classList.add("active");

        // cambiar clase de main para estilo
        const section = link.dataset.section || "inicio";
        mainContent.className = "main-content " + section;

        // ocultar todas las secciones y mostrar la seleccionada
        document.querySelectorAll(".section").forEach((s) => (s.style.display = "none"));
        const sectionId = `section${section.charAt(0).toUpperCase() + section.slice(1)}`;
        const sectionToShow = document.getElementById(sectionId);

        if (sectionToShow) {
          sectionToShow.style.display = "block";
        } else {
          // fallback sencillo si no existe
          mainContent.innerHTML = `<h1>${section.charAt(0).toUpperCase() + section.slice(1)}</h1>`;
        }

        // inicializar módulos según sección
        try {
          if (section === "vehiculos") {
            await cargarVehiculos(); // carga con token si aplica
          } else if (section === "reservas") {
            inicializarReservas();
          } else if (section === "pagos") {
            // si tienes cargarPagos() la llamas aquí
            // await cargarPagos();
          }
        } catch (err) {
          console.error("Error inicializando sección:", section, err);
        }
      });
    });
  }

  // -------------------------------
  // 🔹 AUTO CARGAR VEHÍCULOS AL INICIAR SESIÓN (si hay token)
  // -------------------------------
  (function autoLoadOnLogin() {
    const token = localStorage.getItem("token");
    if (!token || !mainContent) return;
    // ocultar todas las secciones y mostrar vehiculos
    document.querySelectorAll(".section").forEach((s) => (s.style.display = "none"));
    const sec = document.getElementById("sectionVehiculos");
    if (sec) sec.style.display = "block";

    // marcar en sidebar
    navLinks.forEach((link) => {
      if (link.dataset.section === "vehiculos") link.classList.add("active");
      else link.classList.remove("active");
    });

    // cargar
    cargarVehiculos().catch((e) => console.error("Auto-load vehiculos error:", e));
  })();

  // -------------------------------
  // 🔹 DELEGACIÓN: abrir modal nuevo vehículo (funciona aunque .btn-agregar sea dinámica)
  // -------------------------------
  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".btn-agregar");
    if (!btn) return;
    // abrir modal
    if (modal) {
      form?.reset();
      msgVehiculo && (msgVehiculo.textContent = "");
      modal.classList.add("is-open");
      modal.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
      const tipoEl = document.getElementById("tipo");
      if (tipoEl) tipoEl.focus();
    }
  });

  // Cerrar modal: botones dentro del modal (delegado seguro)
  document.addEventListener("click", (e) => {
    const closeBtn = e.target.closest(".modal-close");
    if (closeBtn && modal) closeModal();
    const cancelBtn = e.target.closest("#vehiculoCancel");
    if (cancelBtn && modal) closeModal();
    // click fuera del contenido
    if (e.target === modal) closeModal();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal?.classList.contains("is-open")) closeModal();
  });

  function closeModal() {
    modal?.classList.remove("is-open");
    modal?.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  // -------------------------------
  // 🔹 FUNCIÓN: CARGAR VEHÍCULOS (con filtro y eliminación)
  // -------------------------------
  async function cargarVehiculos(tipo = "TODOS") {
    const listContainer = document.getElementById("vehiculos-list");
    if (!listContainer) {
      console.warn("No se encontró el contenedor #vehiculos-list");
      return;
    }

    // leer token en el momento de la petición
    const token = localStorage.getItem("token");
    if (!token) {
      listContainer.innerHTML = `<p style="color:red;">No se encontró el token. Por favor, inicia sesión.</p>`;
      return;
    }

    listContainer.innerHTML = `<p class="cargando">Cargando vehículos...</p>`;

    let url = "http://localhost:8081/api/vehiculos/mios";
    if (tipo && tipo !== "TODOS") url += `/tipo/${tipo}`;

    try {
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      listContainer.innerHTML = "";

      if (!Array.isArray(data) || data.length === 0) {
        listContainer.innerHTML = `<p class="sin-vehiculos">No tienes vehículos registrados.</p>`;
        return;
      }

      data.forEach((v) => {
        const card = document.createElement("div");
        card.classList.add("vehiculo-card");
        card.innerHTML = `
          <div class="vehiculo-info">
            <h3><strong>Tipo:</strong> ${v.tipo}</h3>
            <p><strong>Placa:</strong> ${v.placa}</p>
            <p><strong>Propietario:</strong> ${v.propietario || "—"}</p>
          </div>
          <button class="btn-eliminar" data-id="${v.idVehiculo}">Eliminar</button>
        `;
        listContainer.appendChild(card);
      });

      // eventos eliminar (se agregan cada vez que se renderiza, no duplicados porque el contenedor se re-crea)
      listContainer.querySelectorAll(".btn-eliminar").forEach((btn) => {
        btn.addEventListener("click", async (ev) => {
          const id = btn.dataset.id;
          if (!confirm("¿Estás seguro de eliminar este vehículo?")) return;

          try {
            const tokenNow = localStorage.getItem("token");
            const res = await fetch(`http://localhost:8081/api/vehiculos/${id}`, {
              method: "DELETE",
              headers: { Authorization: `Bearer ${tokenNow}` },
            });

            if (!res.ok) {
              const text = await res.text();
              let errObj;
              try { errObj = JSON.parse(text); } catch { errObj = null; }
              if (errObj?.codigo === "E008") {
                showToast("El vehículo ya fue eliminado o tiene reservas activas ⚠️", "info");
                btn.closest(".vehiculo-card")?.remove();
                return;
              }
              throw new Error(`HTTP ${res.status}`);
            }

            btn.closest(".vehiculo-card")?.remove();
            showToast("Vehículo eliminado correctamente ✅", "success");
          } catch (err) {
            console.error("Error al eliminar vehículo:", err);
            showToast("Error al eliminar el vehículo ❌", "error");
          }
        });
      });
    } catch (err) {
      console.error("Error cargando vehículos:", err);
      listContainer.innerHTML = `<p style="color:red;">Error al cargar los vehículos.</p>`;
    }
  }

  // -------------------------------
  // 🔹 NAVBAR FILTROS VEHÍCULOS (HTML estático en tu template)
  //    Solo inicializamos evento global una vez para evitar fugas
  // -------------------------------
  if (!window.filtroVehiculosInicializado) {
    document.addEventListener("click", (e) => {
      const btn = e.target.closest(".filtro-btn");
      if (!btn) return;
      const tipo = btn.dataset.tipo;
      document.querySelectorAll(".filtro-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      cargarVehiculos(tipo);
    });
    window.filtroVehiculosInicializado = true;
  }

  // -------------------------------
  // 🔹 FORMULARIO: REGISTRAR VEHÍCULO
  // -------------------------------
  form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    msgVehiculo && (msgVehiculo.textContent = "");

    const tipo = document.getElementById("tipo")?.value?.trim();
    const placa = document.getElementById("placa")?.value?.trim().toUpperCase();

    if (!tipo || !placa) {
      msgVehiculo && (msgVehiculo.textContent = "Completa todos los campos.");
      return;
    }

    if (!/^[A-Z0-9]{6}$/.test(placa)) {
      msgVehiculo && ((msgVehiculo.textContent = "La placa debe tener 6 caracteres alfanuméricos."), (msgVehiculo.style.color = "red"));
      return;
    }

    const tokenNow = localStorage.getItem("token");
    if (!tokenNow) {
      msgVehiculo && (msgVehiculo.textContent = "Token no encontrado. Inicia sesión nuevamente.");
      return;
    }

    const btnSubmit = document.getElementById("vehiculoSubmit");
    btnSubmit.disabled = true;
    btnSubmit.textContent = "Registrando...";

    try {
      const res = await fetch("http://localhost:8081/api/vehiculos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokenNow}`,
        },
        body: JSON.stringify({ placa, tipo }),
      });

      if (!res.ok) {
        let errText = await res.text();
        try { errText = JSON.parse(errText).message || errText; } catch {}
        throw new Error(errText || `HTTP ${res.status}`);
      }

      msgVehiculo && (msgVehiculo.textContent = "Vehículo registrado correctamente ✅");
      await cargarVehiculos();
      setTimeout(() => closeModal(), 700);
    } catch (err) {
      console.error("Error registrar vehículo:", err);
      msgVehiculo && (msgVehiculo.textContent = `Error: ${err.message || err}`);
    } finally {
      btnSubmit.disabled = false;
      btnSubmit.textContent = "Registrar";
    }
  });

  // -------------------------------
  // 🔹 RESERVAS (módulo con token)
  // -------------------------------
  function inicializarReservas() {
    const reservaList = document.getElementById("reservaList");
    const filtroReserva = document.getElementById("filtroReserva");
    const btnAgregar = document.getElementById("btnAgregarReserva");
    const API_BASE = "http://localhost:8081/api/reservas/mias";

    if (!reservaList || !filtroReserva) {
      console.warn("Módulo reservas: elementos no encontrados");
      return;
    }
    if (filtroReserva.dataset.inicializado === "true") return;
    filtroReserva.dataset.inicializado = "true";

    // carga inicial
    cargarReservas();

    filtroReserva.addEventListener("change", async () => {
      const estado = filtroReserva.value;
      if (estado === "todos") await cargarReservas();
      else await cargarReservas(estado.toUpperCase());
    });

    btnAgregar?.addEventListener("click", () => {
      showToast("Funcionalidad de creación de reservas próximamente 🚀", "info");
    });

    async function cargarReservas(estado = null) {
      reservaList.innerHTML = `<p style="color:#777;">Cargando reservas...</p>`;

      const tokenNow = localStorage.getItem("token");
      if (!tokenNow) {
        showToast("Token no encontrado. Inicia sesión nuevamente ❌", "error");
        reservaList.innerHTML = `<p style="color:red;">Token no encontrado.</p>`;
        return;
      }

      try {
        const url = estado ? `${API_BASE}/estado/${estado}` : API_BASE;
        const response = await fetch(url, {
          headers: { Authorization: `Bearer ${tokenNow}`, "Content-Type": "application/json" },
        });

        if (!response.ok) throw new Error(`Error HTTP ${response.status}`);
        const data = await response.json();

        if (!Array.isArray(data) || data.length === 0) {
          reservaList.innerHTML = `<p style="color:#777;">No hay reservas ${estado ? "con estado " + estado : ""}.</p>`;
          return;
        }

        renderReservas(data);
      } catch (error) {
        console.error("Error al obtener reservas:", error);
        reservaList.innerHTML = `<p style="color:#d9534f;">Error al cargar las reservas.</p>`;
        showToast("Error al cargar las reservas ❌", "error");
      }
    }

    function renderReservas(lista) {
      reservaList.innerHTML = "";
      lista.forEach((r) => {
        const fechaInicio = formatearFecha(r.fechaInicio);
        const fechaFin = formatearFecha(r.fechaFin);
        const card = document.createElement("div");
        card.classList.add("reserva-card");
        card.innerHTML = `
          <div class="card-header">
            <h2>Reserva #${r.idReserva}</h2>
            <span class="estado ${r.estado}">${r.estado}</span>
          </div>  

          <div class="detalle">
            <p><span>Usuario:</span> ${r.nombreUsuario}</p>
            <p><span>Placa vehículo:</span> ${r.placaVehiculo}</p>
            <p><span>Espacio:</span> ${r.codigoEspacio}</p>
            <p><span>Fecha inicio:</span> ${r.fechaInicio}</p>
            <p><span>Fecha fin:</span> ${r.fechaFin}</p>
            ${r.observaciones ? `<p><span>Observaciones:</span> ${r.observaciones}</p>` : ""}
          </div>

          <div class="card-actions">
            <button class="btn-eliminar" title="Eliminar"><i class="fa-solid fa-trash"></i>Eliminar</button>
          </div>
        `;
        card.querySelector(".btn-eliminar").addEventListener("click", () => eliminarReserva(r.idReserva));
        reservaList.appendChild(card);
      });
    }

    async function eliminarReserva(idReserva) {
      if (!confirm("¿Seguro que deseas eliminar esta reserva?")) return;
      const tokenNow = localStorage.getItem("token");
      try {
        const response = await fetch(`http://localhost:8081/api/reservas/${idReserva}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${tokenNow}`, "Content-Type": "application/json" },
        });

        if (response.ok) {
          showToast("Reserva eliminada correctamente ✅", "success");
          // recargar con filtro actual
          const estado = filtroReserva.value;
          if (estado === "todos") await cargarReservas();
          else await cargarReservas(estado.toUpperCase());
        } else {
          const errorData = await response.json();
          console.error("Error al eliminar reserva:", errorData);
          showToast(errorData.mensaje || "Error al eliminar la reserva ❌", "error");
        }
      } catch (error) {
        console.error("Error de red:", error);
        showToast("Error de conexión al eliminar la reserva ❌", "error");
      }
    }

    function formatearFecha(fechaIso) {
      const fecha = new Date(fechaIso);
      return fecha.toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short", hour12: false });
    }
  } // fin inicializarReservas

  // -------------------------------
  // FIN DOMContentLoaded
  // -------------------------------
}); // end DOMContentLoaded

