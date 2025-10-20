import { apiService, ApiError } from './api.js';
import { CONFIG, UTILS } from './config.js';
import { uiManager } from './ui.js';

// Clase para manejar la autenticación
export class AuthManager {
    constructor() {
        this.currentUser = null;
        this.authToken = null;
        this.isAuthenticated = false;
        
        // Inicializar estado desde localStorage
        this.initializeAuth();
    }

    // Inicializar autenticación
    initializeAuth() {
        const token = UTILS.getCookie(CONFIG.AUTH.TOKEN_KEY);
        if (token) {
            this.authToken = token;
            this.isAuthenticated = true;
            // Solo cargar perfil si no estamos en proceso de login/registro
            // Esto evita conflictos cuando se acaba de hacer login
            setTimeout(() => {
                this.loadUserProfile();
            }, 100);
        }
    }

    // Cargar perfil del usuario
    async loadUserProfile() {
        try {
            const response = await apiService.getProfile();
            this.currentUser = response.data.user;
            return response.data.user;
        } catch (error) {
            console.error('Error al cargar perfil:', error);
            if (error.isAuthError) {
                this.logout();
            }
            return null;
        }
    }

    // Registrar nuevo usuario
    async register(formData) {
        try {
            // Validaciones del lado del cliente
            const validationErrors = this.validateRegistrationData(formData);
            if (validationErrors.length > 0) {
                throw new ApiError('Errores de validación', 400, { errors: validationErrors });
            }

            const response = await apiService.register(formData);
            
            // Guardar token y actualizar estado - corregir estructura de respuesta
            this.setAuthData(response.data.token, response.data.user);
            
            uiManager.showNotification('¡Registro exitoso! Bienvenido a Genki.', 'success');
            return response;
        } catch (error) {
            console.error('Error en registro:', error);
            throw error;
        }
    }

    // Iniciar sesión
    async login(credentials) {
        try {
            // Validaciones básicas
            if (!credentials.email || !credentials.password) {
                throw new ApiError('Email y contraseña son requeridos', 400);
            }

            const response = await apiService.login(credentials);
            
            // Guardar token y actualizar estado - corregir estructura de respuesta
            this.setAuthData(response.data.token, response.data.user);
            
            uiManager.showNotification(`¡Bienvenido de vuelta, ${response.data.user.firstName}!`, 'success');
            return response;
        } catch (error) {
            console.error('Error en login:', error);
            throw error;
        }
    }

    // Cerrar sesión
    async logout() {
        try {
            if (this.isAuthenticated) {
                await apiService.logout();
            }
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
        } finally {
            this.clearAuthData();
            uiManager.showNotification('Sesión cerrada correctamente', 'info');
        }
    }

    // Establecer datos de autenticación
    setAuthData(token, user) {
        this.authToken = token;
        this.currentUser = user;
        this.isAuthenticated = true;
        
        // Guardar token en cookie en lugar de localStorage
        UTILS.setCookie(CONFIG.AUTH.TOKEN_KEY, token);
        
        // Actualizar el dashboard inmediatamente con los datos del usuario
        uiManager.updateDashboard(user);
        uiManager.showView('dashboard');
    }

    // Limpiar datos de autenticación
    clearAuthData() {
        this.authToken = null;
        this.currentUser = null;
        this.isAuthenticated = false;
        
        // Eliminar cookies en lugar de localStorage
        UTILS.deleteCookie(CONFIG.AUTH.TOKEN_KEY);
        UTILS.deleteCookie(CONFIG.AUTH.REFRESH_TOKEN_KEY);
    }

    // Validar datos de registro
    validateRegistrationData(data) {
        const errors = [];

        if (!data.firstName || data.firstName.trim().length < 2) {
            errors.push({ field: 'firstName', message: 'El nombre debe tener al menos 2 caracteres' });
        }

        if (!data.lastName || data.lastName.trim().length < 2) {
            errors.push({ field: 'lastName', message: 'El apellido debe tener al menos 2 caracteres' });
        }

        if (!data.email || !UTILS.isValidEmail(data.email)) {
            errors.push({ field: 'email', message: 'Ingresa un email válido' });
        }

        if (!data.password || !UTILS.isValidPassword(data.password)) {
            errors.push({ 
                field: 'password', 
                message: 'La contraseña debe tener al menos 6 caracteres, una mayúscula, una minúscula y un número' 
            });
        }

        return errors;
    }

    // Obtener información del usuario actual
    getCurrentUser() {
        return this.currentUser;
    }

    // Verificar si el usuario está autenticado
    checkAuth() {
        return this.isAuthenticated && this.authToken;
    }

    // Obtener token de autenticación
    getToken() {
        return this.authToken;
    }
}

// Instancia singleton del manejador de autenticación
export const authManager = new AuthManager();