document.addEventListener('DOMContentLoaded', async () => {
    const courseSelect = document.getElementById('course-select');
    const assessmentSelect = document.getElementById('assessment-select');
    const gradebookGrid = document.getElementById('gradebook-grid');
    const saveGradesButton = document.getElementById('save-grades-button');

    let courses = [];
    let assessments = [];
    let students = [];
    let grades = {}; // Stores grades by studentId and assessmentId

    // Function to fetch data from the API
    async function fetchData(url) {
        const token = getCookie('authToken'); // Get token from cookie
        if (!token) {
            window.location.href = 'login.html';
            return;
        }
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (response.status === 401) {
            window.location.href = 'login.html';
            return;
        }
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    }

    // Populate course dropdown
    async function populateCourses() {
        try {
            courses = await fetchData('/api/classes'); // Assuming an endpoint for teacher's courses
            courseSelect.innerHTML = '<option value="">Seleccione un curso</option>';
            if (Array.isArray(courses)) {
                courses.forEach(course => {
                    const option = document.createElement('option');
                option.value = course._id;
                option.textContent = `${course.subjectName} - ${course.courseGroup}`;
                courseSelect.appendChild(option);
                });
            }
            
        } catch (error) {
            console.error('Error fetching courses:', error);
            alert('Error al cargar los cursos.');
        }
    }

    // Populate assessment dropdown based on selected course
    async function populateAssessments(courseId) {
        assessmentSelect.innerHTML = '<option value="">Seleccione una evaluación</option>';
        assessmentSelect.disabled = true;
        if (!courseId) {
            return;
        }
        try {
            assessments = await fetchData(`/api/courses/${courseId}/assessments`); // Assuming an endpoint for course assessments
            assessments.forEach(assessment => {
                const option = document.createElement('option');
                option.value = assessment.id;
                option.textContent = assessment.name;
                assessmentSelect.appendChild(option);
            });
            assessmentSelect.disabled = false;
        } catch (error) {
            console.error('Error fetching assessments:', error);
            alert('Error al cargar las evaluaciones.');
        }
    }

    // Render gradebook grid
    async function renderGradebook(courseId, assessmentId) {
        gradebookGrid.innerHTML = '';
        saveGradesButton.style.display = 'none';
        if (!courseId || !assessmentId) {
            return;
        }

        try {
            students = await fetchData(`/api/courses/${courseId}/students`); // Assuming an endpoint for course students
            const currentGrades = await fetchData(`/api/assessments/${assessmentId}/grades`); // Assuming an endpoint for existing grades

            // Initialize grades object
            grades = {};
            currentGrades.forEach(grade => {
                grades[grade.studentId] = grade.grade;
            });

            if (students.length === 0) {
                gradebookGrid.innerHTML = '<p>No hay alumnos en este curso.</p>';
                return;
            }

            const table = document.createElement('table');
            table.classList.add('gradebook-table');
            table.innerHTML = `
                <thead>
                    <tr>
                        <th>Alumno</th>
                        <th>Calificación</th>
                    </tr>
                </thead>
                <tbody>
                </tbody>
            `;
            const tbody = table.querySelector('tbody');

            students.forEach(student => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${student.firstName} ${student.lastName}</td>
                    <td>
                        <input type="number" min="0" max="10" step="0.5" data-student-id="${student.id}" value="${grades[student.id] !== undefined ? grades[student.id] : ''}">
                    </td>
                `;
                tbody.appendChild(tr);
            });

            gradebookGrid.appendChild(table);
            saveGradesButton.style.display = 'block';

            // Add event listener for grade input changes
            table.querySelectorAll('input[type="number"]').forEach(input => {
                input.addEventListener('change', (event) => {
                    const studentId = event.target.dataset.studentId;
                    const grade = parseFloat(event.target.value);
                    grades[studentId] = isNaN(grade) ? null : grade; // Store null if input is empty or invalid
                });
            });

        } catch (error) {
            console.error('Error rendering gradebook:', error);
            alert('Error al cargar la planilla de calificaciones.');
        }
    }

    // Event listeners for dropdown changes
    courseSelect.addEventListener('change', () => {
        const courseId = courseSelect.value;
        populateAssessments(courseId);
        renderGradebook(courseId, assessmentSelect.value);
    });

    assessmentSelect.addEventListener('change', () => {
        const courseId = courseSelect.value;
        const assessmentId = assessmentSelect.value;
        renderGradebook(courseId, assessmentId);
    });

    // Save grades button click handler
    saveGradesButton.addEventListener('click', async () => {
        const assessmentId = assessmentSelect.value;
        if (!assessmentId) {
            alert('Por favor, seleccione una evaluación.');
            return;
        }

        const gradesToSave = Object.keys(grades).map(studentId => ({
            studentId: studentId,
            grade: grades[studentId]
        }));

        try {
            const token = getCookie('authToken'); // Get token from cookie
            if (!token) {
                window.location.href = 'login.html';
                return;
            }
            const response = await fetch(`/api/assessments/${assessmentId}/grades`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ grades: gradesToSave })
            });

            if (response.status === 401) {
                window.location.href = 'login.html';
                return;
            }
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            alert('Calificaciones guardadas exitosamente.');
            // Re-render gradebook to reflect saved grades (optional)
            renderGradebook(courseSelect.value, assessmentSelect.value);
        } catch (error) {
            console.error('Error saving grades:', error);
            alert('Error al guardar las calificaciones.');
        }
    });

    // Initial population
    populateCourses();
});