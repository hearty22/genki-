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
                window.location.href = '/login.html';
                return [];
            }
            if (response.status === 401) {
                window.location.href = '/login.html';
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
});

// Helper function to get cookie (assuming it's in app.js or a global utility)
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}