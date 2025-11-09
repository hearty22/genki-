document.addEventListener('DOMContentLoaded', async () => {
    const reportTypeSelect = document.getElementById('report-type');
    const reportFormatSelect = document.getElementById('report-format');
    const generateReportButton = document.getElementById('generate-report-button');
    const courseSelectContainer = document.getElementById('course-select-container');
    const assessmentSelectContainer = document.getElementById('assessment-select-container');

    let courses = [];
    let assessments = [];

    // Function to fetch courses
    async function fetchCourses() {
        try {
            const authToken = getCookie('authToken');
            if (!authToken) {
                console.error('No authentication token found.');
                return [];
            }
            const response = await fetch('/api/classes', {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });
            if (response.status === 401) {
                window.location.href = '/login';
                return [];
            }
            if (response.status === 401) {
                window.location.href = '/login';
                return [];
            }
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching courses:', error);
            return [];
        }
    }

    // Function to fetch assessments for a given course
    async function fetchAssessments(courseId) {
        try {
            const authToken = getCookie('authToken');
            if (!authToken) {
                console.error('No authentication token found.');
                return [];
            }
            const response = await fetch(`/api/assessments/course/${courseId}`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching assessments:', error);
            return [];
        }
    }

    // Populate course dropdown
    async function populateCourses() {
        courses = await fetchCourses();
        const courseSelect = document.createElement('select');
        courseSelect.id = 'course-select';
        courseSelect.className = 'form-control';
        courseSelect.innerHTML = '<option value="">Seleccione un curso</option>';
        courses.forEach(course => {
            const option = document.createElement('option');
            option.value = course._id;
            option.textContent = `${course.subjectName} - ${course.courseGroup}`;
            courseSelect.appendChild(option);
        });
        courseSelectContainer.innerHTML = '';
        courseSelectContainer.appendChild(courseSelect);

        courseSelect.addEventListener('change', async () => {
            const selectedCourseId = courseSelect.value;
            if (selectedCourseId) {
                populateReportTypes(selectedCourseId);
            } else {
                reportTypeSelect.innerHTML = '<option value="">Seleccione un tipo de reporte</option>';
                assessmentSelectContainer.innerHTML = '';
            }
        });
    }

    // Populate report type dropdown
    function populateReportTypes(courseId) {
        reportTypeSelect.innerHTML = '<option value="">Seleccione un tipo de reporte</option>';
        const reportTypes = [
            { value: 'attendance', text: 'Asistencia' },
            { value: 'grades', text: 'Calificaciones' }
        ];

        reportTypes.forEach(reportType => {
            const option = document.createElement('option');
            option.value = reportType.value;
            option.textContent = reportType.text;
            reportTypeSelect.appendChild(option);
        });

        reportTypeSelect.addEventListener('change', () => {
            const selectedReportType = reportTypeSelect.value;
            if (selectedReportType === 'grades') {
                assessmentSelectContainer.innerHTML = '';
            } 
        });
    }

    // Initial population
    populateCourses();

    generateReportButton.addEventListener('click', () => {
        const selectedReportType = reportTypeSelect.value;
        const selectedReportFormat = reportFormatSelect.value;
        const selectedCourseId = document.getElementById('course-select') ? document.getElementById('course-select').value : '';

        let url = '';
        if (selectedReportType === 'attendance') {
            url = `/api/reports/attendance/${selectedReportFormat}?courseId=${selectedCourseId}`;
        } else if (selectedReportType === 'grades') {
            url = `/api/reports/grades/${selectedReportFormat}?courseId=${selectedCourseId}`;
        }

        if (url) {
            window.open(url, '_blank');
        } else {
            alert('Por favor, seleccione un tipo de reporte y un formato.');
        }
    });

    async function fetchReportData(classId, studentId, startDate, endDate) {
        try {
            const response = await fetch(`/api/reports/attendance?classId=${classId}&studentId=${studentId}&startDate=${startDate}&endDate=${endDate}`);
            if (!response.ok) {
                throw new Error('Error al generar el reporte');
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching report data:', error);
            showModal('Error al cargar los datos del reporte. Por favor, intente de nuevo.');
            return null;
        }
    }

    function renderReport(data) {
        reportContent.innerHTML = '';

        if (!data || data.length === 0) {
            reportContent.innerHTML = '<p>No se encontraron datos para el período seleccionado.</p>';
            return;
        }

        let totalPresent = 0;
        let totalAbsent = 0;
        let totalLate = 0;

        const table = document.createElement('table');
        table.className = 'report-table';

        data.forEach(record => {
            const row = table.insertRow();
            row.insertCell(0).textContent = new Date(record.date).toLocaleDateString();
            row.insertCell(1).textContent = record.status;

            if (record.status === 'present') totalPresent++;
            if (record.status === 'absent') totalAbsent++;
            if (record.status === 'late') totalLate++;
        });

        reportContent.appendChild(table);

        const summary = document.createElement('div');
        summary.className = 'report-summary';
        summary.innerHTML = `
            <h3>Resumen</h3>
            <p>Total de Clases: ${data.length}</p>
            <p>Presente: ${totalPresent}</p>
            <p>Ausente: ${totalAbsent}</p>
            <p>Tardanza: ${totalLate}</p>
        `;
        reportContent.appendChild(summary);
    }

    generateReportButton.addEventListener('click', async () => {
        const classId = classSelect.value;
        const studentId = studentSelect.value;
        const startDate = startDateInput.value;
        const endDate = endDateInput.value;

        if (!classId || !studentId || !startDate || !endDate) {
            showModal('Por favor, complete todos los campos para generar el reporte.');
            return;
        }

        const data = await fetchReportData(classId, studentId, startDate, endDate);
        renderReport(data);
    });

    // Populate classes dropdown on page load
    populateClasses();
});

// Helper function to get cookie (assuming it's in app.js or a global utility)
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}