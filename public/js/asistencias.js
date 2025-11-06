document.addEventListener('DOMContentLoaded', async () => {
    const classSelectAttendance = document.getElementById('class-select-attendance');
    const attendanceDate = document.getElementById('attendance-date');
    const attendanceGrid = document.getElementById('attendance-grid');
    const saveAttendanceButton = document.getElementById('save-attendance-button');
    const adminStudentsButton = document.getElementById('admin-students-button');
    const adminStudentsModal = document.getElementById('admin-students-modal');
    const closeButton = document.querySelector('.close-button');
    const studentsList = document.getElementById('students-list');
    const addStudentForm = document.getElementById('add-student-form');
    const studentNameInput = document.getElementById('student-name-input');

    let classes = [];
    let currentStudents = [];
    let studentsInClass = [];
    let attendanceRecords = {}; // Stores attendance by studentId -> sessionStartTime -> status
    let selectedClassId = '';
    let activeSessions = []; // Tracks all active sessions (existing + new)

    // Function to fetch data from the API
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

    // Populate class dropdown for attendance
    async function populateClassesForAttendance() {
        try {
            // Assuming an endpoint to get classes scheduled for today for the teacher
            classes = await fetchData('/api/attendance/scheduled-classes'); 
            classSelectAttendance.innerHTML = '<option value="">Seleccione una clase</option>';
            if (Array.isArray(classes)) {
                classes.forEach(cls => {
                    const option = document.createElement('option');
                    option.value = cls._id;
                    option.textContent = `${cls.subjectName} - ${cls.courseGroup}`;
                    classSelectAttendance.appendChild(option);
                });
            }
        } catch (error) {
            console.error('Error fetching classes for attendance:', error);
            alert('Error al cargar las clases.');
        }
    }

    // Render attendance grid
    async function renderAttendanceGrid(classId) {
        console.log('renderAttendanceGrid called with classId:', classId, 'and activeSessions:', activeSessions); // Modified debug log
        attendanceGrid.innerHTML = '';
        saveAttendanceButton.style.display = 'none';
        if (!classId) {
            return;
        }

        try {
            // Fetch students for the selected class
            const classDetails = await fetchData(`/api/classes/${classId}`);
            studentsInClass = classDetails.students;

            // Initialize attendance records structure
            attendanceRecords = studentsInClass.reduce((acc, student) => {
                acc[student._id] = activeSessions.reduce((sessionAcc, session) => {
                    sessionAcc[session.startTime] = session.attendance[student._id] || 'present';
                    return sessionAcc;
                }, {});
                return acc;
            }, {});

            // Create table with dynamic columns
            const table = document.createElement('table');
            table.classList.add('attendance-table');
            // Build table headers
            const headerCells = ['Alumno', ...activeSessions.map((session, idx) => `Clase ${idx + 1}`)];
            table.innerHTML = `
                <thead>
                    <tr>${headerCells.map(cell => `<th>${cell}</th>`).join('')}</tr>
                </thead>
                <tbody>
                </tbody>
            `;
            const tbody = table.querySelector('tbody');

            if (studentsInClass.length === 0) {
                const tr = document.createElement('tr');
                const td = document.createElement('td');
                td.textContent = 'No hay alumnos en esta clase.';
                td.colSpan = headerCells.length;
                td.style.textAlign = 'center';
                tr.appendChild(td);
                tbody.appendChild(tr);
            } else {
                // Add student rows with dynamic status selects
                studentsInClass.forEach(student => {
                    const tr = document.createElement('tr');
                    const sessionCells = activeSessions.map(session => {
                        const currentStatus = attendanceRecords[student._id][session.startTime];
                        return `
                            <td>
                                <select class="attendance-status-select" data-student-id="${student._id}" data-session-time="${session.startTime}">
                                    <option value="present" ${currentStatus === 'present' ? 'selected' : ''}>Presente</option>
                                    <option value="absent" ${currentStatus === 'absent' ? 'selected' : ''}>Ausente</option>
                                    <option value="late" ${currentStatus === 'late' ? 'selected' : ''}>Tardanza</option>
                                </select>
                            </td>
                        `;
                    });
                    tr.innerHTML = `<td>${student.name}</td>${sessionCells.join('')}`;
                    tbody.appendChild(tr);
                });

                saveAttendanceButton.style.display = 'block';

                // Add event listener for status changes
                table.querySelectorAll('.attendance-status-select').forEach(select => {
                    select.addEventListener('change', (event) => {
                        const studentId = event.target.dataset.studentId;
                        const sessionTime = event.target.dataset.sessionTime;
                        const status = event.target.value;
                        attendanceRecords[studentId][sessionTime] = status;
                    });
                });
            }

            attendanceGrid.appendChild(table);

        } catch (error) {
            console.error('Error rendering attendance grid:', error);
            alert('Error al cargar la planilla de asistencia.');
        }
    }

    // Event listener for class dropdown change
    classSelectAttendance.addEventListener('change', async () => {
        selectedClassId = classSelectAttendance.value;
        if (selectedClassId) {
            try {
                const today = new Date().toISOString().split('T')[0];
                const allAttendanceRecords = await fetchData(`/api/attendance/${selectedClassId}/${today}`);

                // Populate activeSessions with fetched records
                activeSessions = allAttendanceRecords.length > 0
                    ? allAttendanceRecords.map(record => ({
                        startTime: record.startTime,
                        attendance: record.records.reduce((acc, rec) => { acc[rec.studentId] = rec.status; return acc; }, {})
                    }))
                    : [{ startTime: '00:00:00', attendance: {} }]; // Default session if no records

                console.log('activeSessions after class selection:', activeSessions); // New debug log
                renderAttendanceGrid(selectedClassId);
            } catch (error) {
                console.error('Error fetching initial attendance records:', error);
                alert('Error al cargar los registros de asistencia iniciales.');
            }
        } else {
            // Clear grid if no class is selected
            attendanceGrid.innerHTML = '';
            saveAttendanceButton.style.display = 'none';
            activeSessions = []; // Clear active sessions
        }
    });

    // Save attendance button click handler
    saveAttendanceButton.addEventListener('click', async () => {
        if (!selectedClassId) {
            alert('Por favor, seleccione una clase.');
            return;
        }

        try {
            const today = new Date().toISOString().split('T')[0];

            // Iterate through active sessions and save attendance for each
            for (const session of activeSessions) {
                const attendanceToSave = studentsInClass.map(student => ({
                    studentId: student._id,
                    status: attendanceRecords[student._id][session.startTime]
                }));

                const response = await fetch(`/api/attendance`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ classId: selectedClassId, date: today, startTime: session.startTime, records: attendanceToSave })
                });

                if (response.status === 401) {
                    window.location.href = 'login.html';
                    return;
                }
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
            }

            alert('Asistencia guardada exitosamente.');

            // Re-fetch attendance data to ensure the UI is up-to-date
            const allAttendanceRecords = await fetchData(`/api/attendance/${selectedClassId}/${today}`);
            activeSessions = allAttendanceRecords.length > 0
                ? allAttendanceRecords.map(record => ({
                    startTime: record.startTime,
                    attendance: record.records.reduce((acc, rec) => { acc[rec.studentId] = rec.status; return acc; }, {})
                }))
                : [{ startTime: '00:00:00', attendance: {} }];

            renderAttendanceGrid(selectedClassId);
        } catch (error) {
            console.error('Error saving attendance:', error);
            alert('Error al guardar la asistencia.');
        }
    });

    // Event listener for the "Add Session" button
    document.getElementById('add-session-button').addEventListener('click', () => {
        if (selectedClassId) {
            const newSessionStartTime = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            console.log('Before adding session, activeSessions:', activeSessions); // Debug log
            // Check if a session with the exact same start time already exists
            if (!activeSessions.some(session => session.startTime === newSessionStartTime)) {
                activeSessions.push({ startTime: newSessionStartTime, attendance: {} });
                console.log('After adding session, activeSessions:', activeSessions); // Debug log
                console.log('Calling renderAttendanceGrid with selectedClassId:', selectedClassId); // New debug log
                renderAttendanceGrid(selectedClassId);
            } else {
                alert('Ya existe una sesión con esta hora de inicio.');
            }
        } else {
            alert('Por favor, seleccione una clase primero.');
        }
    });

    // Event listener for the "Delete Session" button
    document.getElementById('delete-session-button').addEventListener('click', () => {
        if (selectedClassId) {
            if (activeSessions.length > 1) {
                activeSessions.pop();
                renderAttendanceGrid(selectedClassId);
            } else {
                alert('No se puede eliminar la última sesión.');
            }
        } else {
            alert('Por favor, seleccione una clase primero.');
        }
    });

    // --- Student Administration Modal --- 

    // Open the modal to manage students
    adminStudentsButton.addEventListener('click', async () => {
        selectedClassId = classSelectAttendance.value;
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
            console.error('Error en la solicitud de alumnos:', error);
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
            } else {
                console.error('Error al agregar el alumno.');
            }
        } catch (error) {
            console.error('Error en la solicitud para agregar alumno:', error);
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
            } else {
                console.error('Error al eliminar el alumno.');
            }
        } catch (error) {
            console.error('Error en la solicitud para eliminar alumno:', error);
        }
    }

    // Initial load
    populateClassesForAttendance();
});