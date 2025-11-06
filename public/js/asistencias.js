document.addEventListener('DOMContentLoaded', async () => {
    const classSelectAttendance = document.getElementById('class-select-attendance');
    const attendanceGrid = document.getElementById('attendance-grid');
    const saveAttendanceButton = document.getElementById('save-attendance-button');

    let classes = [];
    let studentsInClass = [];
    let attendanceRecords = {}; // Stores attendance by studentId -> sessionStartTime -> status
    let selectedClassId = '';
    let activeSessions = []; // Tracks all active sessions (existing + new)

    // Function to get cookie value (reused from app.js)
    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    }

    // Function to fetch data from the API
    async function fetchData(url) {
        const token = getCookie('authToken');
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
                    option.textContent = `${cls.subjectName} - ${cls.courseGroup} (${cls.startTime})`; // Use subjectName, courseGroup, and startTime
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

            if (studentsInClass.length === 0) {
                attendanceGrid.innerHTML = '<p>No hay alumnos en esta clase.</p>';
                return;
            }

            // Create table with dynamic columns
            const table = document.createElement('table');
            table.classList.add('attendance-table');
            // Build table headers
            const headerCells = ['Alumno', ...activeSessions.map((session, idx) => `Clase ${idx + 1} (${session.startTime.substring(0, 5)})`)];
            table.innerHTML = `
                <thead>
                    <tr>${headerCells.map(cell => `<th>${cell}</th>`).join('')}</tr>
                </thead>
                <tbody>
                </tbody>
            `;
            const tbody = table.querySelector('tbody');

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

            attendanceGrid.appendChild(table);
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
            const token = getCookie('authToken');
            if (!token) {
                window.location.href = 'login.html';
                return;
            }
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
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
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

    // Initial population
    populateClassesForAttendance();
});