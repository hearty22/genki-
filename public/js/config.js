// Configuración de la aplicación
export const CONFIG = {
    API_BASE_URL: 'http://localhost:3000/api',
    APP_NAME: 'Genki',
    APP_VERSION: '1.0.0',
    
    // Configuración de autenticación
    AUTH: {
        TOKEN_KEY: 'authToken',
        REFRESH_TOKEN_KEY: 'refreshToken',
        COOKIE_OPTIONS: {
            SECURE: false, // Cambiar a true en producción con HTTPS
            SAME_SITE: 'Lax',
            MAX_AGE: 7 * 24 * 60 * 60 * 1000 // 7 días en milisegundos
        }
    },
    
    // Configuración de UI
    UI: {
        NOTIFICATION_DURATION: 5000,
        LOADING_DELAY: 300
    },
    
    // Endpoints de la API
    ENDPOINTS: {
        AUTH: {
            REGISTER: '/auth/register',
            LOGIN: '/auth/login',
            PROFILE: '/auth/profile',
            LOGOUT: '/auth/logout'
        }
    }
};

// Utilidades globales
export const UTILS = {
    // Formatear fecha
    formatDate: (date) => {
        return new Intl.DateTimeFormat('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }).format(new Date(date));
    },
    
    // Validar email
    isValidEmail: (email) => {
        return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email);
    },
    
    // Validar contraseña
    isValidPassword: (password) => {
        return password && password.length >= 6;
    },

    // Utilidades para cookies
    setCookie: (name, value, options = {}) => {
        const defaultOptions = {
            path: '/',
            maxAge: CONFIG.AUTH.COOKIE_OPTIONS.MAX_AGE,
            sameSite: CONFIG.AUTH.COOKIE_OPTIONS.SAME_SITE,
            secure: CONFIG.AUTH.COOKIE_OPTIONS.SECURE
        };
        
        const finalOptions = { ...defaultOptions, ...options };
        
        let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;
        
        Object.entries(finalOptions).forEach(([key, val]) => {
            if (val !== undefined && val !== null) {
                if (key === 'maxAge') {
                    cookieString += `; max-age=${Math.floor(val / 1000)}`;
                } else if (key === 'sameSite') {
                    cookieString += `; SameSite=${val}`;
                } else if (key === 'secure' && val) {
                    cookieString += `; Secure`;
                } else if (key === 'httpOnly' && val) {
                    cookieString += `; HttpOnly`;
                } else if (key === 'path') {
                    cookieString += `; Path=${val}`;
                }
            }
        });
        
        document.cookie = cookieString;
    },

    getCookie: (name) => {
        const nameEQ = encodeURIComponent(name) + '=';
        const cookies = document.cookie.split(';');
        
        for (let cookie of cookies) {
            cookie = cookie.trim();
            if (cookie.indexOf(nameEQ) === 0) {
                return decodeURIComponent(cookie.substring(nameEQ.length));
            }
        }
        return null;
    },

    deleteCookie: (name) => {
        UTILS.setCookie(name, '', { maxAge: -1 });
    }
};