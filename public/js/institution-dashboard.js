// ✅ Dashboard de Institución - Funcionalidad completa
(function() {
    let currentInstitution = null;
    let currentSection = 'dashboard';

    // ✅ Inicializar cuando se carga la página
    document.addEventListener('DOMContentLoaded', function() {
        console.log("🏫 Dashboard de institución cargado, inicializando...");
        initializeTheme();
        initializeInstitutionDashboard();
    });

    // ✅ Función para inicializar el tema
    function initializeTheme() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            document.body.classList.add('dark');
        }
    }

    // ✅ Función para toggle del sidebar en móviles
    function toggleMobileSidebar() {
        const sidebar = document.querySelector('.sidebar');
        const overlay = document.getElementById('sidebarOverlay');

        sidebar.classList.toggle('open');
        overlay.classList.toggle('active');

        if (sidebar.classList.contains('open')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    }

    // ✅ Función principal de inicialización
    async function initializeInstitutionDashboard() {
        try {
            // Obtener ID de institución del localStorage
            const institutionId = localStorage.getItem('selectedInstitutionId');
            if (!institutionId) {
                alert('❌ No se ha seleccionado ninguna institución');
                window.location.href = './workplace.html';
                return;
            }

            console.log('🏫 Inicializando dashboard para institución:', institutionId);

            // Cargar información de la institución
            await loadInstitutionData(institutionId);

            // Cargar datos del dashboard
            await loadDashboardData();

            // Configurar navegación
            setupNavigation();

            // Cargar perfil de usuario
            loadUserProfile();

            console.log('✅ Dashboard inicializado correctamente');
        } catch (error) {
            console.error('❌ Error al inicializar dashboard:', error);
            alert('Error al cargar el dashboard de la institución');
        }
    }

    // ✅ Cargar datos de la institución
    async function loadInstitutionData(institutionId) {
        try {
            const token = getCookie('token') || localStorage.getItem("token");

            if (!token) {
                alert('❌ Token no encontrado');
                window.location.href = './login.html';
                return;
            }

            const response = await fetch(`/api/institutions/${institutionId}`, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                currentInstitution = data.institution;

                // Actualizar información en la UI
                updateInstitutionInfo();
            } else {
                console.error('❌ Error al cargar institución:', response.status);
                throw new Error('No se pudo cargar la información de la institución');
            }
        } catch (error) {
            console.error('❌ Error:', error);
            throw error;
        }
    }

    // ✅ Actualizar información de la institución en la UI
    function updateInstitutionInfo() {
        if (!currentInstitution) return;

        // Actualizar título
        const titleElement = document.getElementById('institutionTitle');
        const nameElement = document.getElementById('institutionName');

        if (titleElement) titleElement.textContent = currentInstitution.name;
        if (nameElement) nameElement.textContent = currentInstitution.name;

        // Actualizar detalles
        const detailsElement = document.getElementById('institutionDetails');
        if (detailsElement) {
            detailsElement.innerHTML = `
                ${currentInstitution.nivel || 'Sin nivel'} •
                ${currentInstitution.siglas || 'Sin siglas'} •
                ${currentInstitution.address || 'Sin dirección'}
            `;
        }

        console.log('✅ Información de institución actualizada');
    }

    // ✅ Cargar datos del dashboard
    async function loadDashboardData() {
        try {
            const token = getCookie('token') || localStorage.getItem("token");

            // Simular carga de datos (en una implementación real, harías llamadas a APIs)
            setTimeout(() => {
                // Actualizar contadores
                document.getElementById('students-count').textContent = '24';
                document.getElementById('teachers-count').textContent = '8';
                document.getElementById('events-count').textContent = '12';
                document.getElementById('reports-count').textContent = '5';

                // Actualizar actividad reciente
                updateRecentActivity();
            }, 1000);

        } catch (error) {
            console.error('❌ Error al cargar datos del dashboard:', error);
        }
    }

    // ✅ Actualizar actividad reciente
    function updateRecentActivity() {
        const activityContainer = document.getElementById('recentActivity');

        const activities = [
            'Nuevo estudiante registrado: María González',
            'Evento creado: Reunión de padres - 15/10/2024',
            'Reporte generado: Asistencia mensual',
            'Docente agregado: Prof. Carlos Rodríguez',
            'Actualización de calificaciones completada'
        ];

        activityContainer.innerHTML = activities.map(activity =>
            `<div class="activity-item">
                <i class="fas fa-circle"></i>
                <span>${activity}</span>
                <small>Hace 2 horas</small>
            </div>`
        ).join('');
    }

    // ✅ Configurar navegación entre secciones
    function setupNavigation() {
        const navLinks = document.querySelectorAll('.nav-link a');

        navLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();

                const sectionName = this.textContent.trim().toLowerCase();

                // Remover clase active de todos los enlaces
                navLinks.forEach(l => l.classList.remove('active'));

                // Agregar clase active al enlace actual
                this.classList.add('active');

                // Mostrar sección correspondiente
                showSection(sectionName);
            });
        });

        // Configurar toggle del sidebar
        const sidebarToggle = document.querySelector('.sidebar .toggle');
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', function() {
                document.querySelector('.sidebar').classList.toggle('close');
            });
        }

        // Configurar modo oscuro
        const modeToggle = document.querySelector('.toggle-switch');
        if (modeToggle) {
            modeToggle.addEventListener('click', function() {
                document.body.classList.toggle('dark');
                // Guardar preferencia en localStorage
                const isDark = document.body.classList.contains('dark');
                localStorage.setItem('theme', isDark ? 'dark' : 'light');
            });
        }

        // Configurar dropdown del perfil
        const profileBtn = document.getElementById('profileBtn');
        const profileDropdown = document.getElementById('profileDropdown');

        if (profileBtn && profileDropdown) {
            profileBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                profileDropdown.classList.toggle('open');
            });

            // Cerrar dropdown al hacer click fuera
            document.addEventListener('click', function(e) {
                if (!profileBtn.contains(e.target) && !profileDropdown.contains(e.target)) {
                    profileDropdown.classList.remove('open');
                }
            });
        }

        // Configurar logout
        const logoutBtn = document.querySelector('.button-logout');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function() {
                if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
                    localStorage.removeItem('token');
                    window.location.href = './login.html';
                }
            });
        }
    }

    // ✅ Mostrar sección específica
    function showSection(sectionName) {
        // Ocultar todas las secciones
        const sections = document.querySelectorAll('.section');
        sections.forEach(section => section.classList.remove('active'));

        // Mostrar sección seleccionada
        const targetSection = document.getElementById(`${sectionName}-section`);
        if (targetSection) {
            targetSection.classList.add('active');
            currentSection = sectionName;

            // Cargar contenido específico de la sección
            loadSectionContent(sectionName);
        }
    }

    // ✅ Cargar contenido específico de cada sección
    async function loadSectionContent(sectionName) {
        switch(sectionName) {
            case 'calendar':
                loadCalendarSection();
                break;
            case 'students':
                loadStudentsSection();
                break;
            case 'teachers':
                loadTeachersSection();
                break;
            case 'reports':
                loadReportsSection();
                break;
            case 'settings':
                loadSettingsSection();
                break;
        }
    }

    // ✅ Cargar sección de calendario
    function loadCalendarSection() {
        const calendarContainer = document.getElementById('calendarContainer');

        // Crear iframe para el calendario
        calendarContainer.innerHTML = `
            <iframe src="./calendar.html"
                    style="width: 100%; height: 80vh; border: none; border-radius: 15px;"
                    title="Calendario Institucional">
            </iframe>
        `;
    }

    // ✅ Cargar sección de estudiantes
    async function loadStudentsSection() {
        const studentsContainer = document.getElementById('studentsList');

        try {
            // Simular carga de estudiantes
            setTimeout(() => {
                studentsContainer.innerHTML = `
                    <div class="student-item">
                        <div class="student-info">
                            <h4>María González</h4>
                            <p>Grado: 5to Año</p>
                        </div>
                        <div class="student-actions">
                            <button class="btn btn-secondary" onclick="editStudent(1)">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-danger" onclick="deleteStudent(1)">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                    <div class="student-item">
                        <div class="student-info">
                            <h4>Carlos Rodríguez</h4>
                            <p>Grado: 4to Año</p>
                        </div>
                        <div class="student-actions">
                            <button class="btn btn-secondary" onclick="editStudent(2)">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-danger" onclick="deleteStudent(2)">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                `;
            }, 800);
        } catch (error) {
            studentsContainer.innerHTML = '<p>Error al cargar estudiantes</p>';
        }
    }

    // ✅ Cargar sección de docentes
    async function loadTeachersSection() {
        const teachersContainer = document.getElementById('teachersList');

        try {
            setTimeout(() => {
                teachersContainer.innerHTML = `
                    <div class="teacher-item">
                        <div class="teacher-info">
                            <h4>Prof. Ana Martínez</h4>
                            <p>Materia: Matemáticas</p>
                        </div>
                        <div class="teacher-actions">
                            <button class="btn btn-secondary" onclick="editTeacher(1)">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-danger" onclick="deleteTeacher(1)">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                    <div class="teacher-item">
                        <div class="teacher-info">
                            <h4>Prof. Luis García</h4>
                            <p>Materia: Historia</p>
                        </div>
                        <div class="teacher-actions">
                            <button class="btn btn-secondary" onclick="editTeacher(2)">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-danger" onclick="deleteTeacher(2)">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                `;
            }, 800);
        } catch (error) {
            teachersContainer.innerHTML = '<p>Error al cargar docentes</p>';
        }
    }

    // ✅ Cargar sección de reportes
    function loadReportsSection() {
        // Los reportes ya están estáticos en el HTML
        console.log('📊 Reportes cargados');
    }

    // ✅ Cargar sección de configuración
    function loadSettingsSection() {
        // Configuración ya está estática en el HTML
        console.log('⚙️ Configuración cargada');
    }

    // ✅ Funciones para generar reportes
    function generateAttendanceReport() {
        alert('🏗️ Generando reporte de asistencia...\n\nEn una implementación completa, aquí se generaría el reporte de asistencia.');
    }

    function generateAcademicReport() {
        alert('🏗️ Generando reporte académico...\n\nEn una implementación completa, aquí se generaría el reporte académico.');
    }

    function generateFinancialReport() {
        alert('🏗️ Generando reporte financiero...\n\nEn una implementación completa, aquí se generaría el reporte financiero.');
    }

    // ✅ Funciones para configuración
    function editInstitutionInfo() {
        alert('🏗️ Editando información de institución...\n\nEn una implementación completa, aquí se abriría un modal para editar la información.');
    }

    function systemSettings() {
        alert('🏗️ Configuración del sistema...\n\nEn una implementación completa, aquí se mostrarían las opciones de configuración.');
    }

    function manageUsers() {
        alert('🏗️ Gestionando usuarios...\n\nEn una implementación completa, aquí se mostraría la gestión de usuarios.');
    }

    // ✅ Funciones placeholder para futuras implementaciones
    function editStudent(id) {
        alert(`✏️ Editando estudiante ID: ${id}\n\nEn una implementación completa, aquí se abriría un modal de edición.`);
    }

    function deleteStudent(id) {
        if (confirm(`¿Estás seguro de que quieres eliminar el estudiante ID: ${id}?`)) {
            alert(`🗑️ Estudiante ${id} eliminado\n\nEn una implementación completa, aquí se eliminaría de la base de datos.`);
        }
    }

    function editTeacher(id) {
        alert(`✏️ Editando docente ID: ${id}\n\nEn una implementación completa, aquí se abriría un modal de edición.`);
    }

    function deleteTeacher(id) {
        if (confirm(`¿Estás seguro de que quieres eliminar el docente ID: ${id}?`)) {
            alert(`🗑️ Docente ${id} eliminado\n\nEn una implementación completa, aquí se eliminaría de la base de datos.`);
        }
    }

    function editInstitutionInfo() {
        alert('🏗️ Editar información de institución\n\nEn una implementación completa, aquí se abriría un modal para editar la información de la institución.');
    }

    function systemSettings() {
        alert('🏗️ Configuración del sistema\n\nEn una implementación completa, aquí se mostrarían las opciones de configuración del sistema.');
    }

    function manageUsers() {
        alert('🏗️ Gestionar usuarios\n\nEn una implementación completa, aquí se mostraría la gestión de usuarios y permisos.');
    }

    // ✅ Cargar perfil de usuario (reutilizando función del workplace)
    async function loadUserProfile() {
        try {
            const token = getCookie('token') || localStorage.getItem("token");

            if (!token) {
                console.log("❌ No se encontró token en loadUserProfile");
                return;
            }

            const response = await fetch("/api/profile", {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                const user = data.user;

                const profilePicture = document.getElementById("profile-picture");
                const profileName = document.querySelector(".pd-name strong");

                if (profileName) {
                    profileName.textContent = user.user_name;
                }

                if (user.profile_photo_path && profilePicture) {
                    profilePicture.src = `/${user.profile_photo_path}`;
                    profilePicture.alt = `Foto de ${user.user_name}`;
                } else if (profilePicture) {
                    profilePicture.src = "./img/pfp-default.webp";
                    profilePicture.alt = "Foto de perfil por defecto";
                }
            }
        } catch (error) {
            console.error("Error al cargar el perfil:", error);
        }
    }

    // ✅ Función para obtener cookies (reutilizada del workplace)
    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    }

    // ✅ Hacer funciones globales para que puedan ser llamadas desde HTML
    window.showSection = showSection;
    window.showAddStudentModal = showAddStudentModal;
    window.showAddTeacherModal = showAddTeacherModal;
    window.editStudent = editStudent;
    window.deleteStudent = deleteStudent;
    window.editTeacher = editTeacher;
    window.deleteTeacher = deleteTeacher;
    window.editInstitutionInfo = editInstitutionInfo;
    window.systemSettings = systemSettings;
    window.manageUsers = manageUsers;
    window.generateAttendanceReport = generateAttendanceReport;
    window.generateAcademicReport = generateAcademicReport;
    window.generateFinancialReport = generateFinancialReport;
    window.toggleMobileSidebar = toggleMobileSidebar;

})();
