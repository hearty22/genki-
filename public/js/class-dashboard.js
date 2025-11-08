document.addEventListener('DOMContentLoaded', async () => {
    const classDashboardTitle = document.getElementById('class-dashboard-title');
    const topAbsencesList = document.getElementById('top-absences-list');
    const averageGradeChartCanvas = document.getElementById('average-grade-chart');
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
            averageGradeChart = new Chart(averageGradeChartCanvas, {
                type: 'bar',
                data: {
                    labels: ['Promedio del Curso'],
                    datasets: [{
                        label: 'Promedio de Notas',
                        data: [stats.averageGrade],
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

    loadDashboard();
});