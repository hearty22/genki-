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
            
            // Formularios
            registerForm: document.getElementById('register-form'),
            loginForm: document.getElementById('login-form'),
            
            // Botones
            registerBtn: document.getElementById('register-btn'),
            loginBtn: document.getElementById('login-btn'),
            logoutBtn: document.getElementById('logout-btn'),
            showLoginBtn: document.getElementById('show-login'),
            showRegisterBtn: document.getElementById('show-register'),
            
            // Campos de formulario
            registerFirstName: document.getElementById('firstName'),
            registerLastName: document.getElementById('lastName'),
            registerEmail: document.getElementById('email'),
            registerPassword: document.getElementById('password'),
            loginEmail: document.getElementById('login-email'),
            loginPassword: document.getElementById('login-password'),
            
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
        this.clearAllErrors();
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
}

// Instancia singleton del manejador de UI
export const uiManager = new UIManager();