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
    function getStudentGrade(studentId, grades) {
        return grades[studentId] !== undefined ? grades[studentId] : '';
    }

    async function fetchData(url) {
        const response = await fetch(url);
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
                    assessments = await fetchData(`/api/assessments/courses/${courseId}/assessments`); // Assuming an endpoint for course assessments
                    assessments.forEach(assessment => {
                        const option = document.createElement('option');
                        option.value = assessment._id;
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
                    students = await fetchData(`/api/classes/${courseId}/students`); // Assuming an endpoint for course students
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
                        const row = document.createElement('tr');
                        row.innerHTML = `
                            <td>${student.name}</td>
                            <td><input type="text" class="grade-input" data-student-id="${student._id}" value="${getStudentGrade(student._id, grades)}"></td>
                        `;
                        tbody.appendChild(row);
                    });

                    table.appendChild(tbody);
                    gradebookGrid.appendChild(table);
                    saveGradesButton.style.display = 'block';

                    // Add event listener for grade input changes
                    table.querySelectorAll('input.grade-input').forEach(input => {
                        input.addEventListener('change', (event) => {
                            const studentId = event.target.dataset.studentId;
                            const grade = parseInt(event.target.value, 10);
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
                    const response = await fetch(`/api/assessments/${assessmentId}/grades`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
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

            // Get modal elements
            const addAssessmentModal = document.getElementById('add-assessment-modal');
            const closeAssessmentModalButton = addAssessmentModal.querySelector('.close-button');
            const addAssessmentForm = document.getElementById('add-assessment-form');
            const newAssessmentNameInput = document.getElementById('new-assessment-name');
            const newAssessmentCourseSelect = document.getElementById('new-assessment-course');

            // Function to show the add assessment modal
            async function showAddAssessmentModal() {
                addAssessmentModal.style.display = 'block';
                // Populate course select in modal
                newAssessmentCourseSelect.innerHTML = '<option value="">Seleccione un curso</option>';
                if (Array.isArray(courses)) {
                    courses.forEach(course => {
                        const option = document.createElement('option');
                        option.value = course._id;
                        option.textContent = `${course.subjectName} - ${course.courseGroup}`;
                        newAssessmentCourseSelect.appendChild(option);
                    });
                }
            }

            // Function to hide the add assessment modal
            function hideAddAssessmentModal() {
                addAssessmentModal.style.display = 'none';
                addAssessmentForm.reset();
            }

            // Close modal button event listener
            closeAssessmentModalButton.addEventListener('click', hideAddAssessmentModal);

            // Close modal if clicked outside
            window.addEventListener('click', (event) => {
                if (event.target === addAssessmentModal) {
                    hideAddAssessmentModal();
                }
            });

            // Add Assessment form submission
            addAssessmentForm.addEventListener('submit', async (event) => {
                event.preventDefault();
                const assessmentName = newAssessmentNameInput.value;
                const courseId = newAssessmentCourseSelect.value;

                if (!assessmentName || !courseId) {
                    alert('Por favor, complete todos los campos.');
                    return;
                }

                try {
                    const token = getCookie('authToken');
                    if (!token) {
                        window.location.href = 'login.html';
                        return;
                    }
                    const response = await fetch('/api/assessments', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({ name: assessmentName, course: courseId })
                    });

                    if (response.status === 401) {
                        window.location.href = 'login.html';
                        return;
                    }
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }

                    alert('Evaluación añadida exitosamente.');
                    hideAddAssessmentModal();
                    // Re-populate assessments for the current course
                    populateAssessments(courseSelect.value);
                } catch (error) {
                    console.error('Error adding assessment:', error);
                    alert('Error al añadir la evaluación.');
                }
            });

            // Get edit modal elements
            const editAssessmentModal = document.getElementById('edit-assessment-modal');
            const closeEditAssessmentModalButton = editAssessmentModal.querySelector('.close-button');
            const editAssessmentForm = document.getElementById('edit-assessment-form');
            const editAssessmentIdInput = document.getElementById('edit-assessment-id');
            const editAssessmentNameInput = document.getElementById('edit-assessment-name');
            const editAssessmentCourseSelect = document.getElementById('edit-assessment-course');

            // Function to show the edit assessment modal
            async function showEditAssessmentModal() {
                const assessmentId = assessmentSelect.value;
                if (!assessmentId) {
                    alert('Por favor, seleccione una evaluación para editar.');
                    return;
                }

                const selectedAssessment = assessments.find(assessment => assessment.id === assessmentId);
                if (!selectedAssessment) {
                    alert('Evaluación no encontrada.');
                    return;
                }

                editAssessmentIdInput.value = selectedAssessment.id;
                editAssessmentNameInput.value = selectedAssessment.name;

                // Populate course select in modal
                editAssessmentCourseSelect.innerHTML = '<option value="">Seleccione un curso</option>';
                if (Array.isArray(courses)) {
                    courses.forEach(course => {
                        const option = document.createElement('option');
                        option.value = course._id;
                        option.textContent = `${course.subjectName} - ${course.courseGroup}`;
                        if (course._id === selectedAssessment.course) {
                            option.selected = true;
                        }
                        editAssessmentCourseSelect.appendChild(option);
                    });
                }

                editAssessmentModal.style.display = 'block';
            }

            // Function to hide the edit assessment modal
            function hideEditAssessmentModal() {
                editAssessmentModal.style.display = 'none';
                editAssessmentForm.reset();
            }

            // Close edit modal button event listener
            closeEditAssessmentModalButton.addEventListener('click', hideEditAssessmentModal);

            // Close edit modal if clicked outside
            window.addEventListener('click', (event) => {
                if (event.target === editAssessmentModal) {
                    hideEditAssessmentModal();
                }
            });

            // Edit Assessment form submission
            editAssessmentForm.addEventListener('submit', async (event) => {
                event.preventDefault();
                const assessmentId = editAssessmentIdInput.value;
                const assessmentName = editAssessmentNameInput.value;
                const courseId = editAssessmentCourseSelect.value;

                if (!assessmentName || !courseId) {
                    alert('Por favor, complete todos los campos.');
                    return;
                }

                try {
                    const token = getCookie('authToken');
                    if (!token) {
                        window.location.href = 'login.html';
                        return;
                    }
                    const response = await fetch(`/api/assessments/${assessmentId}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({ name: assessmentName, course: courseId })
                    });

                    if (response.status === 401) {
                        window.location.href = 'login.html';
                        return;
                    }
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }

                    alert('Evaluación actualizada exitosamente.');
                    hideEditAssessmentModal();
                    // Re-populate assessments for the current course
                    populateAssessments(courseSelect.value);
                } catch (error) {
                    console.error('Error updating assessment:', error);
                    alert('Error al actualizar la evaluación.');
                }
            });

            // Event listeners for assessment management buttons
            document.getElementById('add-assessment-button').addEventListener('click', showAddAssessmentModal);

            document.getElementById('edit-assessment-button').addEventListener('click', showEditAssessmentModal);

            document.getElementById('delete-assessment-button').addEventListener('click', async () => {
                const assessmentId = assessmentSelect.value;
                if (!assessmentId) {
                    alert('Por favor, seleccione una evaluación para eliminar.');
                    return;
                }

                if (!confirm('¿Está seguro de que desea eliminar esta evaluación? Esta acción no se puede deshacer.')) {
                    return;
                }

                try {
                    const token = getCookie('authToken');
                    if (!token) {
                        window.location.href = 'login.html';
                        return;
                    }
                    const response = await fetch(`/api/assessments/${assessmentId}`, {
                        method: 'DELETE',
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

                    alert('Evaluación eliminada exitosamente.');
                    // Re-populate assessments for the current course
                    populateAssessments(courseSelect.value);
                    // Clear gradebook if the deleted assessment was selected
                    renderGradebook(courseSelect.value, assessmentSelect.value);
                } catch (error) {
                    console.error('Error deleting assessment:', error);
                    alert('Error al eliminar la evaluación.');
                }
            });

            // --- Student Administration Modal --- 

            const adminStudentsModal = document.getElementById('admin-students-modal');
            const adminStudentsButton = document.getElementById('admin-students-button');
            const closeButton = adminStudentsModal.querySelector('.close-button');
            const studentsList = document.getElementById('students-list');
            const addStudentForm = document.getElementById('add-student-form');
            const studentNameInput = document.getElementById('student-name-input');
            let selectedClassId = '';

            // Open the modal to manage students
            adminStudentsButton.addEventListener('click', async () => {
                selectedClassId = courseSelect.value;
                if (!selectedClassId) {
                    alert('Por favor, seleccione una clase primero.');
                    return;
                }
                await openStudentModal(selectedClassId);
            });

            // Close the modal
            closeButton.addEventListener('click', () => {
                adminStudentsModal.style.display = 'none';
            });

            window.addEventListener('click', (event) => {
                if (event.target == adminStudentsModal) {
                    adminStudentsModal.style.display = 'none';
                }
            });

            async function openStudentModal(classId) {
                try {
                    const response = await fetch(`/api/classes/${classId}/students`);
                    if (response.ok) {
                        const students = await response.json();
                        renderStudentList(students);
                        if (adminStudentsModal) adminStudentsModal.style.display = 'block';
                    } else {
                        console.error('Error al cargar los alumnos.');
                    }
                } catch (error) {
                    console.error('Error en la solicitudeparaget alumnos:', error);
                }
            }

            function renderStudentList(students) {
                if (!studentsList) return;
                studentsList.innerHTML = '';
                students.forEach(student => {
                    const li = document.createElement('li');
                    li.dataset.studentId = student._id;

                    const studentNameSpan = document.createElement('span');
                    studentNameSpan.textContent = student.name;

                    const deleteBtn = document.createElement('button');
                    deleteBtn.textContent = 'Eliminar';
                    deleteBtn.classList.add('btn', 'btn-danger', 'btn-small', 'delete-student-btn');
                    deleteBtn.addEventListener('click', () => removeStudent(student._id));

                    li.appendChild(studentNameSpan);
                    li.appendChild(deleteBtn);
                    studentsList.appendChild(li);
                });
            }

            if (addStudentForm) {
                addStudentForm.addEventListener('submit', async (event) => {
                    event.preventDefault();
                    const newStudentName = studentNameInput.value.trim();
                    if (newStudentName && selectedClassId) {
                        await addStudent(selectedClassId, newStudentName);
                        studentNameInput.value = '';
                    }
                });
            }

            async function addStudent(classId, studentName) {
                try {
                    const response = await fetch(`/api/classes/${classId}/students`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ name: studentName })
                    });

                    if (response.ok) {
                        const updatedStudents = await response.json();
                        renderStudentList(updatedStudents);
                        renderGradebook(classId, assessmentSelect.value);
                    } else {
                        console.error('Error al agregar el alumno.');
                    }
                } catch (error) {
                    console.error('Error en la solicitudeparaagregar alumno:', error);
                }
            }

            async function removeStudent(studentId) {
                if (!selectedClassId) return;
                try {
                    const response = await fetch(`/api/classes/${selectedClassId}/students/${studentId}`, {
                        method: 'DELETE'
                    });

                    if (response.ok) {
                        const updatedStudents = await response.json();
                        renderStudentList(updatedStudents);
                        renderGradebook(selectedClassId, assessmentSelect.value);
                    } else {
                        console.error('Error al eliminar el alumno.');
                    }
                } catch (error) {
                    console.error('Error en la solicitudepara eliminar alumno:', error);
                }
            }

            // Initial population
            populateCourses();
        
});

