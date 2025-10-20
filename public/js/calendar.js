document.addEventListener('DOMContentLoaded', function() {
    const calendarEl = document.getElementById('calendar');
    if (calendarEl) {
        const calendar = new FullCalendar.Calendar(calendarEl, {
            initialView: 'dayGridMonth',
            height: '100%',
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay'
            },
            events: [], // This will be populated with class data later
            eventClick: function(info) {
                // Handle event click if needed
                console.log('Event clicked:', info.event);
            }
        });
        calendar.render();

        // Function to fetch and render classes on the calendar
        async function fetchAndRenderClasses() {
            const authToken = getCookie('authToken');
            if (!authToken) {
                console.error('No authentication token found.');
                return;
            }
            try {
                const response = await fetch('/api/classes', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${authToken}`
                    }
                });
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const classes = await response.json();
                const events = classes.flatMap(cls => {
                    const days = Array.isArray(cls.dayOfWeek) ? cls.dayOfWeek : [cls.dayOfWeek];
                    return days.map(day => ({
                        title: cls.subjectName,
                        startTime: cls.startTime,
                        endTime: cls.endTime,
                        daysOfWeek: [getDayNumber(day)],
                        startRecur: cls.startDate || '2023-01-01', // Default start date
                        endRecur: cls.endDate || '2030-12-31',   // Default end date
                        color: cls.color || '#2C5282',
                        extendedProps: { classId: cls._id }
                    }));
                });
                calendar.setOption('events', events);
            } catch (error) {
                console.error('Error fetching classes for calendar:', error);
            }
        }

        function getDayNumber(dayName) {
            const days = {
                'Domingo': 0,
                'Lunes': 1,
                'Martes': 2,
                'Miércoles': 3,
                'Jueves': 4,
                'Viernes': 5,
                'Sábado': 6
            };
            return days[dayName];
        }

        fetchAndRenderClasses();
    }
});