document.addEventListener('DOMContentLoaded', function() {
    const calendarEl = document.getElementById('calendar');
    if (calendarEl) {
        const calendar = new FullCalendar.Calendar(calendarEl, {
            initialView: 'dayGridMonth',
            locale: 'es', // Set locale to Spanish
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
            initialView: 'timeGridWeek',
            events: [], // This will be populated with class data later
            eventClick: function(info) {
                const modal = document.getElementById('event-details-modal');
                if (!modal) return; // Verificar que el modal exista
                const closeButton = modal.querySelector('.close-button');
                const editButton = document.getElementById('edit-event-button');
                if (!closeButton || !editButton) return; // Verificar botones

                const eventTitle = info.event.title;
                const [subjectName, courseGroup] = eventTitle.split(' - ');

                const eventTitleEl = document.getElementById('event-title');
                const eventSubjectEl = document.getElementById('event-subject');
                const eventGroupEl = document.getElementById('event-group');
                const eventStartTimeEl = document.getElementById('event-start-time');
                const eventEndTimeEl = document.getElementById('event-end-time');
                const eventDaysEl = document.getElementById('event-days');
                // Verificar todos los elementos del modal
                if (!eventTitleEl || !eventSubjectEl || !eventGroupEl || !eventStartTimeEl || !eventEndTimeEl || !eventDaysEl) {
                    console.error('Faltan elementos en el modal de detalles');
                    return;
                }

                eventTitleEl.textContent = eventTitle;
                eventSubjectEl.textContent = subjectName;
                eventGroupEl.textContent = courseGroup;
                eventStartTimeEl.textContent = info.event.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                eventEndTimeEl.textContent = info.event.end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                eventDaysEl.textContent = info.event.extendedProps.daysOfWeek ? info.event.extendedProps.daysOfWeek.map(dayNum => getDayName(dayNum)).join(', ') : 'N/A';

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
            if (loadingIndicator) {
                loadingIndicator.style.display = 'block'; // Show loading indicator
            }

            const authToken = getCookie('authToken');
            if (!authToken) {
                console.error('No authentication token found.');
                if (loadingIndicator) {
                    loadingIndicator.style.display = 'none'; // Hide loading indicator on error
                }
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
                    if (response.status === 401) {
                        window.location.href = '/login.html';
                        return;
                    }
                    const errorData = await response.json();
                    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
                }
                const classes = await response.json();
                const events = classes.map(cls => {
                    const days = Array.isArray(cls.dayOfWeek) ? cls.dayOfWeek : [cls.dayOfWeek];
                    const daysOfWeekNumbers = days.map(d => getDayNumber(d));

                    return {
                        title: `${cls.subjectName} - ${cls.courseGroup}`,
                        startTime: cls.startTime,
                        endTime: cls.endTime,
                        daysOfWeek: daysOfWeekNumbers,
                        startRecur: cls.startDate || '2023-01-01',
                        endRecur: cls.endDate || '2030-12-31',
                        color: cls.color || '#2C5282',
                        textColor: '#FFFFFF',
                        extendedProps: {
                            classId: cls._id,
                            daysOfWeek: daysOfWeekNumbers
                        }
                    };
                });
                // console.log('Generated events for calendar:', JSON.stringify(events, null, 2)); // Modified line
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