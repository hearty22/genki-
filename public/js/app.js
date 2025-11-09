
// Helper function to get cookie by name
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

function showMessage(message, type, messageContainerId) {
    const messageContainer = messageContainerId ? document.getElementById(messageContainerId) : document.getElementsByClassName('message-area')[0];
    if (messageContainer) {
        messageContainer.textContent = message;
        messageContainer.className = `message-area ${type}`;
        setTimeout(() => {
            messageContainer.textContent = '';
            messageContainer.className = 'message-area';
            // Event form submission logic
        if (eventForm) {
            eventForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                let isValid = true;

                // Validación
                if (!eventTitleInput.value.trim()) {
                    eventTitleError.textContent = 'El título es obligatorio';
                    isValid = false;
                } else if (activity.type === 'class') {
                    detailsHtml = `
                        <h3>${activity.name}</h3>
                        <p><strong>Tipo:</strong> Clase</p>
                        <p><strong>Día:</strong> ${activity.dayOfWeek.join(', ')}</p>
                        <p><strong>Hora:</strong> ${activity.startTime} - ${activity.endTime}</p>
                        <p><strong>Profesor:</strong> ${activity.teacher}</p>
                    `;
                    actionsHtml = `
                        <button class="button-edit-class" data-id="${activity._id}">Editar</button>
                        <button class="button-delete-class" data-id="${activity._id}">Eliminar</button>
                    `;
                } else if (activity.type === 'class') {
                    detailsHtml = `
                        <h3>${activity.name}</h3>
                        <p><strong>Tipo:</strong> Clase</p>
                        <p><strong>Día:</strong> ${activity.dayOfWeek.join(', ')}</p>
                        <p><strong>Hora:</strong> ${activity.startTime} - ${activity.endTime}</p>
                        <p><strong>Profesor:</strong> ${activity.teacher}</p>
                    `;
                    actionsHtml = `
                        <button class="button-edit-class" data-id="${activity._id}">Editar</button>
                        <button class="button-delete-class" data-id="${activity._id}">Eliminar</button>
                    `;
                } else if (eventTitleInput.value.length < 3) {
                    eventTitleError.textContent = 'El título debe tener al menos 3 caracteres';
                    isValid = false;
                } else {
                    eventTitleError.textContent = '';
                }

                if (!eventDateInput.value) {
                    eventDateError.textContent = 'La fecha es obligatoria';
                    isValid = false;
                } else if (new Date(eventDateInput.value) < new Date().setHours(0, 0, 0, 0) && !currentEditingEventId) {
                    eventDateError.textContent = 'No se pueden crear eventos en fechas pasadas';
                    isValid = false;
                } else {
                    eventDateError.textContent = '';
                }

                if (!eventTimeInput.value) {
                    eventTimeError.textContent = 'La hora es obligatoria';
                    isValid = false;
                } else {
                    eventTimeError.textContent = '';
                }

                if (!isValid) return;

                
                if (!authToken){
                    showMessage('No autenticado. Inicia sesión nuevamente.', 'error');
                    return;
                }

                const eventData = {
                    title: eventTitleInput.value.trim(),
                    description: eventDescriptionInput.value.trim(),
                    date: eventDateInput.value,
                    time: eventTimeInput.value,
                    color: eventColorInput.value
                };

                try {
                    const method = currentEditingEventId ? 'PUT' : 'POST';
                    const url = currentEditingEventId ? `/api/events/${currentEditingEventId}` : '/api/events';

                    const response = await fetch(url, {
                        method: method,
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify(eventData)
                    });

                    const data = await response.json();
                    if (response.ok) {
                        showMessage(data.message, 'success');
                        eventModal.style.display = 'none';
                        eventForm.reset();
                        fetchAndRenderAllActivities(); // Actualizar lista de actividades
                    } else {
                        showMessage(data.message || 'Error al guardar el evento', 'error');
                    }
                } catch (error) {
                    console.error('Error saving event:', error);
                    showMessage('Error de conexión al guardar el evento', 'error');
                }
            });
        }}, 3000);
    }
}

