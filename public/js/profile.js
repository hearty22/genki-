import { apiService } from './api.js';
import { uiManager } from './ui.js';

class ProfileManager {
    constructor() {
        this.isUpdating = false;
        this.initialize();
    }

    initialize() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Event listener para el botón de guardar perfil
        const saveProfileBtn = document.getElementById('save-profile-btn');
        if (saveProfileBtn) {
            saveProfileBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleProfileUpdate();
            });
        }

        // Event listener para el formulario de perfil
        const profileForm = document.getElementById('profile-form');
        if (profileForm) {
            profileForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleProfileUpdate();
            });
        }
    }

    async handleProfileUpdate() {
        if (this.isUpdating) return;

        try {
            this.isUpdating = true;
            const saveBtn = document.getElementById('save-profile-btn');
            
            // Mostrar estado de carga
            uiManager.setButtonLoading(saveBtn, true);
            uiManager.clearAllErrors();

            // Obtener datos del formulario
            const profileData = uiManager.getProfileFormData();

            // Validar datos básicos
            const validation = this.validateProfileData(profileData);
            if (!validation.isValid) {
                uiManager.showFieldErrors(validation.errors);
                return;
            }

            // Enviar actualización al servidor
            const response = await apiService.updateProfile(profileData);

            if (response.success) {
                // Actualizar datos del usuario en el UI
                uiManager.currentUser = { ...uiManager.currentUser, ...profileData };
                uiManager.updateDashboard(uiManager.currentUser);
                
                // Mostrar mensaje de éxito
                uiManager.showNotification('Perfil actualizado correctamente', 'success');
                
                // Volver al dashboard principal después de un breve delay
                setTimeout(() => {
                    uiManager.showDashboardMain();
                }, 1500);
            } else {
                // Manejar errores del servidor
                if (response.errors) {
                    uiManager.showFieldErrors(response.errors);
                } else {
                    uiManager.showNotification(response.message || 'Error al actualizar el perfil', 'error');
                }
            }

        } catch (error) {
            console.error('Error al actualizar perfil:', error);
            
            if (error.message.includes('Email ya está en uso')) {
                uiManager.showFieldError('email', 'Este email ya está registrado por otro usuario');
            } else {
                uiManager.showNotification('Error de conexión. Inténtalo de nuevo.', 'error');
            }
        } finally {
            this.isUpdating = false;
            const saveBtn = document.getElementById('save-profile-btn');
            uiManager.setButtonLoading(saveBtn, false);
        }
    }

    validateProfileData(data) {
        const errors = [];

        // Validar nombre
        if (!data.firstName || data.firstName.length < 2) {
            errors.push({ field: 'firstName', message: 'El nombre debe tener al menos 2 caracteres' });
        }

        // Validar apellido
        if (!data.lastName || data.lastName.length < 2) {
            errors.push({ field: 'lastName', message: 'El apellido debe tener al menos 2 caracteres' });
        }

        // Validar email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!data.email || !emailRegex.test(data.email)) {
            errors.push({ field: 'email', message: 'Ingresa un email válido' });
        }

        // Validar teléfono (opcional, pero si se proporciona debe ser válido)
        if (data.phone && data.phone.length > 0) {
            const phoneRegex = /^[\d\s\-\+\(\)]{8,15}$/;
            if (!phoneRegex.test(data.phone)) {
                errors.push({ field: 'phone', message: 'Ingresa un número de teléfono válido' });
            }
        }

        // Validar bio (opcional, pero con límite de caracteres)
        if (data.bio && data.bio.length > 500) {
            errors.push({ field: 'bio', message: 'La biografía no puede exceder 500 caracteres' });
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    // Métodos para manejo de imagen de perfil

    // Subir imagen de perfil desde archivo
    async uploadProfileImage(file) {
        try {
            const formData = new FormData();
            formData.append('profileImage', file);

            const response = await apiService.uploadProfileImage(formData);
            
            if (response.success) {
                return {
                    success: true,
                    message: response.message,
                    profileImage: response.profileImage
                };
            } else {
                throw new Error(response.message || 'Error al subir la imagen');
            }
        } catch (error) {
            console.error('Error en uploadProfileImage:', error);
            throw error;
        }
    }

    // Actualizar imagen de perfil desde URL
    async updateProfileImageUrl(imageUrl) {
        try {
            const response = await apiService.updateProfileImageUrl({ imageUrl });
            
            if (response.success) {
                return {
                    success: true,
                    message: response.message,
                    profileImage: response.profileImage
                };
            } else {
                throw new Error(response.message || 'Error al actualizar la imagen');
            }
        } catch (error) {
            console.error('Error en updateProfileImageUrl:', error);
            throw error;
        }
    }

    // Eliminar imagen de perfil
    async removeProfileImage() {
        try {
            const response = await apiService.removeProfileImage();
            
            if (response.success) {
                return {
                    success: true,
                    message: response.message
                };
            } else {
                throw new Error(response.message || 'Error al eliminar la imagen');
            }
        } catch (error) {
            console.error('Error en removeProfileImage:', error);
            throw error;
        }
    }
}

// Crear instancia global del ProfileManager
export const profileManager = new ProfileManager();