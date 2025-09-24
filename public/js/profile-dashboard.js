// ✅ Función para obtener token de cookies
const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

// ✅ Función para decodificar JWT
const parseJwt = (token) => {
    try {
        return JSON.parse(atob(token.split(".")[1]))
    } catch (e) {
        return null
    }
}

// ✅ Cargar información del perfil del usuario
async function loadUserProfile() {
    try {
        const token = getCookie('token') || localStorage.getItem("token");

        if (!token) {
            console.log("No se encontró token, redirigiendo al login");
            window.location.href = 'index.html';
            return;
        }

        const payload = parseJwt(token);
        console.log("Usuario:", payload);

        if (payload) {
            // ✅ Actualizar información básica
            document.getElementById("userName").textContent = payload.user_name || 'No disponible';
            document.getElementById("username").textContent = payload.user_name || 'Usuario';

            // ✅ Obtener información completa del servidor
            const response = await fetch("/api/profile", {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                const user = data.user;

                // ✅ Actualizar todos los campos
                document.getElementById("userName").textContent = user.user_name || 'No disponible';
                document.getElementById("userEmail").textContent = user.email || 'No disponible';
                document.getElementById("userGender").textContent = user.gender || 'No disponible';

                // ✅ Formatear fecha de creación
                if (user.created_at) {
                    const date = new Date(user.created_at);
                    document.getElementById("userJoined").textContent =
                        date.toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        });
                }

                // ✅ Actualizar foto de perfil
                const profileAvatar = document.getElementById("profileAvatar");
                if (user.profile_photo_path) {
                    profileAvatar.src = `/${user.profile_photo_path}`;
                    document.getElementById("profileStatus").textContent = "✅ Configurada";
                    document.getElementById("statPhotos").textContent = "1";
                } else {
                    profileAvatar.src = "./img/pfp-default.webp";
                    document.getElementById("profileStatus").textContent = "❌ No configurada";
                    document.getElementById("statPhotos").textContent = "0";
                }

                // ✅ Calcular completitud del perfil
                let completeness = 0;
                if (user.user_name) completeness += 25;
                if (user.email) completeness += 25;
                if (user.gender) completeness += 25;
                if (user.profile_photo_path) completeness += 25;

                document.getElementById("statProfile").textContent = `${completeness}%`;

                console.log("✅ Perfil cargado exitosamente:", user.user_name);
            } else {
                console.log("Error al obtener perfil:", response.status);
                document.getElementById("userEmail").textContent = "Error al cargar";
                document.getElementById("userGender").textContent = "Error al cargar";
            }
        }
    } catch (error) {
        console.error("Error al cargar el perfil:", error);
        alert("Error al cargar la información del perfil");
    }
}

// ✅ Inicializar dropdown del navbar
function initDropdown() {
    const profileBtn = document.getElementById('profileBtn');
    const profileDropdown = document.getElementById('profileDropdown');
    const logoutBtn = document.querySelector('.button-logout');
    const profileLinks = document.querySelectorAll('.pd-link');

    if (profileBtn && profileDropdown) {
        // Toggle dropdown
        profileBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            profileDropdown.classList.toggle('open');
        });

        // Cerrar al hacer clic fuera
        document.addEventListener('click', function(e) {
            if (!profileBtn.contains(e.target) && !profileDropdown.contains(e.target)) {
                profileDropdown.classList.remove('open');
            }
        });

        // Redirigir a perfil
        if (profileLinks.length > 0) {
            profileLinks[0].addEventListener('click', function(e) {
                e.preventDefault();
                window.location.href = 'profile-dashboard.html';
            });
        }

        // Cerrar sesión
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function() {
                document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                localStorage.removeItem("token");
                window.location.href = 'index.html';
            });
        }
    }
}

// ✅ Cargar todo cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    loadUserProfile();
    initDropdown();
});
