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
    const profileEmailInput = document.getElementById('profile-email');
    const profilePhoneInput = document.getElementById('profile-phone');
    const profileBioTextarea = document.getElementById('profile-bio');
    const profileImageDisplay = document.getElementById('profile-image-display');
    const profileImageUpload = document.getElementById('profile-image-upload');
    const removeImageButton = document.getElementById('remove-image-button');
    const updateImageButton = document.getElementById('update-image-button');

    // Function to fetch and display user profile data
    async function fetchProfile() {
        const authToken = getCookie('authToken');
        if (!authToken) {
            console.error('No authentication token found.');
            window.location.href = '/login.html'; // Redirect to login if not authenticated
            return;
        }

        try {
            const response = await fetch('/api/auth/profile', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });
            const data = await response.json();
            if (response.ok) {
                const userProfile = data.data.user; // Acceder al objeto user anidado
                profileEmailInput.value = userProfile.email;
                profilePhoneInput.value = userProfile.phone || '';
                profileBioTextarea.value = userProfile.bio || '';
                if (userProfile.profileImage) {
                    profileImageDisplay.src = userProfile.profileImage;
                } else {
                    profileImageDisplay.src = '/assets/images/default-profile.png'; // Default image
                }
            } else {
                showMessage(data.message || 'Error al cargar el perfil', 'error');
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
            showMessage('Error de conexión al cargar el perfil.', 'error');
        }
    }

    // Function to update user profile
    if (profileForm) {
        profileForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const authToken = getCookie('authToken');
            if (!authToken) {
                showMessage('No autenticado. Por favor, inicia sesión.', 'error');
                return;
            }

            const updatedProfile = {
                email: profileEmailInput.value,
                phone: profilePhoneInput.value,
                bio: profileBioTextarea.value
            };

            try {
                const response = await fetch('/api/auth/profile', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${authToken}`
                    },
                    body: JSON.stringify(updatedProfile)
                });

                const data = await response.json();
                if (response.ok) {
                    showMessage(data.message, 'success');
                } else {
                    showMessage(data.message || 'Error al actualizar el perfil', 'error');
                }
            } catch (error) {
                console.error('Error updating profile:', error);
                showMessage('Error de conexión al actualizar el perfil.', 'error');
            }
        });
    }

    // Image upload logic
    if (profileImageUpload) {
        profileImageUpload.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const formData = new FormData();
            formData.append('profileImage', file);

            const authToken = getCookie('authToken');
            if (!authToken) {
                showMessage('No autenticado. Por favor, inicia sesión.', 'error');
                return;
            }

            try {
                const response = await fetch('/api/profile/image', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${authToken}`
                    },
                    body: formData
                });

                const data = await response.json();
                if (response.ok) {
                    showMessage(data.message, 'success');
                    profileImageDisplay.src = data.profileImage; // Update image display
                } else {
                    showMessage(data.message || 'Error al subir la imagen', 'error');
                }
            } catch (error) {
                console.error('Error uploading image:', error);
                showMessage('Error de conexión al subir la imagen.', 'error');
            }
        });
    }

    if (removeImageButton) {
        removeImageButton.addEventListener('click', async () => {
            if (!confirm('¿Estás seguro de que quieres eliminar tu imagen de perfil?')) {
                return;
            }

            const authToken = getCookie('authToken');
            if (!authToken) {
                showMessage('No autenticado. Por favor, inicia sesión.', 'error');
                return;
            }

            try {
                const response = await fetch('/api/profile/image', {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${authToken}`
                    }
                });

                const data = await response.json();
                if (response.ok) {
                    showMessage(data.message, 'success');
                    profileImageDisplay.src = '/assets/images/default-profile.png'; // Set to default image
                } else {
                    showMessage(data.message || 'Error al eliminar la imagen', 'error');
                }
            } catch (error) {
                console.error('Error deleting image:', error);
                showMessage('Error de conexión al eliminar la imagen.', 'error');
            }
        });
    }

    if (updateImageButton) {
        updateImageButton.addEventListener('click', () => {
            profileImageUpload.click(); // Trigger the hidden file input
        });
    }

    // Initial fetch for profile data if on profile page
    if (profileForm) {
        fetchProfile();
    }

    let calendar; // Declare calendar in a higher scope

    // Class Modal Logic
    const addClassButton = document.getElementById('add-class-button');
    const classModal = document.getElementById('class-modal');
    const classModalClose = document.getElementById('class-modal-close');
    const cancelClassButton = document.getElementById('cancel-class-button');

    const classForm = document.getElementById('class-form');
    const subjectNameInput = document.getElementById('subjectName');
    const dayOfWeekSelect = document.getElementById('dayOfWeek');
    const startTimeInput = document.getElementById('startTime');
    const endTimeInput = document.getElementById('endTime');

    const subjectNameError = document.getElementById('subjectName-error');
    const dayOfWeekError = document.getElementById('dayOfWeek-error');
    const startTimeError = document.getElementById('startTime-error');
    const endTimeError = document.getElementById('endTime-error');
    // Function to render user classes in the 'Mis Clases' section
    function renderUserClasses(classes) {
        const userClassesContainer = document.getElementById('user-classes');
        if (userClassesContainer) {
            userClassesContainer.innerHTML = ''; // Clear previous classes
            if (classes.length === 0) {
                userClassesContainer.innerHTML = '<p>No tienes clases programadas aún.</p>';
                return;
            }

            classes.forEach(classItem => {
                const classCard = document.createElement('div');
                classCard.className = 'class-item';
                classCard.innerHTML = `
                    <h3>${classItem.subjectName}</h3>
                    <p><strong>Grupo:</strong> ${classItem.courseGroup || 'N/A'}</p>
                    <p><strong>Días:</strong> ${classItem.dayOfWeek.join(', ')}</p>
                    <p><strong>Hora:</strong> ${classItem.startTime} - ${classItem.endTime}</p>
                    <p><strong>Ubicación:</strong> ${classItem.location || 'N/A'}</p>
                    <div class="class-actions">
                        <button class="button button-edit" data-id="${classItem._id}">Editar</button>
                        <button class="button-delete" data-id="${classItem._id}">Eliminar</button>
                    </div>
                `;
                userClassesContainer.appendChild(classCard);
            });

            // Add event listeners for edit and delete buttons
            userClassesContainer.querySelectorAll('.button-edit').forEach(button => {
                button.addEventListener('click', (e) => {
                    const classId = e.target.dataset.id;
                    const classToEdit = classes.find(c => c._id === classId);
                    if (classToEdit) {
                        openClassModalForEdit(classToEdit);
                    }
                });
            });

            userClassesContainer.querySelectorAll('.button-delete').forEach(button => {
                button.addEventListener('click', async (e) => {
                    const classId = e.target.dataset.id;
                    if (confirm('¿Estás seguro de que quieres eliminar esta clase?')) {
                        await deleteClass(classId);
                    }
                });
            });
        }
    }

    // Function to delete a class
    async function deleteClass(classId) {
        const authToken = getCookie('authToken');
        if (!authToken) {
            showMessage('No autenticado. Por favor, inicia sesión.', 'error');
            return;
        }

        try {
            const response = await fetch(`/api/classes/${classId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });

            const data = await response.json();
            if (response.ok) {
                showMessage(data.message, 'success');
        
            } else {
                showMessage(data.message || 'Error al eliminar la clase', 'error');
            }
        } catch (error) {
            console.error('Error deleting class:', error);
            showMessage('Error de conexión al eliminar la clase.', 'error');
        }
    }

    // Helper function to reset the class form and modal
    function resetClassFormAndModal() {
        if (classForm) {
            classForm.reset();
            classForm.dataset.editing = 'false';
            delete classForm.dataset.classId;
            // Clear all selections in the multiple select
            Array.from(dayOfWeekSelect.options).forEach(option => {
                option.selected = false;
            });
        }
        const classModalTitle = document.getElementById('class-modal-title');
        if (classModalTitle) {
            classModalTitle.textContent = 'Add New Class';
        }
        if (subjectNameError) {
            subjectNameError.textContent = '';
            subjectNameError.style.display = 'none';
        }
        if (dayOfWeekError) {
            dayOfWeekError.textContent = '';
            dayOfWeekError.style.display = 'none';
        }
        if (startTimeError) {
            startTimeError.textContent = '';
            startTimeError.style.display = 'none';
        }
        if (endTimeError) {
            endTimeError.textContent = '';
            endTimeError.style.display = 'none';
        }
    }

    // Function to open modal for editing
    function openClassModalForEdit(classData) {
        const classModalTitle = document.getElementById('class-modal-title');
        if (classModalTitle) {
            classModalTitle.textContent = 'Edit Class';
        }
        if (subjectNameInput) {
            subjectNameInput.value = classData.title;
        }
        const courseGroupInput = document.getElementById('courseGroup');
        if (courseGroupInput) {
            courseGroupInput.value = classData.extendedProps.courseGroup;
        }
        if (dayOfWeekSelect) {
            // Clear previous selections
            Array.from(dayOfWeekSelect.options).forEach(option => {
                option.selected = false;
            });
            // Set selections based on classData.dayOfWeek (which is an array)
            classData.extendedProps.dayOfWeek.forEach(day => {
                const option = Array.from(dayOfWeekSelect.options).find(opt => opt.value === day);
                if (option) {
                    option.selected = true;
                }
            });
        }
        if (startTimeInput) {
            startTimeInput.value = classData.startTime;
        }
        if (endTimeInput) {
            endTimeInput.value = classData.endTime;
        }
        const locationInput = document.getElementById('location');
        if (locationInput) {
            locationInput.value = classData.extendedProps.location;
        }
        const colorInput = document.getElementById('color');
        if (colorInput) {
            colorInput.value = classData.color;
        }

        if (classForm) {
            classForm.dataset.editing = 'true';
            classForm.dataset.classId = classData.id; // Assuming classData has an ID
        }
        if (classModal) {
            classModal.style.display = 'block';
        }
    }

    if (addClassButton) {
        addClassButton.addEventListener('click', () => {
            resetClassFormAndModal();
            if (classModal) {
                classModal.style.display = 'block';
            }
        });
    }

    if (classModalClose) {
        classModalClose.addEventListener('click', () => {
            if (classModal) {
                classModal.style.display = 'none';
            }
            resetClassFormAndModal();
        });
    }

    if (cancelClassButton) {
        cancelClassButton.addEventListener('click', () => {
            if (classModal) {
                classModal.style.display = 'none';
            }
            resetClassFormAndModal();
        });
    }

    window.addEventListener('click', (event) => {
        if (event.target === classModal) {
            classModal.style.display = 'none';
            resetClassFormAndModal();
        }
    });


    // Class Form Submission
    if (classForm) {
        classForm.addEventListener('submit', async (e) => {
            e.preventDefault();
    
            // Clear previous errors
            subjectNameError.textContent = '';
            dayOfWeekError.textContent = '';
            startTimeError.textContent = '';
            endTimeError.textContent = '';
    
            const subjectName = subjectNameInput.value;
            const courseGroup = document.getElementById('courseGroup').value;
            const dayOfWeek = Array.from(dayOfWeekSelect.selectedOptions).map(option => option.value);
            const startTime = startTimeInput.value;
            const endTime = endTimeInput.value;
            const location = document.getElementById('location').value;
            const color = document.getElementById('color').value;
    
            let hasError = false;
    
            if (!subjectName || subjectName.length < 3) {
                subjectNameError.textContent = 'El nombre de la materia debe tener al menos 3 caracteres.';
                subjectNameError.style.display = 'block';
                hasError = true;
            }
            if (dayOfWeek.length === 0) {
                dayOfWeekError.textContent = 'Por favor, selecciona al menos un día de la semana.';
                dayOfWeekError.style.display = 'block';
                hasError = true;
            }
            if (!startTime) {
                startTimeError.textContent = 'Por favor, ingresa una hora de inicio.';
                startTimeError.style.display = 'block';
                hasError = true;
            }
            if (!endTime) {
                endTimeError.textContent = 'Por favor, ingresa una hora de fin.';
                endTimeError.style.display = 'block';
                hasError = true;
            }
            if (startTime && endTime && startTime >= endTime) {
                endTimeError.textContent = 'La hora de fin debe ser posterior a la hora de inicio.';
                endTimeError.style.display = 'block';
                hasError = true;
            }
    
            if (hasError) {
                return;
            }
    
            const authToken = getCookie('authToken');
            if (!authToken) {
                showMessage('No autenticado. Por favor, inicia sesión.', 'error');
                return;
            }
    
            const classData = {
                subjectName,
                courseGroup,
                dayOfWeek,
                startTime,
                endTime,
                location,
                color
            };
    
            const isEditing = classForm.dataset.editing === 'true';
            const classId = classForm.dataset.classId;
            let url = '/api/classes';
            let method = 'POST';
    
            if (isEditing) {
                url = `/api/classes/${classId}`;
                method = 'PUT';
            }
    
            try {
                const response = await fetch(url, {
                    method: method,
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${authToken}`
                    },
                    body: JSON.stringify(classData)
                });
    
                const data = await response.json();
                if (response.ok) {
                    showMessage(data.message, 'success');
                    resetClassFormAndModal();
                    classModal.style.display = 'none';
            
                } else {
                    showMessage(data.message || 'Error al guardar la clase', 'error');
                }
            } catch (error) {
                console.error('Error saving class:', error);
                showMessage('Error de conexión al guardar la clase.', 'error');
            }
        });
    }

    // Event Listeners for modal
    if (addClassButton) {
        addClassButton.addEventListener('click', () => {
            resetClassFormAndModal();
            classModal.style.display = 'block';
        });
    }

    if (classModalClose) {
        classModalClose.addEventListener('click', () => {
            classModal.style.display = 'none';
        });
    }

    if (cancelClassButton) {
        cancelClassButton.addEventListener('click', () => {
            classModal.style.display = 'none';
        });
    }

    window.addEventListener('click', (event) => {
        if (event.target === classModal) {
            classModal.style.display = 'none';
        }
    });
});

// Tab switching logic for dashboard
const navButtons = document.querySelectorAll('.dashboard-navbar .nav-button');
const tabContents = document.querySelectorAll('.tab-content');

navButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Remove active class from all buttons and contents
        navButtons.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));

        // Add active class to the clicked button and its corresponding content
        button.classList.add('active');
        const targetTab = button.id.replace('-tab', '');
        document.getElementById(`${targetTab}-content`).classList.add('active');

        if (targetTab === 'home') {
            fetchAndRenderDashboardClasses();
        }
    });
});

// Initial call for the home tab if it's active by default
if (document.getElementById('home-tab') && document.getElementById('home-tab').classList.contains('active')) {
    fetchAndRenderDashboardClasses();
}



async function fetchAndRenderDashboardClasses() {
    const authToken = getCookie('authToken');
    if (!authToken) {
        console.error('No authentication token found.');
        return;
    }

    try {
        const response = await fetch('/api/classes', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        const data = await response.json();
        console.log('Raw API response data:', data); // Added for debugging

        if (response.ok) {
            const classesList = document.getElementById('classes-list');
            classesList.innerHTML = ''; // Clear existing classes

            console.log('Classes to render:', data); // Added for debugging

            if (data.length === 0) {
                classesList.innerHTML = '<p>No hay clases programadas.</p>';
                return;
            }

            data.forEach(classItem => {
                const classElement = document.createElement('div');
                classElement.classList.add('class-item');
                classElement.innerHTML = `
                    <h3>${classItem.subjectName}</h3>
                    <p><strong>Curso/Grupo:</strong> ${classItem.courseGroup || 'N/A'}</p>
                    <p><strong>Día(s):</strong> ${classItem.dayOfWeek.join(', ')}</p>
                    <p><strong>Hora:</strong> ${classItem.startTime} - ${classItem.endTime}</p>
                    <p><strong>Aula:</strong> ${classItem.location || 'N/A'}</p>
                    <div class="class-actions">
                        <button class="button-edit" data-id="${classItem._id}">Editar</button>
                        <button class="button-delete" data-id="${classItem._id}">Eliminar</button>
                    </div>
                `;
                classesList.appendChild(classElement);
            });
        } else {
            console.error('Error fetching classes:', data.message);
            showMessage(data.message || 'Error al cargar las clases', 'error');
        }
    } catch (error) {
        console.error('Error en la solicitud de clases:', error);
        showMessage('Error de conexión al cargar las clases', 'error');
    }
}