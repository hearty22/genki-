document.addEventListener('DOMContentLoaded', async () => {
    const classId = new URLSearchParams(window.location.search).get('id');
    const editClassForm = document.getElementById('edit-class-form');
    const subjectNameInput = document.getElementById('subjectName');
    const courseGroupInput = document.getElementById('courseGroup');
    const dayOfWeekSelect = document.getElementById('dayOfWeek');
    const startTimeInput = document.getElementById('startTime');
    const endTimeInput = document.getElementById('endTime');
    const locationInput = document.getElementById('location');
    const colorInput = document.getElementById('class-color');
    const classIdInput = document.getElementById('class-id');
    const cancelEditButton = document.getElementById('cancel-edit-button');

    // Función para obtener el token de autenticación (asumiendo que está en una cookie)
    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        return null;
    }

    // Función para mostrar mensajes (asumiendo que existe en app.js o se define aquí)
    function showMessage(message, type) {
        const messageContainer = document.getElementById('message-container');
        if (messageContainer) {
            messageContainer.textContent = message;
            messageContainer.className = `message-container ${type}`;
            setTimeout(() => {
                messageContainer.textContent = '';
                messageContainer.className = 'message-container';
            }, 3000);
        }
    }

    console.log('Class ID from URL:', classId);

    if (!classId) {
        showMessage('ID de clase no proporcionado.', 'error');
        return;
    }

    const authToken = getCookie('authToken');
    console.log('Auth Token:', authToken);
    if (!authToken) {
        showMessage('No autenticado. Por favor, inicia sesión.', 'error');
        window.location.href = '/login.html';
        return;
    }

    try {
        const response = await fetch(`/api/classes/${classId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        const classData = await response.json();
        console.log('API Response for class data:', classData);

        if (response.ok) {
            classIdInput.value = classData._id;
            subjectNameInput.value = classData.subjectName;
            courseGroupInput.value = classData.courseGroup;
            
            // Seleccionar los días de la semana
            Array.from(dayOfWeekSelect.options).forEach(option => {
                option.selected = classData.dayOfWeek.includes(option.value);
            });
            console.log('Subject Name:', subjectNameInput.value);
            console.log('Course Group:', courseGroupInput.value);
            console.log('Day of Week:', classData.dayOfWeek);
            console.log('Start Time:', classData.startTime);
            console.log('End Time:', classData.endTime);
            console.log('Location:', classData.location);
            console.log('Color:', classData.color);

            startTimeInput.value = classData.startTime;
            endTimeInput.value = classData.endTime;
            locationInput.value = classData.location;
            colorInput.value = classData.color;
        } else {
            showMessage(classData.message || 'Error al cargar la clase.', 'error');
        }
    } catch (error) {
        console.error('Error fetching class:', error);
        showMessage('Error de conexión al cargar la clase.', 'error');
    }

    editClassForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const selectedDays = Array.from(dayOfWeekSelect.selectedOptions).map(option => option.value);

        const updatedClassData = {
            subjectName: subjectNameInput.value,
            courseGroup: courseGroupInput.value,
            dayOfWeek: selectedDays,
            startTime: startTimeInput.value,
            endTime: endTimeInput.value,
            location: locationInput.value,
            color: colorInput.value
        };

        try {
            const response = await fetch(`/api/classes/${classId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify(updatedClassData)
            });

            const data = await response.json();

            if (response.ok) {
                showMessage(data.message, 'success');
                window.location.href = '/dashboard.html'; // Redirigir al dashboard después de guardar
            } else {
                showMessage(data.message || 'Error al actualizar la clase.', 'error');
            }
        } catch (error) {
            console.error('Error updating class:', error);
            showMessage('Error de conexión al actualizar la clase.', 'error');
        }
    });

    cancelEditButton.addEventListener('click', () => {
        window.location.href = '/dashboard.html'; // Redirigir al dashboard al cancelar
    });
});