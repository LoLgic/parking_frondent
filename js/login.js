const form = document.getElementById("loginForm");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const credenciales = {
        email: document.getElementById("email").value,
        clave: document.getElementById("clave").value,
    };

    try {
        const response = await fetch("http://localhost:8081/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(credenciales),
        });

        if (!response.ok) {
            let errorMessage = "Credenciales incorrectas";
            try {
                const errorData = await response.json();
                errorMessage = errorData.message || errorMessage;
            } catch {
                errorMessage = `Error ${response.status}: ${response.statusText}`;
            }
            document.getElementById("mensajeError").innerText = errorMessage;
            document.getElementById("mensajeExito").innerText = "";
            return;
        }

        const data = await response.json();

        // Guardar el token en localStorage
        localStorage.setItem("token", data.token);

        // Redireccionar si lo deseas
        window.location.href = "dashboard.html";

    } catch (err) {
        console.error("Error de red:", err);
        document.getElementById("mensajeError").innerText = "Error de conexión con el servidor";
        document.getElementById("mensajeExito").innerText = "";
    }
});