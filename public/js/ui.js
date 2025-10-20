import { CONFIG } from './config.js';

// Clase para manejar la interfaz de usuario
export class UIManager {
    constructor() {
        this.elements = {};
        this.currentView = 'register';
        this.loadingStates = new Set();
        
        // Inicializar cuando el DOM esté listo
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initialize());
        } else {
            this.initialize();
        }
    }

    // Inicializar elementos del DOM y eventos
    initialize() {
        this.cacheElements();
        this.setupEventListeners();
    }

    // Cachear elementos del DOM
    cacheElements() {
        this.elements = {
            // Contenedores principales
            registerContainer: document.getElementById('register-section'),
            loginContainer: document.getElementById('login-section'),
            dashboardContainer: document.getElementById('dashboard-section'),
            dashboardMain: document.getElementById('dashboard-main'),
            profileSection: document.getElementById('profile-section'),
            
            // Formularios
            registerForm: document.getElementById('register-form'),
            loginForm: document.getElementById('login-form'),
            profileForm: document.getElementById('profile-form'),
            
            // Botones de navegación
            showDashboardBtn: document.getElementById('show-dashboard-btn'),
            showProfileBtn: document.getElementById('show-profile-btn'),
            
            // Botones
            registerBtn: document.getElementById('register-btn'),
            loginBtn: document.getElementById('login-btn'),
            logoutBtn: document.getElementById('logout-btn'),
            showLoginBtn: document.getElementById('show-login'),
            showRegisterBtn: document.getElementById('show-register'),
            saveProfileBtn: document.getElementById('save-profile-btn'),
            cancelProfileBtn: document.getElementById('cancel-profile-btn'),
            
            // Campos de formulario
            registerFirstName: document.getElementById('firstName'),
            registerLastName: document.getElementById('lastName'),
            registerEmail: document.getElementById('email'),
            registerPassword: document.getElementById('password'),
            loginEmail: document.getElementById('login-email'),
            loginPassword: document.getElementById('login-password'),
            
            // Campos de perfil
            profileFirstName: document.getElementById('profile-firstName'),
            profileLastName: document.getElementById('profile-lastName'),
            profileEmail: document.getElementById('profile-email'),
            profilePhone: document.getElementById('profile-phone'),
            profileBio: document.getElementById('profile-bio'),
            
            // Elementos de imagen de perfil
            profileImagePreview: document.getElementById('profile-image-preview'),
            profileImagePlaceholder: document.getElementById('profile-image-placeholder'),
            fileUploadTab: document.getElementById('file-upload-tab'),
            urlUploadTab: document.getElementById('url-upload-tab'),
            fileUploadSection: document.getElementById('file-upload-section'),
            urlUploadSection: document.getElementById('url-upload-section'),
            profileImageFile: document.getElementById('profile-image-file'),
            selectFileBtn: document.getElementById('select-file-btn'),
            profileImageUrl: document.getElementById('profile-image-url'),
            loadUrlBtn: document.getElementById('load-url-btn'),
            removeImageBtn: document.getElementById('remove-image-btn'),
            
            // Avatar en dashboard
            userAvatar: document.getElementById('user-avatar'),
            userAvatarImg: document.getElementById('user-avatar-img'),
            userAvatarPlaceholder: document.getElementById('user-avatar-placeholder'),
            
            // Elementos de error
            registerFirstNameError: document.getElementById('firstName-error'),
            registerLastNameError: document.getElementById('lastName-error'),
            registerEmailError: document.getElementById('email-error'),
            registerPasswordError: document.getElementById('password-error'),
            loginEmailError: document.getElementById('login-email-error'),
            loginPasswordError: document.getElementById('login-password-error'),
            
            // Dashboard
            userFirstName: document.getElementById('user-name'),
            userLastName: document.getElementById('user-name'), // Usando el mismo elemento para el nombre completo
            userEmail: document.getElementById('user-email'),
            userCreatedAt: document.getElementById('user-created'),
            
            // Notificaciones
            notification: document.getElementById('notification'),
            notificationMessage: document.getElementById('notification-message')
        };
    }

    // Configurar event listeners
    setupEventListeners() {
        // Navegación entre formularios
        if (this.elements.showLoginBtn) {
            this.elements.showLoginBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showLogin();
            });
        }

        if (this.elements.showRegisterBtn) {
            this.elements.showRegisterBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showRegister();
            });
        }

        // Navegación del dashboard
        if (this.elements.showDashboardBtn) {
            this.elements.showDashboardBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showDashboardMain();
            });
        }

        if (this.elements.showProfileBtn) {
            this.elements.showProfileBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showProfile();
            });
        }

        // Botones del perfil
        if (this.elements.cancelProfileBtn) {
            this.elements.cancelProfileBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showDashboardMain();
            });
        }

        // Event listeners para imagen de perfil
        this.setupImageEventListeners();
    }

    // Configurar event listeners específicos para imagen de perfil
    setupImageEventListeners() {
        // Tabs de carga de imagen
        if (this.elements.fileUploadTab) {
            this.elements.fileUploadTab.addEventListener('click', () => {
                this.switchUploadTab('file');
            });
        }

        if (this.elements.urlUploadTab) {
            this.elements.urlUploadTab.addEventListener('click', () => {
                this.switchUploadTab('url');
            });
        }

        // Botón para seleccionar archivo
        if (this.elements.selectFileBtn) {
            this.elements.selectFileBtn.addEventListener('click', () => {
                this.elements.profileImageFile?.click();
            });
        }

        // Cambio de archivo
        if (this.elements.profileImageFile) {
            this.elements.profileImageFile.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    this.previewImageFile(file);
                }
            });
        }

        // Botón para cargar URL
        if (this.elements.loadUrlBtn) {
            this.elements.loadUrlBtn.addEventListener('click', () => {
                const url = this.elements.profileImageUrl?.value.trim();
                if (url) {
                    this.previewImageUrl(url);
                }
            });
        }

        // Enter en campo URL
        if (this.elements.profileImageUrl) {
            this.elements.profileImageUrl.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.elements.loadUrlBtn?.click();
                }
            });
        }

        // Botón para remover imagen
        if (this.elements.removeImageBtn) {
            this.elements.removeImageBtn.addEventListener('click', () => {
                this.clearImagePreview();
            });
        }

        // Cerrar notificaciones al hacer clic
        if (this.elements.notification) {
            this.elements.notification.addEventListener('click', () => {
                this.hideNotification();
            });
        }
    }

    // Mostrar formulario de registro
    showRegister() {
        this.currentView = 'register';
        this.hideAllContainers();
        this.showElement(this.elements.registerContainer);
        this.clearAllErrors();
        this.clearAllForms();
    }

    // Mostrar formulario de login
    showLogin() {
        this.currentView = 'login';
        this.hideAllContainers();
        this.showElement(this.elements.loginContainer);
        this.clearAllErrors();
        this.clearAllForms();
    }

    // Mostrar dashboard
    showDashboard() {
        this.currentView = 'dashboard';
        this.hideAllContainers();
        this.showElement(this.elements.dashboardContainer);
        this.showDashboardMain(); // Mostrar la vista principal por defecto
        this.clearAllErrors();
    }

    // Mostrar la vista principal del dashboard
    showDashboardMain() {
        if (this.elements.dashboardMain) {
            this.elements.dashboardMain.style.display = 'block';
        }
        if (this.elements.profileSection) {
            this.elements.profileSection.style.display = 'none';
        }
        this.updateNavButtons('dashboard');
    }

    // Mostrar la sección de perfil
    showProfile() {
        if (this.elements.dashboardMain) {
            this.elements.dashboardMain.style.display = 'none';
        }
        if (this.elements.profileSection) {
            this.elements.profileSection.style.display = 'block';
        }
        this.updateNavButtons('profile');
        this.loadProfileData();
    }

    // Actualizar botones de navegación
    updateNavButtons(activeView) {
        if (this.elements.showDashboardBtn) {
            this.elements.showDashboardBtn.classList.toggle('active', activeView === 'dashboard');
        }
        if (this.elements.showProfileBtn) {
            this.elements.showProfileBtn.classList.toggle('active', activeView === 'profile');
        }
    }

    // Método genérico para mostrar vistas
    showView(viewName) {
        switch(viewName) {
            case 'register':
                this.showRegister();
                break;
            case 'login':
                this.showLogin();
                break;
            case 'dashboard':
                this.showDashboard();
                break;
            default:
                console.warn(`Vista desconocida: ${viewName}`);
        }
    }

    // Ocultar todos los contenedores
    hideAllContainers() {
        const containers = [
            this.elements.registerContainer,
            this.elements.loginContainer,
            this.elements.dashboardContainer
        ];
        
        containers.forEach(container => {
            if (container) {
                container.style.display = 'none';
            }
        });
    }

    // Mostrar elemento
    showElement(element) {
        if (element) {
            element.style.display = 'block';
        }
    }

    // Actualizar dashboard con datos del usuario
    updateDashboard(user) {
        if (!user) return;

        // Actualizar nombre completo
        if (this.elements.userFirstName) {
            this.elements.userFirstName.textContent = `${user.firstName} ${user.lastName}`;
        }

        // Actualizar email
        if (this.elements.userEmail) {
            this.elements.userEmail.textContent = user.email;
        }

        // Actualizar fecha de creación
        if (this.elements.userCreatedAt) {
            this.elements.userCreatedAt.textContent = new Date(user.createdAt).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }

        // Actualizar imagen de perfil en dashboard
        this.updateUserAvatar(user.profileImage);

        // Guardar datos del usuario para el perfil
        this.currentUser = user;
    }

    // Cargar datos del perfil en el formulario
    loadProfileData() {
        if (!this.currentUser) return;

        const user = this.currentUser;
        
        if (this.elements.profileFirstName) {
            this.elements.profileFirstName.value = user.firstName || '';
        }
        
        if (this.elements.profileLastName) {
            this.elements.profileLastName.value = user.lastName || '';
        }
        
        if (this.elements.profileEmail) {
            this.elements.profileEmail.value = user.email || '';
        }
        
        if (this.elements.profilePhone) {
            this.elements.profilePhone.value = user.phone || '';
        }
        
        if (this.elements.profileBio) {
            this.elements.profileBio.value = user.bio || '';
        }

        // Cargar imagen de perfil
        this.loadProfileImage(user.profileImage);
    }

    // Obtener datos del formulario de perfil
    getProfileFormData() {
        return {
            firstName: this.elements.profileFirstName?.value?.trim() || '',
            lastName: this.elements.profileLastName?.value?.trim() || '',
            email: this.elements.profileEmail?.value?.trim() || '',
            phone: this.elements.profilePhone?.value?.trim() || '',
            bio: this.elements.profileBio?.value?.trim() || ''
        };
    }

    // Mostrar errores de validación
    showFieldErrors(errors) {
        this.clearAllErrors();
        
        if (Array.isArray(errors)) {
            errors.forEach(error => {
                this.showFieldError(error.field, error.message);
            });
        } else if (errors && typeof errors === 'object') {
            Object.entries(errors).forEach(([field, message]) => {
                this.showFieldError(field, message);
            });
        }
    }

    // Mostrar error en campo específico
    showFieldError(field, message) {
        const errorElement = this.elements[`${this.currentView}${field.charAt(0).toUpperCase() + field.slice(1)}Error`] ||
                           this.elements[`${field}Error`];
        
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
    }

    // Limpiar todos los errores
    clearAllErrors() {
        Object.keys(this.elements).forEach(key => {
            if (key.includes('Error')) {
                const element = this.elements[key];
                if (element) {
                    element.textContent = '';
                    element.style.display = 'none';
                }
            }
        });
    }

    // Limpiar todos los formularios
    clearAllForms() {
        const forms = [this.elements.registerForm, this.elements.loginForm];
        forms.forEach(form => {
            if (form) {
                form.reset();
            }
        });
    }

    // Mostrar notificación
    showNotification(message, type = 'info') {
        if (!this.elements.notification || !this.elements.notificationMessage) {
            console.log(`Notificación (${type}): ${message}`);
            return;
        }

        this.elements.notificationMessage.textContent = message;
        this.elements.notification.className = `notification ${type}`;
        this.elements.notification.style.display = 'block';

        // Auto-ocultar después del tiempo configurado
        setTimeout(() => {
            this.hideNotification();
        }, CONFIG.UI.NOTIFICATION_DURATION);
    }

    // Ocultar notificación
    hideNotification() {
        if (this.elements.notification) {
            this.elements.notification.style.display = 'none';
        }
    }

    // Manejar estado de carga de botones
    setButtonLoading(button, isLoading) {
        if (!button) return;

        const buttonId = button.id || button.className;
        
        if (isLoading) {
            this.loadingStates.add(buttonId);
            button.disabled = true;
            button.textContent = 'Cargando...';
            button.classList.add('loading');
        } else {
            this.loadingStates.delete(buttonId);
            button.disabled = false;
            button.classList.remove('loading');
            
            // Restaurar texto original del botón
            if (button === this.elements.registerBtn) {
                button.textContent = 'Registrarse';
            } else if (button === this.elements.loginBtn) {
                button.textContent = 'Iniciar Sesión';
            }
        }
    }

    // Obtener datos del formulario de registro
    getRegisterFormData() {
        return {
            firstName: this.elements.registerFirstName?.value.trim() || '',
            lastName: this.elements.registerLastName?.value.trim() || '',
            email: this.elements.registerEmail?.value.trim() || '',
            password: this.elements.registerPassword?.value || ''
        };
    }

    // Obtener datos del formulario de login
    getLoginFormData() {
        return {
            email: this.elements.loginEmail?.value.trim() || '',
            password: this.elements.loginPassword?.value || ''
        };
    }

    // Verificar si hay algún botón en estado de carga
    hasLoadingButtons() {
        return this.loadingStates.size > 0;
    }

    // Obtener vista actual
    getCurrentView() {
        return this.currentView;
    }

    // Métodos para manejo de imagen de perfil

    // Cambiar entre tabs de carga de imagen
    switchUploadTab(tabType) {
        const fileTab = this.elements.fileUploadTab;
        const urlTab = this.elements.urlUploadTab;
        const fileSection = this.elements.fileUploadSection;
        const urlSection = this.elements.urlUploadSection;

        if (tabType === 'file') {
            fileTab?.classList.add('active');
            urlTab?.classList.remove('active');
            if (fileSection) fileSection.style.display = 'block';
            if (urlSection) urlSection.style.display = 'none';
        } else {
            urlTab?.classList.add('active');
            fileTab?.classList.remove('active');
            if (urlSection) urlSection.style.display = 'block';
            if (fileSection) fileSection.style.display = 'none';
        }
    }

    // Previsualizar imagen desde archivo
    previewImageFile(file) {
        // Validar tipo de archivo
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            this.showNotification('Tipo de archivo no permitido. Solo se permiten imágenes (JPEG, PNG, GIF, WebP).', 'error');
            return;
        }

        // Validar tamaño (5MB máximo)
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            this.showNotification('El archivo es demasiado grande. Tamaño máximo: 5MB.', 'error');
            return;
        }

        // Crear URL temporal para previsualización
        const reader = new FileReader();
        reader.onload = (e) => {
            this.displayImagePreview(e.target.result);
        };
        reader.readAsDataURL(file);
    }

    // Previsualizar imagen desde URL
    previewImageUrl(url) {
        // Validar URL básica
        try {
            new URL(url);
        } catch (error) {
            this.showNotification('URL de imagen inválida.', 'error');
            return;
        }

        // Crear imagen temporal para validar
        const img = new Image();
        img.onload = () => {
            this.displayImagePreview(url);
        };
        img.onerror = () => {
            this.showNotification('No se pudo cargar la imagen desde la URL proporcionada.', 'error');
        };
        img.src = url;
    }

    // Mostrar imagen en preview
    displayImagePreview(imageSrc) {
        const preview = this.elements.profileImagePreview;
        const placeholder = this.elements.profileImagePlaceholder;

        if (preview && placeholder) {
            // Crear o actualizar imagen
            let img = preview.querySelector('img');
            if (!img) {
                img = document.createElement('img');
                preview.appendChild(img);
            }
            
            img.src = imageSrc;
            img.style.display = 'block';
            placeholder.style.display = 'none';

            // Mostrar botón de remover
            if (this.elements.removeImageBtn) {
                this.elements.removeImageBtn.style.display = 'inline-block';
            }
        }
    }

    // Limpiar preview de imagen
    clearImagePreview() {
        const preview = this.elements.profileImagePreview;
        const placeholder = this.elements.profileImagePlaceholder;

        if (preview && placeholder) {
            const img = preview.querySelector('img');
            if (img) {
                img.remove();
            }
            placeholder.style.display = 'flex';

            // Ocultar botón de remover
            if (this.elements.removeImageBtn) {
                this.elements.removeImageBtn.style.display = 'none';
            }

            // Limpiar inputs
            if (this.elements.profileImageFile) {
                this.elements.profileImageFile.value = '';
            }
            if (this.elements.profileImageUrl) {
                this.elements.profileImageUrl.value = '';
            }
        }
    }

    // Actualizar avatar del usuario en dashboard
    updateUserAvatar(profileImage) {
        const avatarImg = this.elements.userAvatarImg;
        const avatarPlaceholder = this.elements.userAvatarPlaceholder;

        if (profileImage && avatarImg && avatarPlaceholder) {
            avatarImg.src = profileImage;
            avatarImg.style.display = 'block';
            avatarPlaceholder.style.display = 'none';
        } else if (avatarImg && avatarPlaceholder) {
            avatarImg.style.display = 'none';
            avatarPlaceholder.style.display = 'flex';
        }
    }

    // Cargar imagen de perfil en el formulario
    loadProfileImage(profileImage) {
        if (profileImage) {
            this.displayImagePreview(profileImage);
        } else {
            this.clearImagePreview();
        }
    }
}

// Instancia singleton del manejador de UI
export const uiManager = new UIManager();