// Nueva función para renderizar próximos acontecimientos
function renderUpcomingEvents(eventsAndClasses) {
    const container = document.getElementById('upcoming-events-list');
    if (!container) return;

    // Ordenar por fecha y hora
    const sortedItems = [...eventsAndClasses].sort((a, b) => {
        // Convertir a objetos Date si aún no lo son (para clases)
        const dateA = a.date instanceof Date ? a.date : new Date(a.date);
        const dateB = b.date instanceof Date ? b.date : new Date(b.date);
        return dateA.getTime() - dateB.getTime();
    });

    container.innerHTML = '';
    if (sortedItems.length === 0) {
        container.innerHTML = '<p>No tienes acontecimientos próximos.</p>';
        return;
    }

    sortedItems.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = `upcoming-item ${item.type}`;
        itemElement.style.borderLeft = `4px solid ${item.color}`;
        itemElement.innerHTML = `
            <h3>${item.title}</h3>
            <p><strong>Fecha:</strong> ${item.date.toLocaleDateString('es-ES')}</p>
            <p><strong>Hora:</strong> ${item.time} ${item.endTime ? `- ${item.endTime}` : ''}</p>
            <p><strong>Tipo:</strong> ${item.type === 'class' ? 'Clase' : 'Evento'}</p>
        `;
        container.appendChild(itemElement);
    });
}

