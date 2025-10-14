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

// ✅ Cargar instituciones del usuario
async function loadUserInstitutions() {
    try {
        const token = getCookie('token') || localStorage.getItem("token");

        if (!token) {
            console.log("No se encontró token");
            return;
        }

        const response = await fetch("/api/institutions", {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            const institutions = data.institutions;

            // Actualizar estadística de instituciones
            document.getElementById("statSessions").textContent = institutions.length;

            // Crear sección de instituciones si no existe
            let institutionsSection = document.querySelector('.institutions-section');
            if (!institutionsSection) {
                institutionsSection = document.createElement('div');
                institutionsSection.className = 'institutions-section';
                institutionsSection.innerHTML = `
                    <h2>Mis Instituciones</h2>
                    <div class="institutions-grid" id="institutionsGrid">
                        <!-- Las instituciones se cargarán aquí -->
                    </div>
                `;

                // Insertar después de las estadísticas
                const statsSection = document.querySelector('.stats-section');
                statsSection.parentNode.insertBefore(institutionsSection, statsSection.nextSibling);
            }

            const institutionsGrid = document.getElementById('institutionsGrid');

            if (institutions.length === 0) {
                institutionsGrid.innerHTML = '<p class="no-institutions">No estás asignado a ninguna institución aún.</p>';
            } else {
                institutionsGrid.innerHTML = institutions.map(inst => `
                    <div class="institution-card">
                        <div class="institution-header">
                            <h3>${inst.name}</h3>
                            ${inst.siglas ? `<span class="institution-siglas">${inst.siglas}</span>` : ''}
                        </div>
                        ${inst.logo ? `<img src="/${inst.logo}" alt="Logo de ${inst.name}" class="institution-logo">` : 
                        `<div class="institution-logo" style="display:flex;align-items:center;justify-content:center;font-size:2rem;font-weight:bold;color:var(--primary-color);">${inst.name.charAt(0)}</div>`}
                        <div class="institution-info">
                            ${inst.address ? `<p><strong>Dirección:</strong> <span>${inst.address}</span></p>` : ''}
                            ${inst.nivel ? `<p><strong>Nivel:</strong> <span>${inst.nivel}</span></p>` : ''}
                            <p><strong>Rol:</strong> <span>${inst.role || 'Sin especificar'}</span></p>
                            <p><strong>Miembro desde:</strong> <span>${new Date(inst.joinedAt).toLocaleDateString('es-ES')}</span></p>
                        </div>
                    </div>
                `).join('');
            }

            console.log("✅ Instituciones cargadas exitosamente:", institutions.length);
        } else {
            console.log("Error al obtener instituciones:", response.status);
        }
    } catch (error) {
        console.error("Error al cargar las instituciones:", error);
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
                if (user.createdAt) {
                    const date = new Date(user.createdAt);
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

// ✅ Funciones para el modal de institución
function showCreateInstitutionModal() {
    document.getElementById('institutionModal').style.display = 'block';
}

function closeInstitutionModal() {
    document.getElementById('institutionModal').style.display = 'none';
    document.getElementById('institutionForm').reset();
}

// ✅ Manejar el envío del formulario de institución
document.getElementById('institutionForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const institutionData = {
        name: formData.get('name'),
        siglas: formData.get('siglas'),
        address: formData.get('address'),
        nivel: formData.get('nivel'),
        role: formData.get('role')
    };

    try {
        const token = getCookie('token') || localStorage.getItem("token");

        if (!token) {
            alert('No se encontró token de autenticación');
            return;
        }

        // Primero crear la institución
        const createResponse = await fetch("/api/institutions", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(institutionData)
        });

        if (createResponse.ok) {
            const createResult = await createResponse.json();
            const institutionId = createResult.institution.id_institucion;

            // Luego asignar la institución al usuario
            const assignResponse = await fetch("/api/institutions", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    institutionId: institutionId,
                    role: institutionData.role
                })
            });

            if (assignResponse.ok) {
                alert('Institución creada y asignada exitosamente');
                closeInstitutionModal();
                loadUserInstitutions(); // Recargar las instituciones
            } else {
                const errorData = await assignResponse.json();
                alert('Error al asignar la institución: ' + errorData.message);
            }
        } else {
            const errorData = await createResponse.json();
            alert('Error al crear la institución: ' + errorData.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al procesar la solicitud');
    }
});

// ✅ Cerrar modal al hacer clic fuera de él
window.addEventListener('click', function(e) {
    const modal = document.getElementById('institutionModal');
    if (e.target === modal) {
        closeInstitutionModal();
    }
});

// ✅ Cargar todo cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    loadUserProfile();
    loadUserInstitutions();
    initDropdown();
});
