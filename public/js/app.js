// app.js

// Helper function to get cookie by name
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

document.addEventListener('DOMContentLoaded', () => {
    // Existing showMessage function
    function showMessage(message, type) {
        const messageElement = document.getElementById('profile-message');
        if (messageElement) {
            messageElement.textContent = message;
            messageElement.className = `message-area ${type}`;
            messageElement.style.display = 'block';
            setTimeout(() => {
                messageElement.textContent = '';
                messageElement.className = 'message-area';
                messageElement.style.display = 'none';
            }, 5000);
        }
    }

    const loginForm = document.querySelector('#login-form');
    const registerForm = document.querySelector('#register-form');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = loginForm.querySelector('#login-email').value;
            const password = loginForm.querySelector('#login-password').value;

            try {
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, password }),
                });

                const data = await response.json();
                const messageElement = document.querySelector('#login-message');
                if (response.ok) {
                    showMessage(data.message, 'success');
                    window.location.href = '/dashboard.html';
                } else {
                    showMessage(data.message || 'Error al iniciar sesión', 'error');
                }
            } catch (error) {
                console.error('Error:', error);
                showMessage('Error de conexión', 'error');
            }
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const firstName = registerForm.querySelector('#firstName').value;
            const lastName = registerForm.querySelector('#lastName').value;
            const email = registerForm.querySelector('#register-email').value;
            const password = registerForm.querySelector('#register-password').value;

            try {
                const response = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ firstName, lastName, email, password }),
                });

                const data = await response.json();
                const messageElement = document.querySelector('#register-message');
                if (response.ok) {
                    showMessage(data.message, 'success');
                    registerForm.reset();
                } else {
                    showMessage(data.message || 'Error al registrar usuario', 'error');
                }
            } catch (error) {
                console.error('Error:', error);
                showMessage('Error de conexión', 'error');
            }
        });
    }

    const profileForm = document.querySelector('#profile-form');

    if (profileForm) {
        profileForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = profileForm.querySelector('#profile-email').value;
            const phone = profileForm.querySelector('#profile-phone').value;
            const bio = profileForm.querySelector('#profile-bio').value;

            try {
                const response = await fetch('/api/auth/profile', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${getCookie('authToken')}`
                    },
                    body: JSON.stringify({ email, phone, bio }),
                });

                const data = await response.json();
                const messageElement = document.querySelector('#profile-message');
                if (response.ok) {
                    showMessage(data.message, 'success');
                    // Update form fields with new data
                    profileForm.querySelector('#profile-email').value = data.data.user.email || '';
                    profileForm.querySelector('#profile-phone').value = data.data.user.phone || '';
                    profileForm.querySelector('#profile-bio').value = data.data.user.bio || '';
                } else {
                    showMessage(data.message || 'Error al actualizar el perfil', 'error');
                }
            } catch (error) {
                console.error('Error:', error);
                showMessage('Error de conexión', 'error');
            }
        });

        // Fetch user data when profile page loads
        const fetchUserProfile = async () => {
            try {
                const response = await fetch('/api/auth/profile', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${getCookie('authToken')}`
                    }
                });
                const data = await response.json();
                if (response.ok) {
                    profileForm.querySelector('#profile-email').value = data.data.user.email || '';
                    profileForm.querySelector('#profile-phone').value = data.data.user.phone || '';
                    profileForm.querySelector('#profile-bio').value = data.data.user.bio || '';
                    const profileImageDisplay = document.querySelector('#profile-image-display');
                    if (data.data.user.profileImage) {
                        profileImageDisplay.src = data.data.user.profileImage;
                    } else {
                        profileImageDisplay.src = '/assets/images/default-profile.png'; // Default image
                    }
                } else {
                    console.error('Error al cargar el perfil:', data.message);
                }
            } catch (error) {
                console.error('Error de conexión al cargar el perfil:', error);
            }
        };
        fetchUserProfile();



        // Profile image upload by file
        // profileImageUpload already declared below; skip re-declaration
        const profileImageUpload = document.getElementById('profile-image-upload');
            const profileImageDisplay = document.getElementById('profile-image-display');
            const profileMessage = document.getElementById('profile-message');

            console.log('profileImageUpload element:', profileImageUpload);
            console.log('profileImageDisplay element:', profileImageDisplay);
            console.log('profileMessage element:', profileMessage);

            if (profileImageDisplay && !profileImageDisplay.src) {
                profileImageDisplay.src = '/assets/images/default-profile.png';
            }

            if (profileImageUpload) {
                profileImageUpload.addEventListener('change', async (event) => {
                    console.log('Change event triggered for profileImageUpload');
                    const file = event.target.files[0];
                    if (file) {
                        console.log('File selected:', file.name);
                        const reader = new FileReader();
                        reader.onload = (e) => {
                            profileImageDisplay.src = e.target.result;
                            console.log('Image preview updated:', e.target.result);
                        };
                        reader.readAsDataURL(file);
                    }
                });
            }

            const updateImageButton = document.getElementById('update-image-button');
            if (updateImageButton) {
                updateImageButton.addEventListener('click', async () => {
                    const file = profileImageUpload.files[0];
                    if (!file) {
                        profileMessage.textContent = 'Por favor, selecciona una imagen para subir.';
                        profileMessage.className = 'message-area error';
                        return;
                    }

                    const formData = new FormData();
                    formData.append('profileImage', file);

                    try {
                        const response = await fetch('/api/auth/profile/image/upload', {
                            method: 'POST',
                            headers: {
                                'Authorization': `Bearer ${getCookie('authToken')}`
                            },
                            body: formData,
                        });
                        const data = await response.json();
                        if (response.ok) {
                            showMessage(data.message, 'success');
                            // Optionally update the displayed image source again if the server returns a new URL
                            // profileImageDisplay.src = data.user.profileImage;
                        } else {
                            showMessage(data.message || 'Error al subir la imagen', 'error');
                        }
                    } catch (error) {
                        console.error('Error:', error);
                        showMessage('Error de conexión al subir la imagen', 'error');
                    }
                });
            }





        // Remove profile image
        const removeImageButton = document.querySelector('#remove-image-button');

        if (removeImageButton) {
            removeImageButton.addEventListener('click', async () => {
                try {
                    const response = await fetch('/api/profile/image', {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${getCookie('authToken')}`
                        }
                    });
                    const data = await response.json();
                    if (response.ok) {
                        profileMessage.textContent = data.message;
                        profileMessage.className = 'message-area success';
                        profileImageDisplay.src = '/assets/images/default-profile.png'; // Reset to default
                    } else {
                        profileMessage.textContent = data.message || 'Error al eliminar la imagen';
                        profileMessage.className = 'message-area error';
                    }
                } catch (error) {
                    console.error('Error:', error);
                    profileMessage.textContent = 'Error de conexión al eliminar la imagen';
                    profileMessage.className = 'message-area error';
                }
            });
        }
    }
});