// Nueva función para cargar eventos y clases unificados
async function fetchUpcomingEventsAndClasses() {
    const token = getCookie('authToken') || localStorage.getItem('token');
    if (!token) return;

    try {
        // Cargar eventos
        const eventsResponse = await fetch('/api/events', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const eventsData = await eventsResponse.json();
        const formattedEvents = eventsData.data?.map(event => ({
            id: event._id,
            title: event.title,
            date: new Date(event.date),
            time: new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), // Extraer la hora del objeto Date
            type: 'event',
            color: event.color || '#FF5733'
        })) || [];

        // Unificar y renderizar
        renderUpcomingEvents([...formattedEvents]);
    } catch (error) {
        console.error('Error fetching upcoming events and classes:', error);
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    // Toggle sidebar for mobile
    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.getElementById('overlay');
    const workspaceContainer = document.querySelector('.workspace-container');

    if (menuToggle && sidebar && overlay && workspaceContainer) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('active');
            overlay.classList.toggle('active');
            workspaceContainer.classList.toggle('sidebar-active');
        });

        overlay.addEventListener('click', () => {
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
            workspaceContainer.classList.remove('sidebar-active');
        });
    }
    // Global form element variables
    let addClassButton = document.getElementById('add-class-button');
    let classModal = document.getElementById('class-modal');
    let classModalClose = document.getElementById('class-modal-close');
    let cancelClassButton = document.getElementById('cancel-class-button');

    let classForm = document.getElementById('class-form');
    let subjectNameInput = document.getElementById('subjectName');
    let dayOfWeekSelect = document.getElementById('dayOfWeek');
    let startTimeInput = document.getElementById('startTime');
    let endTimeInput = document.getElementById('endTime');

    let subjectNameError = document.getElementById('subjectName-error');
    let dayOfWeekError = document.getElementById('dayOfWeek-error');
    let startTimeError = document.getElementById('startTime-error');
    let endTimeError = document.getElementById('endTime-error');

    let currentEditingEventId = null; // Para saber si estamos editando o creando

    // Event modal related elements and listeners
    const eventModal = document.getElementById('event-modal');
    if (eventModal) {
        const eventForm = document.getElementById('event-form');
        const eventTitleInput = document.getElementById('eventTitle');
        const eventDateInput = document.getElementById('eventDate');
        const eventTimeInput = document.getElementById('eventTime');
        const eventColorInput = document.getElementById('eventColor');
        const eventDescriptionInput = document.getElementById('eventDescription');

        const eventTitleError = document.getElementById('eventTitle-error');
        const eventDateError = document.getElementById('eventDate-error');
        const eventTimeError = document.getElementById('eventTime-error');

        const addEventButton = document.getElementById('add-event-button');
        const eventModalClose = document.getElementById('event-modal-close');
        const cancelEventButton = document.getElementById('cancel-event-button');
        const saveEventButton = document.getElementById('save-event-button');

        if (addEventButton) {
            addEventButton.addEventListener('click', () => {
                openEventModalForCreate();
                eventModal.style.display = 'block';
            });
        }

        if (eventModalClose) {
            eventModalClose.addEventListener('click', () => {
                eventModal.style.display = 'none';
                eventForm.reset();
                currentEditingEventId = null;
            });
        }

        if (cancelEventButton) {
            cancelEventButton.addEventListener('click', () => {
                eventModal.style.display = 'none';
                eventForm.reset();
                currentEditingEventId = null;
            });
        }

        // Function to open event modal for creation
        function openEventModalForCreate() {
            eventForm.reset();
            currentEditingEventId = null;
            document.getElementById('eventModalLabel').textContent = 'Añadir Evento';
            saveEventButton.textContent = 'Guardar Evento';
            // Clear previous errors
            eventTitleError.textContent = '';
            eventDateError.textContent = '';
            eventTimeError.textContent = '';
        }

        // Function to open event modal for editing
        function openEventModalForEdit(event) {
            currentEditingEventId = event._id;
            document.getElementById('eventModalLabel').textContent = 'Editar Evento';
            saveEventButton.textContent = 'Actualizar Evento';
            eventTitleInput.value = event.title;
            eventDescriptionInput.value = event.description;
            eventDateInput.value = event.date.split('T')[0]; // Assuming date is in ISO format
            eventTimeInput.value = event.time;
            eventColorInput.value = event.color;
            // Clear previous errors
            eventTitleError.textContent = '';
            eventDateError.textContent = '';
            eventTimeError.textContent = '';
        }

        // Event listener for event form submission
        eventForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Clear previous errors
            eventTitleError.textContent = '';
            eventDateError.textContent = '';
            eventTimeError.textContent = '';

            const title = eventTitleInput.value.trim();
            const date = eventDateInput.value;
            const time = eventTimeInput.value;
            const color = eventColorInput.value;
            const description = eventDescriptionInput.value; // Assuming you have an eventDescriptionInput

            let isValid = true;
            if (!title) {
                eventTitleError.textContent = 'El título es obligatorio.';
                isValid = false;
            }
            if (!date) {
                eventDateError.textContent = 'La fecha es obligatoria.';
                isValid = false;
            }
            if (!time) {
                eventTimeError.textContent = 'La hora es obligatoria.';
                isValid = false;
            }

            if (!isValid) {
                return;
            }

            const eventData = {
                title,
                date,
                time,
                color,
                description
            };

            
            let url = '/api/events';
            let method = 'POST';

            if (currentEditingEventId) {
                url = `/api/events/${currentEditingEventId}`;
                method = 'PUT';
            }

            try {
                const token = getCookie("authToken");
                const response = await fetch(url, {
                    method: method,
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(eventData)
                });

                const data = await response.json();

                if (response.ok) {
                    showMessage(data.message, 'success');
                    eventModal.style.display = 'none';
                    eventForm.reset();
                    currentEditingEventId = null;
                    fetchAndRenderAllActivities(); // Refresh the activities list
                } else {
                    showMessage(data.message || 'Error al guardar el evento.', 'error');
                }
            } catch (error) {
                console.error('Error al guardar el evento:', error);
                showMessage('Error de conexión al guardar el evento.', 'error');
            }
        });
    }

    // Function to render user events and classes in the 'Mis Actividades' section
    function renderUserEvents(activities) {
        const userActivitiesContainer = document.getElementById('events-list');
        if (userActivitiesContainer) {
            userActivitiesContainer.innerHTML = ''; // Clear previous activities
            // console.log('Activities received by renderUserEvents:', activities); // Added for debugging
            if (activities.length === 0) {
                userActivitiesContainer.innerHTML = '<p>No tienes actividades programadas aún.</p>';
                return;
            }
    
            // Sort activities by date and time
            activities.sort((a, b) => new Date(a.date) - new Date(b.date));
    
            // console.log('Activities array before forEach:', activities, 'Length:', activities.length); // Removed console.log
    
            activities.forEach(activity => {
                const activityCard = document.createElement('div');
                activityCard.className = 'activity-item'; // Use a generic class for styling
                activityCard.style.borderLeft = `4px solid ${activity.color}`;
    
                // console.log('Creating activity card for:', activity.type, activity); // Removed console.log
                // console.log('Activity object before rendering:', activity); // Removed for debugging
    
                let detailsHtml = '';
                let actionsHtml = '';
    
                if (activity.type === 'event') {
                    const eventDateTime = new Date(activity.date);
                    detailsHtml = `
                        <h3>${activity.title}</h3>
                        <p><strong>Tipo:</strong> Evento</p>
                        <p><strong>Fecha:</strong> ${eventDateTime.toLocaleDateString('es-ES')}</p>
                        <p><strong>Hora:</strong> ${eventDateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        <p><strong>Descripción:</strong> ${activity.description || 'N/A'}</p>
                    `;
                    actionsHtml = `
                        <button class="button-edit-event" data-id="${activity._id}">Editar</button>
                        <button class="button-delete-event" data-id="${activity._id}">Eliminar</button>
                    `;
                } else if (activity.type === 'class') {
                    detailsHtml = `
                        <h3>${activity.name}</h3>
                        <p><strong>Tipo:</strong> Clase</p>
                        <p><strong>Día:</strong> ${activity.dayOfWeek.join(', ')}</p>
                        <p><strong>Hora:</strong> ${activity.startTime} - ${activity.endTime}</p>
                        <p><strong>Profesor:</strong> ${activity.teacher}</p>
                    `;
                    actionsHtml = `
                        <button class="button-edit-class" data-id="${activity._id}">Editar</button>
                        <button class="button-delete-class" data-id="${activity._id}">Eliminar</button>
                    `;
                } 
    
                activityCard.innerHTML = `
                    ${detailsHtml}
                    <div class="activity-actions">
                        ${actionsHtml}
                    </div>
                `;
                userActivitiesContainer.appendChild(activityCard);
    

                // Add event listeners for edit and delete buttons
                if (activity.type === 'event') {
                    activityCard.querySelector('.button-edit-event').addEventListener('click', () => {
                        if (eventModal) {
                            openEventModalForEdit(activity);
                            eventModal.style.display = 'block';
                        }
                    });
                    activityCard.querySelector('.button-delete-event').addEventListener('click', async () => {
                        if (confirm('¿Estás seguro de que quieres eliminar este evento?')) {
                            try {
                                const response = await fetch(`/api/events/${activity._id}`, {
                                    method: 'DELETE',
                                    headers: {
                                        
                                    }
                                });
                                                 const data = await response.json();
                                if (response.ok) {
                                    showMessage(data.message, 'success');
                                    fetchAndRenderAllActivities(); // Actualizar lista de actividades
                                } else {
                                    showMessage(data.message, 'error');
                                }
                            } catch (error) {
                                console.error('Error deleting event:', error);
                                showMessage('Error de conexión al eliminar el evento.', 'error');
                            }
                        }
                    });
                } else if (activity.type === 'class') {
                    activityCard.querySelector('.button-edit-class').addEventListener('click', () => {
                        openClassModalForEdit(activity);
                        classModal.style.display = 'block';
                    });
                    activityCard.querySelector('.button-delete-class').addEventListener('click', async () => {
                        if (confirm('¿Estás seguro de que quieres eliminar esta clase?')) {
                            try {
                                const response = await fetch(`/api/classes/${activity._id}`, {
                                    method: 'DELETE',
                                    headers: {
                                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                                    }
                                });
                                const data = await response.json();
                                if (response.ok) {
                                    showMessage(data.message, 'success');
                                    fetchAndRenderAllActivities(); // Actualizar lista de actividades
                                } else {
                                    showMessage(data.message, 'error');
                                }
                            } catch (error) {
                                console.error('Error deleting class:', error);
                                showMessage('Error de conexión al eliminar la clase.', 'error');
                            }
                        }
                    });
                }
            });
        }
    }

    // Function to fetch and render all activities (events and classes)
    async function fetchAndRenderAllActivities() {
        const token = getCookie('authToken') || localStorage.getItem('token');
        if (!token) return;

        try {
            const eventsResponse = await fetch('/api/events', { headers: { 'Authorization': `Bearer ${token}` } });
            const eventsData = await eventsResponse.json();

            let allActivities = [];

            if (eventsResponse.ok && eventsData) {
                const formattedEvents = eventsData.map(event => ({
                    ...event,
                    type: 'event',
                    date: new Date(event.date),
                    color: event.color || '#FF5733'
                }));
                allActivities = allActivities.concat(formattedEvents);
            }

            renderUserEvents(allActivities);

        } catch (error) {
            console.error('Error fetching all activities:', error);
            showMessage('Error de conexión al cargar las actividades.', 'error');
        }
    }

    // Function to open event modal for editing








    // Initial fetches when DOM is loaded
    fetchAndRenderAllActivities(); // Fetch and render all activities on dashboard
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;

            try {
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, password }),
                });

                const responseData = await response.json();
                if (response.ok) {
                    showMessage(responseData.message, 'success');
                    window.location.href = '/dashboard';
                } else {
                    if (response.status === 400) {
                        showMessage(responseData.message || 'Datos de entrada inválidos', 'error');
                    } else if (response.status === 401) {
                        console.log(responseData.message)
                        showMessage(responseData.message || 'Credenciales inválidas', 'error');
                    } else if (response.status === 406) {
                        showMessage(responseData.message || 'Solicitud no aceptable', 'error');
                    } else if (response.status === 500) {
                        showMessage(responseData.message || 'Error interno del servidor', 'error');
                    } else {
                        showMessage(responseData.message || 'Error desconocido al iniciar sesión', 'error');
                    }
                }
            } catch (error) {
                console.error('Error:', error);
                showMessage('Error de conexión', 'error');
            }
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const firstName = document.getElementById('firstName').value;
            const lastName = document.getElementById('lastName').value;
            const email = document.getElementById('register-email').value;
            const password = document.getElementById('register-password').value;

            try {
                const response = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ firstName, lastName, email, password }),
                });

                if (response.ok) {
                    const data = await response.json();
                    showMessage(data.message, 'success');
                    registerForm.reset();
                    // Redirigir al login después de un registro exitoso
                    window.location.href = '/login';
                } else {
                    const errorData = await response.json();
                    if (response.status === 400) {
                        showMessage(errorData.message || 'Datos de entrada inválidos', 'error', 'register-message');
                    } else if (response.status === 409) {
                        showMessage(errorData.message || 'El email ya está registrado', 'error', 'register-message');
                    } else if (response.status === 500) {
                        showMessage(errorData.message || 'Error interno del servidor', 'error', 'register-message');
                    } else {
                        // Fallback para cualquier otro error inesperado
                        showMessage(errorData.message || 'Error desconocido al registrar usuario', 'error', 'register-message');
                    }
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
        await new Promise(resolve => setTimeout(resolve, 100)); // Esperar 100ms

        


        try {
            const response = await fetch('/api/auth/profile', {
                method: 'GET',
                headers: {
                    
                }
            });
            const data = await response.json();
            if (response.status === 401) {
                window.location.href = '/login.html';
                return;
            }
            if (response.status === 404){
                return profileImageDisplay.src = "/assets/images/default-profile.png"
            }
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
                console.log("error?")
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
                window.location.href = "/index"
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
                const response = await fetch('/api/auth/profile/image/upload', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${authToken}`
                    },
                    body: formData
                });
    
                const data = await response.json();
                if (response.ok) {
                    showMessage(data.message, 'success');
                    profileImageDisplay.src = data.user.profileImage; // Update image display
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
                const response = await fetch('/api/auth/profile/image', {
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
                    alert("error al eliminar la imagen")
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
            if (response.status === 401) {
                window.location.href = '/login.html';
                return;
            }
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
            const startTime = startTimeInput.value || '08:00'; // Default to 08:00 if empty
            const endTime = endTimeInput.value || '09:00';   // Default to 09:00 if empty
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
                    classModal.style.display = 'none'; // Close the modal
                    resetClassFormAndModal(); // Reset form fields
                    fetchAndRenderDashboardClasses(); // Refresh the class list
                } else {
                    showMessage(data.message || 'Error al guardar la clase.', 'error');
                }
            } catch (error) {
                console.error('Error saving class:', error);
                showMessage('Error de conexión al guardar la clase.', 'error');
            }
        });
    }

    
     fetchAndRenderDashboardClasses(); // Refresh the class list

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
    const classesList = document.getElementById('classes-list');
    if (!classesList) {
        // If classes-list element is not found, it means we are not on the dashboard page.
        // So, we just return without doing anything.
        return;
    }

    const authToken = getCookie('authToken');
    if (!authToken) {
        console.error('No authentication token found.');
        window.location.href = "./login"
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
        if (response.status === 401) {
            window.location.href = '/login';
            return;
        }

        if (response.ok) {
            const classesList = document.getElementById('classes-list');
            classesList.innerHTML = ''; // Clear existing classes

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
                        <button class="button-dashboard" data-id="${classItem._id}">Dashboard</button>
                        <button class="button-edit" data-id="${classItem._id}">Editar</button>
                        <button class="button-delete" data-id="${classItem._id}">Eliminar</button>
                    </div>
                `;
                classesList.appendChild(classElement);

                // Add event listeners for edit and delete buttons
                classElement.querySelector('.button-edit').addEventListener('click', () => {
                    window.location.href = `/edit-class?id=${classItem._id}`;
                });

                classElement.querySelector('.button-delete').addEventListener('click', async () => {
                    if (confirm('¿Estás seguro de que quieres eliminar esta clase?')) {
                        try {
                            const response = await fetch(`/api/classes/${classItem._id}`, {
                                method: 'DELETE',
                                headers: {
                                    'Authorization': `Bearer ${authToken}`
                                }
                            });

                            const data = await response.json();
                            if (response.ok) {
                                showMessage(data.message, 'success');
                                window.location.reload(); // Recargar la página después de eliminar
                            } else {
                                showMessage(data.message || 'Error al eliminar la clase', 'error');
                            }
                        } catch (error) {
                            console.error('Error deleting class:', error);
                            showMessage('Error de conexión al eliminar la clase.', 'error');
                        }
                    }
                });

                classElement.querySelector('.button-dashboard').addEventListener('click', () => {
                    window.location.href = `/class-dashboard?classId=${classItem._id}`;
                });
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

// Manejo del botón de cerrar sesión
document.addEventListener('DOMContentLoaded', () => {
    const logoutButton = document.querySelector('#logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', async () => {
            try {
                const response = await fetch('/api/auth/logout', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include'
                });

                const data = await response.json();

                if (response.ok) {
                    showMessage(data.message, 'success');
                    window.location.href = '/';
                } else {
                    showMessage(data.message || 'Error al cerrar sesión', 'error');
                }
            } catch (error) {
                console.error('Error during logout fetch or JSON parsing:', error);
                showMessage('Error de conexión', 'error');
            }
        });
    }
});

// Dark Mode Toggle
function toggleDarkMode() {
    const body = document.body;
    body.dataset.theme = body.dataset.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', body.dataset.theme);
    updateDarkModeToggleIcon();
    updateLogo(body.dataset.theme);
}

function updateLogo(theme) {
    const mainLogo = document.getElementById('main-logo');
    const sidebarLogo = document.getElementById('sidebar-logo');

    if (mainLogo) {
        if (theme === 'dark') {
            mainLogo.src = './assets/images/logogenkiG-white.png';
        } else {
            mainLogo.src = './assets/images/logogenkiG.png';
        }
    }

    if (sidebarLogo) {
        if (theme === 'dark') {
            sidebarLogo.src = './assets/images/GENKI_-removebg-preview-white.png';
        } else {
            sidebarLogo.src = './assets/images/GENKI_-removebg-preview.png';
        }
    }
}

function updateDarkModeToggleIcon() {
    const toggleButton = document.getElementById('darkModeToggle');
    if (toggleButton) {
        if (document.body.dataset.theme === 'dark') {
            toggleButton.innerHTML = '<i class="fas fa-sun"></i>';
        } else {
            toggleButton.innerHTML = '<i class="fas fa-moon"></i>';
        }
    }
}

// Apply saved theme on load
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.body.dataset.theme = savedTheme;
    } else {
        // Default to light theme if no preference is saved
        document.body.dataset.theme = 'light';
    }
    updateDarkModeToggleIcon(); // Update icon on load
    updateLogo(document.body.dataset.theme); // Update logo on load

    const darkModeToggle = document.getElementById('darkModeToggle');
    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', toggleDarkMode);
    }
});