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

                const eventType = info.event.extendedProps.type;

                if (eventType === 'class') {
                    const eventTitle = info.event.title;
                    const [subjectName, courseGroup] = eventTitle.split(' - ');

                    const eventTitleEl = document.getElementById('event-title');
                    const eventSubjectEl = document.getElementById('event-subject');
                    const eventGroupEl = document.getElementById('event-group');
                    const eventStartTimeEl = document.getElementById('event-start-time');
                    const eventEndTimeEl = document.getElementById('event-end-time');
                    const eventDaysEl = document.getElementById('event-days');

                    // Show class-specific elements
                    document.getElementById('event-subject-row').style.display = '';
                    document.getElementById('event-group-row').style.display = '';
                    document.getElementById('event-days-row').style.display = '';
                    document.getElementById('event-description-row').style.display = 'none';

                    if (!eventTitleEl || !eventSubjectEl || !eventGroupEl || !eventStartTimeEl || !eventEndTimeEl || !eventDaysEl) {
                        console.error('Faltan elementos en el modal de detalles de clase');
                        return;
                    }

                    eventTitleEl.textContent = eventTitle;
                    eventSubjectEl.textContent = subjectName;
                    eventGroupEl.textContent = courseGroup;
                    eventStartTimeEl.textContent = info.event.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    eventEndTimeEl.textContent = info.event.end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    eventDaysEl.textContent = info.event.extendedProps.daysOfWeek ? info.event.extendedProps.daysOfWeek.map(dayNum => getDayName(dayNum)).join(', ') : 'N/A';

                    editButton.onclick = function() {
                        const classId = info.event.extendedProps.classId;
                        if (classId) {
                            window.location.href = `edit-class?id=${classId}`;
                        } else {
                            console.error('No class ID found for this event.');
                        }
                    };
                } else if (eventType === 'event') {
                    const eventTitle = info.event.title;
                    const eventDescription = info.event.extendedProps.description;

                    const eventTitleEl = document.getElementById('event-title');
                    const eventStartTimeEl = document.getElementById('event-start-time');
                    const eventDescriptionEl = document.getElementById('event-description');

                    // Hide class-specific elements and show event-specific elements
                    document.getElementById('event-subject-row').style.display = 'none';
                    document.getElementById('event-group-row').style.display = 'none';
                    document.getElementById('event-days-row').style.display = 'none';
                    document.getElementById('event-description-row').style.display = '';
                    document.getElementById('event-end-time-row').style.display = 'none'; // Hide end time for events if not applicable

                    if (!eventTitleEl || !eventStartTimeEl || !eventDescriptionEl) {
                        console.error('Faltan elementos en el modal de detalles de evento');
                        return;
                    }

                    eventTitleEl.textContent = eventTitle;
                    eventStartTimeEl.textContent = info.event.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    eventDescriptionEl.textContent = eventDescription || 'No hay descripción disponible.';

                    editButton.onclick = function() {
                        const eventId = info.event.extendedProps.eventId;
                        if (eventId) {
                            // Implement event editing logic or redirect to an event edit page
                            console.log(`Edit event with ID: ${eventId}`);
                            showMessage('Funcionalidad de edición de eventos no implementada aún.', 'info');
                        } else {
                            console.error('No event ID found for this event.');
                        }
                    };
                }

                modal.style.display = 'flex';

                closeButton.onclick = function() {
                    modal.style.display = 'none';
                };

                window.onclick = function(event) {
                    if (event.target == modal) {
                        modal.style.display = 'none';
                    }
                };
            }
        });
        calendar.render();

        // Function to fetch and render classes and events on the calendar
        async function fetchAndRenderCalendarEvents() {
            const loadingIndicator = document.getElementById('loading-indicator');
            if (loadingIndicator) {
                loadingIndicator.style.display = 'block'; // Show loading indicator
            }

            


            try {
                const [classesResult, eventsResult] = await Promise.allSettled([
                    fetch('/api/classes', {
                        method: 'GET',
                        headers: {
                            
                        }
                    }),
                    fetch('/api/events', {
                        method: 'GET',
                        headers: {
                            
                        }
                    })
                ]);

                const calendarEvents = [];

                // Process classes
                if (classesResult.status === 'fulfilled') {
                    const classesResponse = classesResult.value;
                    if (!classesResponse.ok) {
                        if (classesResponse.status === 401) {
                            window.location.href = '/login';
                            return;
                        }
                        const errorData = await classesResponse.json();
                        throw new Error(errorData.message || `HTTP error! status: ${classesResponse.status}`);
                    }
                    const classes = await classesResponse.json();
                    classes.forEach(cls => {
                        const days = Array.isArray(cls.dayOfWeek) ? cls.dayOfWeek : [cls.dayOfWeek];
                        const daysOfWeekNumbers = days.map(d => getDayNumber(d));

                        calendarEvents.push({
                            title: `${cls.subjectName} - ${cls.courseGroup}`,
                            startTime: cls.startTime,
                            endTime: cls.endTime,
                            daysOfWeek: daysOfWeekNumbers,
                            startRecur: cls.startDate || '2023-01-01',
                            endRecur: cls.endDate || '2030-12-31',
                            color: cls.color || '#2C5282',
                            textColor: '#FFFFFF',
                            extendedProps: {
                                type: 'class',
                                classId: cls._id,
                                daysOfWeek: daysOfWeekNumbers
                            }
                        });
                    });
                } else {
                    console.error('Error fetching classes:', classesResult.reason);
                    showMessage(`Error al cargar las clases: ${classesResult.reason.message || classesResult.reason}`, 'error');
                }

                // Process events
                if (eventsResult.status === 'fulfilled') {
                    const eventsResponse = eventsResult.value;
                    if (!eventsResponse.ok) {
                        if (eventsResponse.status === 401) {
                            // No redirigir aquí, ya que la redirección se maneja para las clases
                            console.warn('Advertencia: Token de autenticación inválido para eventos.');
                            return;
                        }
                        const errorData = await eventsResponse.json();
                        throw new Error(errorData.message || `HTTP error! status: ${eventsResponse.status}`);
                    }
                    const events = await eventsResponse.json();
                    events.forEach(event => {
                        calendarEvents.push({
                            title: event.title,
                            start: event.date,
                            backgroundColor: '#FF5733',
                            borderColor: '#FF5733',
                            extendedProps: {
                                type: 'event',
                                eventId: event._id,
                                description: event.description
                            }
                        });
                    });
                } else {
                    console.warn('Advertencia: La API de eventos no está implementada o no responde. Error:', eventsResult.reason);
                    // No mostrar un mensaje de error al usuario para la API de eventos si no está implementada
                }

                calendar.setOption('events', calendarEvents);
            } catch (error) {
                console.error('Error fetching calendar events:', error);
                showMessage(`Error al cargar los eventos del calendario: ${error.message}`, 'error');
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

        fetchAndRenderCalendarEvents();
    }
});