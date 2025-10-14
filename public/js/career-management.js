document.addEventListener('DOMContentLoaded', () => {
    const addCareerBtn = document.getElementById('add-career-btn');
    const careerModal = document.getElementById('career-modal');
    const closeBtn = document.querySelector('.close-btn');
    const careerForm = document.getElementById('career-form');
    const modalTitle = document.getElementById('modal-title');
    const careerIdInput = document.getElementById('career-id');
    const careerNameInput = document.getElementById('career-name');
    const careerLongInput = document.getElementById('career-long');
    const saveCareerBtn = document.getElementById('save-career-btn');
    const careerList = document.getElementById('career-list');

    const institutionId = new URLSearchParams(window.location.search).get('inst_id');

    const fetchCareers = async () => {
        try {
            const token = getCookie('token') || localStorage.getItem("token");
            const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };
            const response = await fetch(`/institutions/${institutionId}/careers`, { headers });
            const data = await response.json();
            if (data.success) {
                renderCareers(data.careers);
            }
        } catch (error) {
            console.error('Error fetching careers:', error);
        }
    };

    const renderCareers = (careers) => {
        careerList.innerHTML = '';
        careers.forEach(career => {
            const careerItem = document.createElement('div');
            careerItem.classList.add('career-item');
            careerItem.innerHTML = `
                <span>${career.name} (${career.career_long} años)</span>
                <div>
                    <button class="edit-btn" data-id="${career.id}">Editar</button>
                    <button class="delete-btn" data-id="${career.id}">Eliminar</button>
                </div>
            `;
            careerList.appendChild(careerItem);
        });
    };

    const openModal = (title, career = {}) => {
        modalTitle.textContent = title;
        careerIdInput.value = career.id || '';
        careerNameInput.value = career.name || '';
        careerLongInput.value = career.career_long || '';
        careerModal.style.display = 'block';
    };

    const closeModal = () => {
        careerModal.style.display = 'none';
    };

    addCareerBtn.addEventListener('click', () => openModal('Agregar Carrera'));
    closeBtn.addEventListener('click', closeModal);
    window.addEventListener('click', (event) => {
        if (event.target === careerModal) {
            closeModal();
        }
    });

    careerForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const id = careerIdInput.value;
        const name = careerNameInput.value;
        const career_long = careerLongInput.value;

        const method = id ? 'PUT' : 'POST';
        const url = id ? `/careers/${id}` : `/institutions/${institutionId}/careers`;

        try {
            const token = getCookie('token') || localStorage.getItem("token");
            const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };
            const response = await fetch(url, {
                method,
                headers,
                body: JSON.stringify({ name, career_long, inst_id: institutionId }),
            });
            const data = await response.json();
            if (data.success) {
                closeModal();
                fetchCareers();
            }
        } catch (error) {
            console.error('Error saving career:', error);
        }
    });

    careerList.addEventListener('click', async (event) => {
        const target = event.target;
        const id = target.dataset.id;

        if (target.classList.contains('edit-btn')) {
            try {
                const token = getCookie('token') || localStorage.getItem("token");
                const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };
                const response = await fetch(`/api/careers/${id}`, { headers });
                const data = await response.json();
                if (data.success) {
                    openModal('Editar Carrera', data.career);
                }
            } catch (error) {
                console.error('Error fetching career:', error);
            }
        }

        if (target.classList.contains('delete-btn')) {
            if (confirm('¿Estás seguro de que quieres eliminar esta carrera?')) {
                try {
                    const token = getCookie('token') || localStorage.getItem("token");
                    const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };
                    const response = await fetch(`/careers/${id}`, {
                        method: 'DELETE',
                        headers,
                    });
                    const data = await response.json();
                    if (data.success) {
                        fetchCareers();
                    }
                } catch (error) {
                    console.error('Error deleting career:', error);
                }
            }
        }
    });

    if (institutionId) {
        fetchCareers();
    }
});