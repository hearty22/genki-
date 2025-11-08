document.addEventListener('DOMContentLoaded', async () => {
    const classDashboardTitle = document.getElementById('class-dashboard-title');
    const topAbsencesList = document.getElementById('top-absences-list');
    const averageGradeChartCanvas = document.getElementById('average-grade-chart');
    const studentsTableBody = document.getElementById('students-table-body');
    const addStudentButton = document.getElementById('add-student-button');
    const studentModal = document.getElementById('student-modal');
    const studentModalTitle = document.getElementById('student-modal-title');
    const studentForm = document.getElementById('student-form');
    const studentIdInput = document.getElementById('student-id');
    const studentNameInput = document.getElementById('student-name');
    const closeModalButton = studentModal.querySelector('.close-button');

    let averageGradeChart = null;

    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    }


    // --- Data Fetching ---
    async function fetchData(url, options = {}) {
        console.log('Fetching data with options:', options); // Log options
        const response = await fetch(url, options);
        if (response.status === 401) {
            window.location.href = 'login';
            return;
        }
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status}` }));
            throw new Error(errorData.message);
        }
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
            return response.json();
        } else {
            return response.text();
        }
    }

    // --- Student Management ---
    async function loadStudents() {
        const classId = new URLSearchParams(window.location.search).get('classId');
        const authToken = getCookie('authToken');
        const options = { headers: { 'Authorization': `Bearer ${authToken}` } };

        try {
            const students = await fetchData(`/api/classes/${classId}/students`, options);
            renderStudents(students);
        } catch (error) {
            console.error('Error loading students:', error);
        }
    }

    function renderStudents(students) {
        studentsTableBody.innerHTML = '';
        students.forEach(student => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${student.name}</td>
                <td>
                    <button class="btn btn-sm btn-edit" data-id="${student._id}" data-name="${student.name}">Editar</button>
                    <button class="btn btn-sm btn-danger btn-delete" data-id="${student._id}">Eliminar</button>
                </td>
            `;
            studentsTableBody.appendChild(row);
        });
    }

    function openStudentModal(student = null) {
        studentModal.style.display = 'block';
        if (student) {
            studentModalTitle.textContent = 'Editar Alumno';
            studentIdInput.value = student.id;
            studentNameInput.value = student.name;
        } else {
            studentModalTitle.textContent = 'Añadir Alumno';
            studentForm.reset();
            studentIdInput.value = '';
        }
    }

    function closeStudentModal() {
        studentModal.style.display = 'none';
    }

    addStudentButton.addEventListener('click', () => openStudentModal());
    closeModalButton.addEventListener('click', closeStudentModal);
    window.addEventListener('click', (event) => {
        if (event.target === studentModal) {
            closeStudentModal();
        }
    });

    // --- Dashboard ---
    async function loadDashboard() {
        const urlParams = new URLSearchParams(window.location.search);
        const classId = urlParams.get('classId');

        if (!classId) {
            classDashboardTitle.textContent = 'Panel de la Clase - Clase no encontrada';
            return;
        }

        try {
            const authToken = getCookie('authToken'); // Assume getCookie is available
            if (!authToken) {
                window.location.href = 'login';
                return;
            }

            const options = {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            };

            const classData = await fetchData(`/api/classes/${classId}`, options);
            classDashboardTitle.textContent = `Panel de la Clase - ${classData.subjectName} ${classData.courseGroup}`;

            // Load students
            await loadStudents(classId, options);

            const stats = await fetchData(`/api/classes/${classId}/dashboard`, options);

            // Render top absences
            topAbsencesList.innerHTML = '';
            if (stats.topAbsences.length > 0) {
                stats.topAbsences.forEach(student => {
                    const li = document.createElement('li');
                    li.textContent = `${student.name} - ${student.absenceCount} ausencias`;
                    topAbsencesList.appendChild(li);
                });
            } else {
                topAbsencesList.innerHTML = '<li>No hay datos de ausencias.</li>';
            }

            // Render average grade chart
            if (averageGradeChart) {
                averageGradeChart.destroy();
            }

            const labels = stats.averageGradesPerAssessment.map(item => item.name);
            const data = stats.averageGradesPerAssessment.map(item => item.averageGrade);

            averageGradeChart = new Chart(averageGradeChartCanvas, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Promedio de Notas por Evaluación',
                        data: data,
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 10
                        }
                    }
                }
            });

        } catch (error) {
            console.error('Error loading dashboard:', error);
            classDashboardTitle.textContent = 'Panel de la Clase - Error al cargar los datos';
        }
    }

    studentForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const classId = new URLSearchParams(window.location.search).get('classId');
        const studentId = studentIdInput.value;
        const studentName = studentNameInput.value;
        const authToken = getCookie('authToken');

        const options = {
            method: studentId ? 'PUT' : 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ name: studentName })
        };

        const url = studentId
            ? `/api/classes/${classId}/students/${studentId}`
            : `/api/classes/${classId}/students`;

        try {
            await fetchData(url, options);
            loadStudents(); // Recargar la lista de alumnos
            closeStudentModal();
        } catch (error) {
            console.error('Error saving student:', error);
        }
    });

    studentsTableBody.addEventListener('click', async (event) => {
        const classId = new URLSearchParams(window.location.search).get('classId');
        const authToken = getCookie('authToken');

        if (event.target.classList.contains('btn-edit')) {
            const studentId = event.target.dataset.id;
            const studentName = event.target.dataset.name;
            openStudentModal({ id: studentId, name: studentName });
        }

        if (event.target.classList.contains('btn-delete')) {
            const studentId = event.target.dataset.id;
            if (confirm('¿Estás seguro de que quieres eliminar a este alumno?')) {
                const options = {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${authToken}`
                    }
                };

                try {
                    const updatedStudents = await fetchData(`/api/classes/${classId}/students/${studentId}`, options);
                    renderStudents(updatedStudents);
                } catch (error) {
                    console.error('Error deleting student:', error);
                }
            }
        }
    });

    loadDashboard();
});