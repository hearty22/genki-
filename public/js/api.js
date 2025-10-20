import { CONFIG, UTILS } from './config.js';

// Clase para manejar las llamadas a la API
export class ApiService {
    constructor() {
        this.baseURL = CONFIG.API_BASE_URL;
    }

    // Método genérico para hacer peticiones
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
            },
        };

        // Agregar token de autorización si existe - usar cookies en lugar de localStorage
        const token = UTILS.getCookie(CONFIG.AUTH.TOKEN_KEY);
        if (token) {
            defaultOptions.headers['Authorization'] = `Bearer ${token}`;
        }

        const finalOptions = {
            ...defaultOptions,
            ...options,
            headers: {
                ...defaultOptions.headers,
                ...options.headers,
            },
        };

        try {
            const response = await fetch(url, finalOptions);
            const data = await response.json();

            if (!response.ok) {
                throw new ApiError(data.message || 'Error en la petición', response.status, data);
            }

            return data;
        } catch (error) {
            if (error instanceof ApiError) {
                throw error;
            }
            throw new ApiError('Error de conexión', 0, { originalError: error });
        }
    }

    // Métodos de autenticación
    async register(userData) {
        return this.request(CONFIG.ENDPOINTS.AUTH.REGISTER, {
            method: 'POST',
            body: JSON.stringify(userData),
        });
    }

    async login(credentials) {
        return this.request(CONFIG.ENDPOINTS.AUTH.LOGIN, {
            method: 'POST',
            body: JSON.stringify(credentials),
        });
    }

    async getProfile() {
        return this.request(CONFIG.ENDPOINTS.AUTH.PROFILE);
    }

    async updateProfile(profileData) {
        return this.request(CONFIG.ENDPOINTS.AUTH.PROFILE, {
            method: 'PUT',
            body: JSON.stringify(profileData)
        });
    }

    async logout() {
        return this.request(CONFIG.ENDPOINTS.AUTH.LOGOUT, {
            method: 'POST',
        });
    }

    // Método para verificar el estado de la conexión
    async checkHealth() {
        return this.request('/health');
    }

    // Métodos para manejo de imagen de perfil
    
    // Subir imagen de perfil por archivo
    async uploadProfileImage(file) {
        const formData = new FormData();
        formData.append('profileImage', file);
        
        return this.request('/auth/profile/image/upload', {
            method: 'POST',
            body: formData,
            // No establecer Content-Type, el navegador lo hará automáticamente con boundary
            headers: {}
        });
    }

    // Actualizar imagen de perfil por URL
    async updateProfileImageUrl(imageUrl) {
        return this.request('/auth/profile/image/url', {
            method: 'PUT',
            body: JSON.stringify({ imageUrl })
        });
    }

    // Eliminar imagen de perfil
    async removeProfileImage() {
        return this.request('/auth/profile/image', {
            method: 'DELETE'
        });
    }
}

// Clase personalizada para errores de API
export class ApiError extends Error {
    constructor(message, status, data = {}) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.data = data;
    }

    get isNetworkError() {
        return this.status === 0;
    }

    get isValidationError() {
        return this.status === 400 && this.data.errors;
    }

    get isAuthError() {
        return this.status === 401;
    }

    get isConflictError() {
        return this.status === 409;
    }
}

// Instancia singleton del servicio API
export const apiService = new ApiService();