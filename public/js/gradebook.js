document.addEventListener('DOMContentLoaded', async () => {
    // Main elements
    const courseSelect = document.getElementById('course-select');
    const gradebookGrid = document.getElementById('gradebook-grid');
    const saveGradesButton = document.getElementById('save-grades-button');

    // Add Assessment Modal
    const addAssessmentModal = document.getElementById('add-assessment-modal');
    const closeAssessmentModalButton = addAssessmentModal.querySelector('.close-button');
    const addAssessmentForm = document.getElementById('add-assessment-form');
    const newAssessmentNameInput = document.getElementById('new-assessment-name');
    const newAssessmentCourseSelect = document.getElementById('new-assessment-course');

    // Edit Assessment Modal
    const editAssessmentModal = document.getElementById('edit-assessment-modal');
    const closeEditAssessmentModalButton = editAssessmentModal.querySelector('.close-button');
    const editAssessmentForm = document.getElementById('edit-assessment-form');
    const editAssessmentIdInput = document.getElementById('edit-assessment-id');
    const editAssessmentNameInput = document.getElementById('edit-assessment-name');
    const editAssessmentCourseSelect = document.getElementById('edit-assessment-course');

    // Add Calculated Assessment Modal
    const addCalculatedAssessmentModal = document.getElementById('add-calculated-assessment-modal');
    const addCalculatedAssessmentButton = document.getElementById('add-calculated-assessment-button');
    const closeCalculatedAssessmentModalButton = addCalculatedAssessmentModal.querySelector('.close-button');
    const addCalculatedAssessmentForm = document.getElementById('add-calculated-assessment-form');
    const calculatedAssessmentNameInput = document.getElementById('calculated-assessment-name');
    const calculatedAssessmentCourseSelect = document.getElementById('calculated-assessment-course');
    const calculationAssessmentsContainer = document.getElementById('calculation-assessments-container');
    const totalWeightSpan = document.getElementById('total-weight');
    const saveCalculatedAssessmentButton = document.getElementById('save-calculated-assessment-button');

    // Edit Calculated Assessment Modal
    const editCalculatedAssessmentModal = document.getElementById('edit-calculated-assessment-modal');
    const closeEditCalculatedModalButton = editCalculatedAssessmentModal.querySelector('.close-button');
    const editCalculatedAssessmentForm = document.getElementById('edit-calculated-assessment-form');
    const editCalculatedAssessmentIdInput = document.getElementById('edit-calculated-assessment-id');
    const editCalculatedAssessmentNameInput = document.getElementById('edit-calculated-assessment-name');
    const editCalculationAssessmentsContainer = document.getElementById('edit-calculation-assessments-container');
    const editTotalWeightSpan = document.getElementById('edit-total-weight');
    const updateCalculatedAssessmentButton = document.getElementById('update-calculated-assessment-button');

    // Student Administration Modal
    const adminStudentsModal = document.getElementById('admin-students-modal');
    const adminStudentsButton = document.getElementById('admin-students-button');
    const closeStudentModalButton = adminStudentsModal.querySelector('.close-button');
    const studentsList = document.getElementById('students-list');
    const addStudentForm = document.getElementById('add-student-form');
    const studentNameInput = document.getElementById('student-name-input');

    // Dashboard elements


    let courses = [];
    let assessments = [];
    let students = [];
    let grades = {};
    let selectedClassId = '';

    // --- Data Fetching ---
    async function fetchData(url, options = {}) {
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

    // --- Gradebook Rendering ---
    async function renderGradebook(courseId) {
        console.log('Rendering gradebook for courseId:', courseId);
        gradebookGrid.innerHTML = '';
        saveGradesButton.style.display = 'none';
        if (!courseId) return;

        try {
            console.log('Fetching students from:', `/api/classes/${courseId}/students`);
            students = await fetchData(`/api/classes/${courseId}/students`);
            
            console.log('Fetching assessments from:', `/api/assessments/course/${courseId}`);
            const courseAssessments = await fetchData(`/api/assessments/course/${courseId}`);

            if (students.length === 0) {
                gradebookGrid.innerHTML = '<p>No hay alumnos en este curso.</p>';
                return;
            }

            const regularAssessments = courseAssessments.filter(a => !a.isCalculated);
            const calculatedAssessments = courseAssessments.filter(a => a.isCalculated);

            const table = document.createElement('table');
            table.classList.add('gradebook-table');
            const thead = table.createTHead();
            const tbody = table.createTBody();

            // Header
            const headerRow = thead.insertRow();
            headerRow.innerHTML = '<th>Alumno</th>';
            regularAssessments.forEach(a => {
                const th = document.createElement('th');
                th.classList.add('calculated-assessment-header');
                th.innerHTML = `
                    <div>${a.name}</div>
                    <div class="button-group-small">
                        <button class="btn btn-primary btn-small edit-assessment-btn" data-id="${a._id}"><i class="fas fa-edit"></i></button>
                        <button class="btn btn-danger btn-small delete-assessment-btn" data-id="${a._id}"><i class="fas fa-trash"></i></button>
                    </div>
                `;
                headerRow.appendChild(th);
            });
            calculatedAssessments.forEach(a => {
                const th = document.createElement('th');
                th.innerHTML = `
                    <div>${a.name} (Calculada)</div>
                    <div class="button-group-small">
                        <button class="btn btn-primary btn-small edit-calculated-assessment-btn" data-id="${a._id}"><i class="fas fa-edit"></i></button>
                        <button class="btn btn-danger btn-small delete-assessment-btn" data-id="${a._id}"><i class="fas fa-trash"></i></button>
                    </div>
                `;
                headerRow.appendChild(th);
            });

            // Body
            console.log('Fetching grades from:', `/api/grades/course/${courseId}`);
            grades = await fetchData(`/api/grades/course/${courseId}`);

            for (const student of students) {
                const row = tbody.insertRow();
                row.innerHTML = `<td>${student.name}</td>`;

                // Regular assessments
                for (const assessment of regularAssessments) {
                    const gradeObj = grades.find(g => g.student.toString() === student._id.toString() && g.assessment.toString() === assessment._id.toString());
                    const grade = gradeObj && gradeObj.grade !== null ? gradeObj.grade : '';
                    row.innerHTML += `<td><input type="number" class="grade-input" data-student-id="${student._id}" data-assessment-id="${assessment._id}" value="${grade}"></td>`;
                }

                // Calculated assessments
                for (const assessment of calculatedAssessments) {
                    let calculatedGrade = 0;
                    let totalWeight = 0;

                    assessment.calculationFormula.forEach(component => {
                        const componentGradeObj = grades.find(g => g.student.toString() === student._id.toString() && g.assessment.toString() === component.assessment.toString());
                        if (componentGradeObj && componentGradeObj.grade != null) {
                            calculatedGrade += (componentGradeObj.grade * component.weight) / 100;
                            totalWeight += component.weight;
                        }
                    });

                    let gradeDisplay = 'N/A';
                    if (totalWeight > 0) {
                        const finalGrade = (calculatedGrade / totalWeight) * 100;
                        gradeDisplay = finalGrade.toFixed(2);
                    }

                    row.innerHTML += `<td><input type="text" class="grade-input" value="${gradeDisplay}" disabled></td>`;
                }
            }

            gradebookGrid.appendChild(table);
            saveGradesButton.style.display = 'block';

            // Add event listeners for the new buttons
            document.querySelectorAll('.edit-assessment-btn').forEach(button => {
                button.addEventListener('click', (e) => {
                    const assessmentId = e.currentTarget.dataset.id;
                    openEditAssessmentModal(assessmentId);
                });
            });

            document.querySelectorAll('.delete-assessment-btn').forEach(button => {
                button.addEventListener('click', (e) => {
                    const assessmentId = e.currentTarget.dataset.id;
                    handleDeleteAssessment(assessmentId);
                });
            });

            document.querySelectorAll('.edit-calculated-assessment-btn').forEach(button => {
                button.addEventListener('click', (e) => {
                    const assessmentId = e.currentTarget.dataset.id;
                    openEditCalculatedAssessmentModal(assessmentId);
                });
            });

        } catch (error) {
            console.error('Error rendering gradebook:', error);
            showModal('Error al cargar la planilla de calificaciones.');
        }
    }

    // --- Add/Edit/Delete Assessment ---
    document.getElementById('add-assessment-button').addEventListener('click', () => {
        addAssessmentModal.style.display = 'block';
        newAssessmentCourseSelect.innerHTML = courseSelect.innerHTML;
    });

    async function handleDeleteAssessment(assessmentId) {
        if (!confirm('¿Está seguro de que desea eliminar esta evaluación? Esta acción no se puede deshacer.')) return;

        try {
            await fetchData(`/api/assessments/${assessmentId}`, { method: 'DELETE' });
            showModal('Evaluación eliminada exitosamente.');
            renderGradebook(courseSelect.value);
        } catch (error) {
            console.error('Error deleting assessment:', error);
            showModal(`Error al eliminar la evaluación: ${error.message}`);
        }
    }

    async function openEditAssessmentModal(assessmentId) {
        const assessment = assessments.find(a => a._id === assessmentId);
        if (!assessment) {
            showModal('Evaluación no encontrada.');
            return;
        }

        editAssessmentIdInput.value = assessment._id;
        editAssessmentNameInput.value = assessment.name;
        editAssessmentCourseSelect.innerHTML = courseSelect.innerHTML;
        editAssessmentCourseSelect.value = assessment.course;
        editAssessmentModal.style.display = 'block';
    }

    async function openEditCalculatedAssessmentModal(assessmentId) {
        const assessment = assessments.find(a => a._id === assessmentId);
        if (!assessment) {
            showModal('Evaluación no encontrada.');
            return;
        }

        editCalculatedAssessmentIdInput.value = assessment._id;
        editCalculatedAssessmentNameInput.value = assessment.name;

        const courseId = courseSelect.value;
        const courseAssessments = assessments.filter(a => a.course === courseId && !a.isCalculated && a._id !== assessment._id);

        editCalculationAssessmentsContainer.innerHTML = '';
        courseAssessments.forEach(a => {
            const component = assessment.calculationFormula.find(c => c.assessment.toString() === a._id.toString());
            const weight = component ? component.weight : 0;

            const assessmentEl = document.createElement('div');
            assessmentEl.classList.add('form-group');
            assessmentEl.innerHTML = `
                <input type="checkbox" id="edit-comp-${a._id}" data-id="${a._id}" ${component ? 'checked' : ''}>
                <label for="edit-comp-${a._id}">${a.name}</label>
                <input type="number" class="weight-input" min="0" max="100" value="${weight}" ${!component ? 'disabled' : ''}>
            `;
            editCalculationAssessmentsContainer.appendChild(assessmentEl);
        });

        updateEditTotalWeight();
        editCalculatedAssessmentModal.style.display = 'block';
    }



    saveGradesButton.addEventListener('click', async () => {
        const courseId = courseSelect.value;
        if (!courseId) {
            showModal('Por favor, seleccione un curso.');
            return;
        }

        const gradesToSave = Array.from(document.querySelectorAll('.grade-input:not([disabled])'))
            .map(input => ({
                student: input.dataset.studentId,
                assessment: input.dataset.assessmentId,
                grade: input.value,
                course: courseId
            }));

        try {
            await fetchData('/api/grades', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ grades: gradesToSave })
            });
            showModal('Calificaciones guardadas exitosamente.');
            renderGradebook(courseId);
        } catch (error) {
            console.error('Error saving grades:', error);
            showModal('Error al guardar las calificaciones.');
        }
    });

    // --- Initial Data Population ---
    async function populateCourses() {
        try {
            courses = await fetchData('/api/classes');
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
            showModal('Error al cargar los cursos.');
        }
    }

    // --- Event Listeners ---
    courseSelect.addEventListener('change', () => {
        const courseId = courseSelect.value;
        renderGradebook(courseId);
    });

        // --- Modal Handling ---
        function setupModal(modal, closeButton) {
            closeButton.addEventListener('click', () => { modal.style.display = 'none'; });
            window.addEventListener('click', (event) => {
                if (event.target === modal) {
                    modal.style.display = 'none';
                }
            });
        }

        setupModal(addAssessmentModal, closeAssessmentModalButton);
        setupModal(editAssessmentModal, closeEditAssessmentModalButton);
        setupModal(addCalculatedAssessmentModal, closeCalculatedAssessmentModalButton);
        setupModal(editCalculatedAssessmentModal, closeEditCalculatedModalButton);
        setupModal(adminStudentsModal, closeStudentModalButton);

        // --- Form Submissions ---
        addAssessmentForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const name = newAssessmentNameInput.value;
            const course = newAssessmentCourseSelect.value;
            if (!name || !course) {
                showModal('Por favor, complete todos los campos.');
                return;
            }

            try {
                await fetchData('/api/assessments', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, course })
                });
                showModal('Evaluación añadida exitosamente.');
                addAssessmentModal.style.display = 'none';
                addAssessmentForm.reset();
                renderGradebook(courseSelect.value);
            } catch (error) {
                console.error('Error adding assessment:', error);
                showModal('Error al añadir la evaluación.');
            }
        });

        editAssessmentForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const id = editAssessmentIdInput.value;
            const name = editAssessmentNameInput.value;
            const course = editAssessmentCourseSelect.value;
            if (!name || !course) {
                showModal('Por favor, complete todos los campos.');
                return;
            }

            try {
                await fetchData(`/api/assessments/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, course })
                });
                showModal('Evaluación actualizada exitosamente.');
                editAssessmentModal.style.display = 'none';
                editAssessmentForm.reset();
                renderGradebook(courseSelect.value);
            } catch (error) {
                console.error('Error updating assessment:', error);
                showModal('Error al actualizar la evaluación.');
            }
        });

        // --- Calculated Assessment Logic ---
        addCalculatedAssessmentButton.addEventListener('click', () => {
            addCalculatedAssessmentModal.style.display = 'block';
            calculatedAssessmentCourseSelect.innerHTML = courseSelect.innerHTML;
        });

        calculatedAssessmentCourseSelect.addEventListener('change', async () => {
            const courseId = calculatedAssessmentCourseSelect.value;
            calculationAssessmentsContainer.innerHTML = '';
            if (!courseId) return;

            try {
                const courseAssessments = await fetchData(`/api/assessments/course/${courseId}`);
                courseAssessments.forEach(assessment => {
                    if (!assessment.isCalculated) {
                        const div = document.createElement('div');
                        div.classList.add('form-group');
                        div.innerHTML = `
                            <input type="checkbox" id="assessment-${assessment._id}" data-id="${assessment._id}" name="assessments">
                            <label for="assessment-${assessment._id}">${assessment.name}</label>
                            <input type="number" class="weight-input" min="0" max="100" disabled>
                        `;
                        calculationAssessmentsContainer.appendChild(div);
                    }
                });
            } catch (error) {
                console.error('Error fetching assessments for calculation:', error);
            }
        });

        function updateTotalWeight(container, span, button) {
            let totalWeight = 0;
            const weightInputs = container.querySelectorAll('.weight-input');
            weightInputs.forEach(input => {
                if (!input.disabled) {
                    totalWeight += Number(input.value) || 0;
                }
            });
            span.textContent = totalWeight;
            if (button) button.disabled = totalWeight !== 100;
        }

        calculationAssessmentsContainer.addEventListener('change', (event) => {
            if (event.target.type === 'checkbox') {
                const weightInput = event.target.closest('.form-group').querySelector('.weight-input');
                weightInput.disabled = !event.target.checked;
                if (!event.target.checked) weightInput.value = '';
            }
            updateTotalWeight(calculationAssessmentsContainer, totalWeightSpan, saveCalculatedAssessmentButton);
        });
        calculationAssessmentsContainer.addEventListener('input', () => updateTotalWeight(calculationAssessmentsContainer, totalWeightSpan, saveCalculatedAssessmentButton));

        addCalculatedAssessmentForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const name = calculatedAssessmentNameInput.value;
            const course = calculatedAssessmentCourseSelect.value;
            const calculationFormula = [];
            const checkedAssessments = calculationAssessmentsContainer.querySelectorAll('input[type="checkbox"]:checked');

            checkedAssessments.forEach(checkbox => {
                const assessmentId = checkbox.dataset.id;
                const weight = Number(checkbox.closest('.form-group').querySelector('.weight-input').value);
                calculationFormula.push({ assessment: assessmentId, weight });
            });

            if (!name || !course || calculationFormula.length === 0) {
                showModal('Por favor, complete todos los campos y seleccione al menos una evaluación.');
                return;
            }
            if (parseInt(totalWeightSpan.textContent) !== 100) {
                showModal('La suma de las ponderaciones debe ser 100%.');
                return;
            }

            try {
                await fetchData('/api/assessments', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, course, isCalculated: true, calculationFormula })
                });
                showModal('Planilla calculada creada exitosamente.');
                addCalculatedAssessmentModal.style.display = 'none';
                addCalculatedAssessmentForm.reset();
                populateAssessments(courseSelect.value);
            } catch (error) {
                console.error('Error creating calculated assessment:', error);
                showModal('Error al crear la planilla calculada.');
            }
        });

        // --- Edit Calculated Assessment Logic ---
        function updateEditTotalWeight() {
            updateTotalWeight(editCalculationAssessmentsContainer, editTotalWeightSpan, updateCalculatedAssessmentButton);
        }

        editCalculationAssessmentsContainer.addEventListener('change', (event) => {
            if (event.target.type === 'checkbox') {
                const weightInput = event.target.closest('.form-group').querySelector('.weight-input');
                weightInput.disabled = !event.target.checked;
                if (!event.target.checked) weightInput.value = 0;
            }
            updateEditTotalWeight();
        });
        editCalculationAssessmentsContainer.addEventListener('input', updateEditTotalWeight);

        editCalculatedAssessmentForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const assessmentId = editCalculatedAssessmentIdInput.value;
            const name = editCalculatedAssessmentNameInput.value;
            const calculationFormula = [];
            const assessmentElements = editCalculationAssessmentsContainer.querySelectorAll('input[type="checkbox"]:checked');

            assessmentElements.forEach(el => {
                const weightInput = el.closest('.form-group').querySelector('.weight-input');
                calculationFormula.push({
                    assessment: el.dataset.id,
                    weight: parseInt(weightInput.value)
                });
            });

            if (parseInt(editTotalWeightSpan.textContent) !== 100) {
                showModal('La suma de las ponderaciones debe ser 100%.');
                return;
            }

            try {
                await fetchData(`/api/assessments/${assessmentId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, calculationFormula, isCalculated: true })
                });
                editCalculatedAssessmentModal.style.display = 'none';
                await populateAssessments(courseSelect.value);
                await renderGradebook(courseSelect.value, assessmentId);
            } catch (error) {
                console.error('Error al actualizar la planilla calculada:', error);
                showModal('Error al actualizar la planilla calculada.');
            }
        });

        // --- Student Administration ---
        adminStudentsButton.addEventListener('click', async () => {
            selectedClassId = courseSelect.value;
            if (!selectedClassId) {
                showModal('Por favor, seleccione una clase primero.');
                return;
            }
            
            try {
                const students = await fetchData(`/api/classes/${selectedClassId}/students`);
                renderStudentList(students);
                adminStudentsModal.style.display = 'block';
            } catch (error) {
                console.error('Error al cargar los alumnos:', error);
            }
        });

        function renderStudentList(students) {
            studentsList.innerHTML = '';
            students.forEach(student => {
                const li = document.createElement('li');
                li.dataset.studentId = student._id;
                li.innerHTML = `<span>${student.name}</span><button class="btn btn-danger btn-small delete-student-btn">Eliminar</button>`;
                li.querySelector('.delete-student-btn').addEventListener('click', () => removeStudent(student._id));
                studentsList.appendChild(li);
            });
        }

        addStudentForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const newStudentName = studentNameInput.value.trim();
            if (newStudentName && selectedClassId) {
                await addStudent(selectedClassId, newStudentName);
                studentNameInput.value = '';
            }
        });

        async function addStudent(classId, studentName) {
            try {
                const updatedStudents = await fetchData(`/api/classes/${classId}/students`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: studentName })
                });
                renderStudentList(updatedStudents);
                renderGradebook(classId, assessmentSelect.value);
            } catch (error) {
                console.error('Error al agregar el alumno:', error);
            }
        }

        async function removeStudent(studentId) {
            if (!selectedClassId) return;
            try {
                const updatedStudents = await fetchData(`/api/classes/${selectedClassId}/students/${studentId}`, { method: 'DELETE' });
                renderStudentList(updatedStudents);
                renderGradebook(selectedClassId, assessmentSelect.value);
            } catch (error) {
                console.error('Error al eliminar el alumno:', error);
            }
        }

        // --- Initial Load ---
        await populateCourses();
    });