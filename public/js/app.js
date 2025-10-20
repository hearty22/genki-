import { authManager } from './auth.js';
import { uiManager } from './ui.js';
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