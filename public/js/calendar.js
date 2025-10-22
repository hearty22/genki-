document.addEventListener('DOMContentLoaded', function() {
    const calendarEl = document.getElementById('calendar');
    if (calendarEl) {
        const calendar = new FullCalendar.Calendar(calendarEl, {
            initialView: 'dayGridMonth',
            height: 'auto',
            aspectRatio: 1.8,
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay'
            },
            firstDay: 1, // Lunes
            slotMinTime: '07:00:00',
            slotMaxTime: '21:00:00',
            events: [], // This will be populated with class data later
            eventClick: function(info) {
                const modal = document.getElementById('event-details-modal');
                const closeButton = modal.querySelector('.close-button');
                const editButton = document.getElementById('edit-event-button');

                const eventTitle = info.event.title;
                const [subjectName, courseGroup] = eventTitle.split(' - ');

                document.getElementById('event-title').textContent = eventTitle;
                document.getElementById('event-subject').textContent = subjectName;
                document.getElementById('event-group').textContent = courseGroup;
                document.getElementById('event-start-time').textContent = info.event.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                document.getElementById('event-end-time').textContent = info.event.end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                document.getElementById('event-days').textContent = info.event.extendedProps.daysOfWeek ? info.event.extendedProps.daysOfWeek.map(dayNum => getDayName(dayNum)).join(', ') : 'N/A';

                modal.style.display = 'flex';

                closeButton.onclick = function() {
                    modal.style.display = 'none';
                };

                window.onclick = function(event) {
                    if (event.target == modal) {
                        modal.style.display = 'none';
                    }
                };

                editButton.onclick = function() {
                    const classId = info.event.extendedProps.classId;
                    if (classId) {
                        window.location.href = `edit-class.html?id=${classId}`;
                    } else {
                        console.error('No class ID found for this event.');
                    }
                };
            }
        });
        calendar.render();

        // Function to fetch and render classes on the calendar
        async function fetchAndRenderClasses() {
            const loadingIndicator = document.getElementById('loading-indicator');
            loadingIndicator.style.display = 'block'; // Show loading indicator

            const authToken = getCookie('authToken');
            if (!authToken) {
                console.error('No authentication token found.');
                loadingIndicator.style.display = 'none'; // Hide loading indicator on error
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
                    const errorData = await response.json();
                    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
                }
                const classes = await response.json();
                const events = classes.flatMap(cls => {
                    const days = Array.isArray(cls.dayOfWeek) ? cls.dayOfWeek : [cls.dayOfWeek];
                    return days.map(day => ({
                        title: `${cls.subjectName} - ${cls.courseGroup}`,
                        startTime: cls.startTime,
                        endTime: cls.endTime,
                        daysOfWeek: [getDayNumber(day)],
                        startRecur: cls.startDate || '2023-01-01', // Default start date
                        endRecur: cls.endDate || '2030-12-31',   // Default end date
                        color: cls.color || '#2C5282',
                        textColor: '#FFFFFF',
                        extendedProps: { classId: cls._id, daysOfWeek: days.map(getDayNumber) }
                    }));
                });
                calendar.setOption('events', events);
            } catch (error) {
                console.error('Error fetching classes for calendar:', error);
                showMessage(`Error al cargar las clases: ${error.message}`, 'error');
            } finally {
                loadingIndicator.style.display = 'none'; // Hide loading indicator
            }
        }

        function getDayName(dayNumber) {
            const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
            return days[dayNumber];
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