// app.js

document.addEventListener('DOMContentLoaded', () => {
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
                    messageElement.textContent = data.message;
                    messageElement.className = 'message-area success';
                    window.location.href = '/dashboard.html';
                } else {
                    messageElement.textContent = data.message || 'Error al iniciar sesión';
                    messageElement.className = 'message-area error';
                }
            } catch (error) {
                console.error('Error:', error);
                const messageElement = document.querySelector('#login-message');
                messageElement.textContent = 'Error de conexión';
                messageElement.className = 'message-area error';
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
                    messageElement.textContent = data.message;
                    messageElement.className = 'message-area success';
                    window.location.href = '/login.html';
                } else {
                    messageElement.textContent = data.message || 'Error al registrar usuario';
                    messageElement.className = 'message-area error';
                }
            } catch (error) {
                console.error('Error:', error);
                const messageElement = document.querySelector('#register-message');
                messageElement.textContent = 'Error de conexión';
                messageElement.className = 'message-area error';
            }
        });
    }
});