import { authManager } from './auth.js';
import { uiManager } from './ui.js';
import { profileManager } from './profile.js';
import { ApiError } from './api.js';

// Clase principal de la aplicación
class App {
    constructor() {
        this.isInitialized = false;
        this.initialize();
    }

    // Inicializar la aplicación
    async initialize() {
        try {
            console.log('Inicializando aplicación Genki...');
            
            // Esperar a que el DOM esté listo
            await this.waitForDOM();
            
            // Configurar event listeners
            this.setupEventListeners();
            
            // Verificar autenticación existente
            await this.checkInitialAuth();
            
            this.isInitialized = true;
            console.log('Aplicación Genki inicializada correctamente');
            
        } catch (error) {
            console.error('Error al inicializar la aplicación:', error);
            uiManager.showNotification('Error al inicializar la aplicación', 'error');
        }
    }

    // Esperar a que el DOM esté listo
    waitForDOM() {
        return new Promise((resolve) => {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', resolve);
            } else {
                resolve();
            }
        });
    }

    // Configurar event listeners principales
    setupEventListeners() {
        // Event listener para el formulario de registro
        const registerForm = document.getElementById('register-form');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        }

        // Event listener para el formulario de login
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Event listener para el botón de logout
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => this.handleLogout(e));
        }

        // Event listeners para navegación
        this.setupNavigationListeners();

        // Event listeners para imagen de perfil
        this.setupProfileImageListeners();
    }

    // Configurar listeners de navegación
    setupNavigationListeners() {
        const showLoginBtn = document.getElementById('show-login');
        const showRegisterBtn = document.getElementById('show-register');

        if (showLoginBtn) {
            showLoginBtn.addEventListener('click', (e) => {
                e.preventDefault();
                uiManager.showLogin();
            });
        }

        if (showRegisterBtn) {
            showRegisterBtn.addEventListener('click', (e) => {
                e.preventDefault();
                uiManager.showRegister();
            });
        }
    }

    // Verificar autenticación inicial
    async checkInitialAuth() {
        if (authManager.checkAuth()) {
            try {
                const user = await authManager.loadUserProfile();
                if (user) {
                    this.showAuthenticatedState(user);
                } else {
                    this.showUnauthenticatedState();
                }
            } catch (error) {
                console.error('Error al verificar autenticación inicial:', error);
                this.showUnauthenticatedState();
            }
        } else {
            this.showUnauthenticatedState();
        }
    }

    // Manejar registro de usuario
    async handleRegister(event) {
        event.preventDefault();
        
        const registerBtn = document.getElementById('register-btn');
        
        try {
            // Mostrar estado de carga
            uiManager.setButtonLoading(registerBtn, true);
            uiManager.clearAllErrors();

            // Obtener datos del formulario
            const formData = uiManager.getRegisterFormData();

            // Registrar usuario
            const response = await authManager.register(formData);

            // Mostrar estado autenticado
            this.showAuthenticatedState(response.user);

        } catch (error) {
            this.handleAuthError(error, 'register');
        } finally {
            uiManager.setButtonLoading(registerBtn, false);
        }
    }

    // Manejar login de usuario
    async handleLogin(event) {
        event.preventDefault();
        
        const loginBtn = document.getElementById('login-btn');
        
        try {
            // Mostrar estado de carga
            uiManager.setButtonLoading(loginBtn, true);
            uiManager.clearAllErrors();

            // Obtener datos del formulario
            const credentials = uiManager.getLoginFormData();

            // Iniciar sesión
            const response = await authManager.login(credentials);

            // Mostrar estado autenticado
            this.showAuthenticatedState(response.user);

        } catch (error) {
            this.handleAuthError(error, 'login');
        } finally {
            uiManager.setButtonLoading(loginBtn, false);
        }
    }

    // Manejar logout
    async handleLogout(event) {
        event.preventDefault();
        
        try {
            await authManager.logout();
            this.showUnauthenticatedState();
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
            uiManager.showNotification('Error al cerrar sesión', 'error');
        }
    }

    // Manejar errores de autenticación
    handleAuthError(error, context) {
        console.error(`Error en ${context}:`, error);

        if (error instanceof ApiError) {
            if (error.isValidationError && error.data.errors) {
                // Mostrar errores de validación específicos
                uiManager.showFieldErrors(error.data.errors);
            } else if (error.isConflictError) {
                uiManager.showNotification('Este email ya está registrado', 'error');
            } else if (error.isAuthError) {
                uiManager.showNotification('Credenciales incorrectas', 'error');
            } else if (error.isNetworkError) {
                uiManager.showNotification('Error de conexión. Verifica tu internet.', 'error');
            } else {
                uiManager.showNotification(error.message || 'Error en la operación', 'error');
            }
        } else {
            uiManager.showNotification('Error inesperado. Inténtalo de nuevo.', 'error');
        }
    }

    // Configurar listeners para imagen de perfil
    setupProfileImageListeners() {
        // Tabs de carga de imagen
        const fileTab = document.getElementById('file-upload-tab');
        const urlTab = document.getElementById('url-upload-tab');

        if (fileTab) {
            fileTab.addEventListener('click', () => {
                uiManager.switchUploadTab('file');
            });
        }

        if (urlTab) {
            urlTab.addEventListener('click', () => {
                uiManager.switchUploadTab('url');
            });
        }

        // Input de archivo
        const fileInput = document.getElementById('profile-image-file');
        if (fileInput) {
            fileInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    uiManager.previewImageFile(file);
                }
            });
        }

        // Botón de seleccionar archivo
        const selectFileBtn = document.getElementById('select-file-btn');
        if (selectFileBtn && fileInput) {
            selectFileBtn.addEventListener('click', () => {
                fileInput.click();
            });
        }

        // Input de URL
        const urlInput = document.getElementById('profile-image-url');
        const loadUrlBtn = document.getElementById('load-url-btn');

        if (loadUrlBtn && urlInput) {
            loadUrlBtn.addEventListener('click', () => {
                const url = urlInput.value.trim();
                if (url) {
                    uiManager.previewImageUrl(url);
                }
            });
        }

        // Botón de remover imagen
        const removeBtn = document.getElementById('remove-image-btn');
        if (removeBtn) {
            removeBtn.addEventListener('click', async () => {
                try {
                    await this.handleRemoveProfileImage();
                } catch (error) {
                    console.error('Error al remover imagen:', error);
                    uiManager.showNotification('Error al remover la imagen', 'error');
                }
            });
        }

        // Botón de guardar imagen (archivo)
        const saveFileBtn = document.getElementById('save-image-file-btn');
        if (saveFileBtn && fileInput) {
            saveFileBtn.addEventListener('click', async () => {
                const file = fileInput.files[0];
                if (file) {
                    try {
                        await this.handleUploadProfileImage(file);
                    } catch (error) {
                        console.error('Error al subir imagen:', error);
                        uiManager.showNotification('Error al subir la imagen', 'error');
                    }
                }
            });
        }

        // Botón de guardar imagen (URL)
        const saveUrlBtn = document.getElementById('save-image-url-btn');
        if (saveUrlBtn && urlInput) {
            saveUrlBtn.addEventListener('click', async () => {
                const url = urlInput.value.trim();
                if (url) {
                    try {
                        await this.handleUpdateProfileImageUrl(url);
                    } catch (error) {
                        console.error('Error al actualizar imagen:', error);
                        uiManager.showNotification('Error al actualizar la imagen', 'error');
                    }
                }
            });
        }
    }

    // Manejar subida de imagen de perfil
    async handleUploadProfileImage(file) {
        try {
            uiManager.setButtonLoading('save-image-file-btn', true);
            
            const result = await profileManager.uploadProfileImage(file);
            
            if (result.success) {
                // Actualizar usuario actual
                const updatedUser = await authManager.loadUserProfile();
                if (updatedUser) {
                    uiManager.updateDashboard(updatedUser);
                    uiManager.loadProfileData();
                }
                
                uiManager.showNotification('Imagen de perfil actualizada correctamente', 'success');
            }
        } catch (error) {
            throw error;
        } finally {
            uiManager.setButtonLoading('save-image-file-btn', false);
        }
    }

    // Manejar actualización de imagen por URL
    async handleUpdateProfileImageUrl(url) {
        try {
            uiManager.setButtonLoading('save-image-url-btn', true);
            
            const result = await profileManager.updateProfileImageUrl(url);
            
            if (result.success) {
                // Actualizar usuario actual
                const updatedUser = await authManager.loadUserProfile();
                if (updatedUser) {
                    uiManager.updateDashboard(updatedUser);
                    uiManager.loadProfileData();
                }
                
                uiManager.showNotification('Imagen de perfil actualizada correctamente', 'success');
            }
        } catch (error) {
            throw error;
        } finally {
            uiManager.setButtonLoading('save-image-url-btn', false);
        }
    }

    // Manejar eliminación de imagen de perfil
    async handleRemoveProfileImage() {
        try {
            uiManager.setButtonLoading('remove-image-btn', true);
            
            const result = await profileManager.removeProfileImage();
            
            if (result.success) {
                // Actualizar usuario actual
                const updatedUser = await authManager.loadUserProfile();
                if (updatedUser) {
                    uiManager.updateDashboard(updatedUser);
                    uiManager.loadProfileData();
                }
                
                uiManager.clearImagePreview();
                uiManager.showNotification('Imagen de perfil eliminada correctamente', 'success');
            }
        } catch (error) {
            throw error;
        } finally {
            uiManager.setButtonLoading('remove-image-btn', false);
        }
    }

    // Mostrar estado autenticado
    showAuthenticatedState(user) {
        uiManager.updateDashboard(user);
        uiManager.showDashboard();
    }

    // Mostrar estado no autenticado
    showUnauthenticatedState() {
        uiManager.showRegister();
    }

    // Verificar si la aplicación está inicializada
    isReady() {
        return this.isInitialized;
    }

    // Obtener información de la aplicación
    getAppInfo() {
        return {
            name: 'Genki',
            version: '1.0.0',
            initialized: this.isInitialized,
            authenticated: authManager.checkAuth(),
            currentUser: authManager.getCurrentUser(),
            currentView: uiManager.getCurrentView()
        };
    }
}

// Inicializar la aplicación
const app = new App();

// Exportar para uso global si es necesario
window.GenkiApp = app;

// Exportar la instancia
export default app;