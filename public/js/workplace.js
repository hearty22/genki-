    const parseJwt = (token)=>{
        try {
            return JSON.parse(atob(token.split(".")[1]))
        } catch (e) {
            return null
        }
    }

    // ✅ Función simplificada para obtener solo la foto de perfil
    async function loadProfilePicture() {
        try {
            const token = getCookie('token') || localStorage.getItem("token");

            if (!token) {
                console.log("❌ No se encontró token en loadProfilePicture - redirigiendo al login");
                window.location.href = '/login.html';
                return;
            }

            const payload = parseJwt(token);
            console.log("Usuario:", payload);

            if (payload && payload.user_name) {
                // ✅ Actualizar el mensaje de bienvenida
                const usernameElement = document.getElementById("username");
                if (usernameElement) {
                    usernameElement.textContent = payload.user_name;
                }

                // ✅ Obtener información completa del perfil del servidor
                const response = await fetch("/api/profile", {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.status === 401) {
                    console.log("❌ Token inválido en loadProfilePicture - redirigiendo al login");
                    window.location.href = '/login.html';
                    return;
                }

                if (response.ok) {
                    const data = await response.json();
                    const user = data.user;

                    // ✅ Actualizar el dropdown de perfil
                    const profilePicture = document.getElementById("profile-picture");
                    const profileName = document.querySelector(".pd-name strong");

                    if (profileName) {
                        profileName.textContent = user.user_name;
                    }

                    // ✅ Actualizar foto de perfil si existe
                    if (user.profile_photo_path && profilePicture) {
                        profilePicture.src = `/${user.profile_photo_path}`;
                        profilePicture.alt = `Foto de ${user.user_name}`;
                        console.log("✅ Foto de perfil cargada:", user.profile_photo_path);
                    } else if (profilePicture) {
                        // Si no hay foto, usar imagen por defecto
                        profilePicture.src = "./img/pfp-default.webp";
                        profilePicture.alt = "Foto de perfil por defecto";
                        console.log("📷 Usando imagen por defecto");
                    }

                    console.log("Perfil cargado exitosamente:", user.user_name);
                } else {
                    console.log("Error al obtener perfil:", response.status);
                }
            }
        } catch (error) {
            console.error("Error al cargar el perfil:", error);
        }
    }// ✅ Obtener token de cookies (como está configurado en el backend)
    const getCookie = (name) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    }

    // ✅ Cargar instituciones disponibles
    async function loadAllInstitutions() {
        try {
            console.log("🔄 Iniciando carga de instituciones...");
            const token = getCookie('token') || localStorage.getItem("token");
            console.log("🔑 Token encontrado:", !!token);

            if (!token) {
                console.log("❌ No se encontró token - redirigiendo al login");
                alert('Debes iniciar sesión para acceder al workplace');
                window.location.href = '/login.html';
                return;
            }

            console.log("🌐 Haciendo petición a /api/all-institutions");
            const response = await fetch("/api/all-institutions", {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log("📡 Respuesta recibida:", response.status, response.statusText);

            if (response.status === 401) {
                console.log("❌ Token inválido - redirigiendo al login");
                alert('Sesión expirada. Por favor inicia sesión nuevamente.');
                window.location.href = '/login.html';
                return;
            }

            if (response.ok) {
                const data = await response.json();
                console.log("📦 Datos recibidos:", data);

                const institutions = data.institutions;
                console.log("🏫 Número de instituciones:", institutions.length);

                // Obtener las instituciones del usuario
                const userResponse = await fetch("/api/institutions", {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                console.log("📡 Respuesta de instituciones del usuario:", userResponse.status);

                let userInstitutions = [];
                if (userResponse.ok) {
                    const userData = await userResponse.json();
                    userInstitutions = userData.institutions;
                    console.log("👤 Instituciones del usuario:", userInstitutions.length);
                } else {
                    console.log("⚠️ Error al obtener instituciones del usuario:", userResponse.status);
                }

                // Crear mapa de instituciones del usuario para acceso rápido
                const userInstitutionMap = new Map();
                userInstitutions.forEach(inst => {
                    userInstitutionMap.set(inst.id_institucion, inst);
                });

                // Actualizar la sección de instituciones
                const institutionsContainer = document.querySelector('.inicio');

                if (institutions.length === 0) {
                    console.log("📭 No hay instituciones disponibles");
                    institutionsContainer.innerHTML = `
                        <div class="no-institutions">
                            <p>No hay instituciones disponibles aún.</p>
                            <p>¡Sé el primero en crear una!</p>
                        </div>
                        <div class="claseagregar" onclick="showCreateInstitutionModal()">
                            <i class="bx bx-plus"></i>
                            <hr>
                            <div class="text">Crear primera institución</div>
                        </div>
                    `;
                } else {
                    console.log("🏗️ Construyendo HTML para", institutions.length, "instituciones");
                    let institutionsHTML = '';

                    institutions.forEach(institution => {
                        const userInst = userInstitutionMap.get(institution.id_institucion);
                        const isJoined = !!userInst;

                        institutionsHTML += `
                            <div class="clase${isJoined ? ' joined' : ''}" data-institution-id="${institution.id_institucion}">
                                <a href="#" ${isJoined ? `onclick="goToInstitution(${institution.id_institucion})"` : `onclick="joinInstitution(${institution.id_institucion})"`}>
                                    <div class="institution-logo-container">
                                        ${institution.logo ? `<img src="/${institution.logo}" alt="${institution.name}" class="institution-logo">` : `<img src="https://via.placeholder.com/300x150?text=${encodeURIComponent(institution.name)}" alt="${institution.name}" class="institution-logo">`}
                                    </div>
                                    <div class="instituto-titulo">${institution.name}</div>
                                    ${institution.nivel ? `<div class="nivel">${institution.nivel}</div>` : ''}
                                    <div class="instituto-info">
                                        ${isJoined ? `<span class="status joined">✓ Miembro</span>` : `<span class="status available">Disponible</span>`}
                                    </div>
                                </a>
                            </div>
                        `;
                    });

                    institutionsHTML += `
                        <div class="claseagregar" onclick="showCreateInstitutionModal()">
                            <i class="bx bx-plus"></i>
                            <hr>
                            <div class="text">Crear institución</div>
                        </div>
                    `;

                    institutionsContainer.innerHTML = institutionsHTML;
                }

                console.log("✅ Instituciones cargadas exitosamente:", institutions.length);
            } else {
                console.log("❌ Error al obtener instituciones:", response.status, response.statusText);
                const errorText = await response.text();
                console.log("❌ Detalles del error:", errorText);

                if (response.status === 401) {
                    alert('Sesión expirada. Redirigiendo al login...');
                    window.location.href = '/login.html';
                }
            }
        } catch (error) {
            console.error("❌ Error al cargar las instituciones:", error);
            alert('Error de conexión. Verifica tu conexión a internet.');
        }
    }

    // ✅ Funciones para el modal de institución
    function showCreateInstitutionModal() {
        // Crear modal si no existe
        if (!document.getElementById('institutionModal')) {
            const modalHTML = `
                <div id="institutionModal" class="modal">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h2>Crear Nueva Institución</h2>
                            <span class="close" onclick="closeInstitutionModal()">&times;</span>
                        </div>
                        <div class="modal-body">
                            <form id="institutionForm">
                                <div class="form-group">
                                    <label for="institutionName">Nombre de la Institución *</label>
                                    <input type="text" id="institutionName" name="name" required>
                                </div>
                                <div class="form-group">
                                    <label for="institutionSiglas">Siglas</label>
                                    <input type="text" id="institutionSiglas" name="siglas">
                                </div>
                                <div class="form-group">
                                    <label for="institutionAddress">Dirección</label>
                                    <input type="text" id="institutionAddress" name="address">
                                </div>
                                <div class="form-group">
                                    <label for="institutionNivel">Nivel</label>
                                    <select id="institutionNivel" name="nivel">
                                        <option value="">Seleccionar nivel</option>
                                        <option value="Primaria">Primaria</option>
                                        <option value="Secundaria">Secundaria</option>
                                        <option value="Terciaria">Terciaria</option>
                                        <option value="Universitaria">Universitaria</option>
                                        <option value="Posgrado">Posgrado</option>
                                    </select>
                                </div>
                                <div class="form-actions">
                                    <button type="button" class="cancel-btn" onclick="closeInstitutionModal()">Cancelar</button>
                                    <button type="submit" class="submit-btn">Crear Institución</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            `;

            document.body.insertAdjacentHTML('beforeend', modalHTML);
            addModalStyles();
        }

        document.getElementById('institutionModal').style.display = 'block';
    }

    function closeInstitutionModal() {
        const modal = document.getElementById('institutionModal');
        if (modal) {
            modal.style.display = 'none';
            document.getElementById('institutionForm').reset();
        }
    }

    // ✅ Agregar estilos para el modal
    function addModalStyles() {
        if (!document.getElementById('modalStyles')) {
            const styles = `
                <style id="modalStyles">
                    .modal {
                        display: none;
                        position: fixed;
                        z-index: 1000;
                        left: 0;
                        top: 0;
                        width: 100%;
                        height: 100%;
                        background-color: rgba(0, 0, 0, 0.5);
                        animation: fadeIn 0.3s ease;
                    }

                    .modal-content {
                        background: var(--sidebar-color);
                        margin: 5% auto;
                        padding: 0;
                        border-radius: 15px;
                        width: 90%;
                        max-width: 600px;
                        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
                        animation: slideIn 0.3s ease;
                    }

                    .modal-header {
                        padding: 20px 30px;
                        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                    }

                    .modal-header h2 {
                        color: var(--primary-color);
                        margin: 0;
                        font-size: 1.5em;
                    }

                    .close {
                        color: var(--text-color);
                        font-size: 28px;
                        font-weight: bold;
                        cursor: pointer;
                        transition: color 0.3s ease;
                    }

                    .close:hover {
                        color: var(--primary-color);
                    }

                    .modal-body {
                        padding: 30px;
                    }

                    .form-group {
                        margin-bottom: 20px;
                    }

                    .form-group label {
                        display: block;
                        margin-bottom: 8px;
                        color: var(--primary-color);
                        font-weight: 500;
                    }

                    .form-group input,
                    .form-group select {
                        width: 100%;
                        padding: 12px 15px;
                        border: 2px solid rgba(255, 255, 255, 0.1);
                        border-radius: 8px;
                        background: rgba(255, 255, 255, 0.05);
                        color: var(--text-color);
                        font-size: 14px;
                        transition: border-color 0.3s ease;
                    }

                    .form-group input:focus,
                    .form-group select:focus {
                        outline: none;
                        border-color: var(--primary-color);
                    }

                    .form-actions {
                        display: flex;
                        gap: 15px;
                        justify-content: flex-end;
                        margin-top: 30px;
                    }

                    .cancel-btn,
                    .submit-btn {
                        padding: 12px 24px;
                        border: none;
                        border-radius: 8px;
                        font-size: 14px;
                        font-weight: 500;
                        cursor: pointer;
                        transition: all 0.3s ease;
                    }

                    .cancel-btn {
                        background: rgba(255, 255, 255, 0.1);
                        color: var(--text-color);
                    }

                    .cancel-btn:hover {
                        background: rgba(255, 255, 255, 0.2);
                    }

                    .submit-btn {
                        background: linear-gradient(135deg, var(--primary-color), #667eea);
                        color: white;
                    }

                    .submit-btn:hover {
                        transform: translateY(-2px);
                        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
                    }

                    @keyframes fadeIn {
                        from { opacity: 0; }
                        to { opacity: 1; }
                    }

                    @keyframes slideIn {
                        from {
                            transform: translateY(-50px);
                            opacity: 0;
                        }
                        to {
                            transform: translateY(0);
                            opacity: 1;
                        }
                    }

                    .institution-logo {
                        width: 100%;
                        height: 120px;
                        object-fit: cover;
                        border-radius: 8px;
                        margin-bottom: 15px;
                        transition: transform 0.3s ease;
                    }

                    .institution-logo:hover {
                        transform: scale(1.02);
                    }

                    .instituto-titulo {
                        font-family: 'Raleway', cursive;
                        font-size: 1.3em;
                        font-weight: 600;
                        margin-bottom: 15px;
                        color: var(--primary-color);
                        text-align: center;
                        line-height: 1.3;
                    }

                    .instituto-info {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        gap: 10px;
                        margin-top: auto;
                        padding-top: 15px;
                    }

                    .nivel, .status {
                        background: rgba(255, 255, 255, 0.9);
                        padding: 6px 12px;
                        border-radius: 12px;
                        font-size: 0.8em;
                        font-weight: 500;
                        backdrop-filter: blur(5px);
                        border: 1px solid rgba(156, 39, 176, 0.2);
                    }

                    .status.joined {
                        background: rgba(76, 175, 80, 0.9);
                        color: white;
                        border-color: rgba(76, 175, 80, 0.3);
                    }

                    .status.available {
                        background: rgba(33, 150, 243, 0.9);
                        color: white;
                        border-color: rgba(33, 150, 243, 0.3);
                    }

                    .clase {
                        position: relative;
                        overflow: hidden;
                    }

                    .clase::before {
                        content: '';
                        position: absolute;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        background: linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.1) 50%, transparent 70%);
                        transform: translateX(-100%);
                        transition: transform 0.6s;
                        z-index: 1;
                    }

                    .clase:hover::before {
                        transform: translateX(100%);
                    }

                    .no-institutions {
                        grid-column: 1 / -1;
                        text-align: center;
                        color: var(--text-color);
                        opacity: 0.7;
                        padding: 60px 20px;
                        font-style: italic;
                        background: rgba(255, 255, 255, 0.05);
                        border-radius: 12px;
                        border: 2px dashed rgba(156, 39, 176, 0.2);
                    }

                    .no-institutions p {
                        margin: 15px 0;
                        font-size: 1.2em;
                        color: var(--primary-color);
                    }

                    .no-institutions p:last-child {
                        font-size: 1.1em;
                        opacity: 0.8;
                    }
                </style>
            `;
            document.head.insertAdjacentHTML('beforeend', styles);
        }
    }

    // ✅ Manejar el envío del formulario de institución
    document.addEventListener('submit', async function(e) {
        if (e.target.id === 'institutionForm') {
            e.preventDefault();

            const formData = new FormData(e.target);
            const institutionData = {
                name: formData.get('name'),
                siglas: formData.get('siglas'),
                address: formData.get('address'),
                nivel: formData.get('nivel')
            };

            try {
                const token = getCookie('token') || localStorage.getItem("token");

                if (!token) {
                    alert('No se encontró token de autenticación');
                    return;
                }

                const response = await fetch("/api/create-institution", {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(institutionData)
                });

                if (response.ok) {
                    alert('Institución creada exitosamente');
                    closeInstitutionModal();
                    loadAllInstitutions(); // Recargar las instituciones
                } else {
                    const errorData = await response.json();
                    alert('Error al crear la institución: ' + errorData.message);
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Error al procesar la solicitud');
            }
        }
    });

    // ✅ Cerrar modal al hacer clic fuera de él
    window.addEventListener('click', function(e) {
        const modal = document.getElementById('institutionModal');
        if (e.target === modal) {
            closeInstitutionModal();
        }
    });

    // ✅ Funciones para unirse a instituciones y navegar
    async function joinInstitution(institutionId) {
        try {
            const token = getCookie('token') || localStorage.getItem("token");

            if (!token) {
                alert('No se encontró token de autenticación');
                return;
            }

            const response = await fetch("/api/institutions", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    institutionId: institutionId,
                    role: 'Estudiante' // Rol por defecto
                })
            });

            if (response.ok) {
                alert('Te has unido a la institución exitosamente');
                loadAllInstitutions(); // Recargar las instituciones
            } else {
                const errorData = await response.json();
                alert('Error al unirte a la institución: ' + errorData.message);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error al procesar la solicitud');
        }
    }

    function goToInstitution(institutionId) {
        // Aquí puedes redirigir a una página específica de la institución
        console.log('Navegando a institución:', institutionId);
        // Por ejemplo: window.location.href = `/institution/${institutionId}`;
    }

    // ✅ Inicializar cuando se carga la página
    document.addEventListener('DOMContentLoaded', function() {
        console.log("🏠 Workplace cargado, inicializando...");
        loadProfilePicture();
        loadAllInstitutions();
    });
