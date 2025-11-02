import Event from '../models/Event.js';

// Create a new event
export const createEvent = async (req, res) => {
    try {
        const { title, description, date, time, color } = req.body;

        // Combinar fecha y hora en un solo objeto Date
        const eventDateTime = new Date(`${date}T${time}:00`);

        const newEvent = new Event({
            title,
            description: description || '', // Asegurarse de que la descripción no sea undefined
            date: eventDateTime,
            color: color || '#FF5733', // Usar color predeterminado si no se proporciona
            user: req.user.id // Assuming user ID is available in req.user.id after authentication
        });
        const event = await newEvent.save();
        res.status(201).json(event);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
};

// Get all events for a user
export const getEvents = async (req, res) => {
    try {
        const events = await Event.find({ user: req.user.id }).sort({ date: 1 });
        res.json(events);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
};

// Get a single event by ID
export const getEventById = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ msg: 'Event not found' });
        }
        // Ensure user owns the event
        if (event.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized' });
        }
        res.json(event);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
};

// Update an event
export const updateEvent = async (req, res) => {
    try {
        const { title, description, date } = req.body;
        let event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({ msg: 'Event not found' });
        }
        // Ensure user owns the event
        if (event.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        event.title = title || event.title;
        event.description = description || event.description;
        event.date = date || event.date;

        event = await event.save();
        res.json(event);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
};

// Delete an event
export const deleteEvent = async (req, res) => {
    try {
        console.log('Attempting to delete event with ID:', req.params.id);
        const eventsBeforeDelete = await Event.find({ user: req.user.id });
        console.log('Events before deletion:', eventsBeforeDelete.length);

        const event = await Event.findById(req.params.id);

        if (!event) {
            console.log('Event not found for ID:', req.params.id);
            return res.status(404).json({ msg: 'Event not found' });
        }
        // Ensure user owns the event
        if (event.user.toString() !== req.user.id) {
            console.log('User not authorized to delete event ID:', req.params.id);
            return res.status(401).json({ msg: 'User not authorized' });
        }

        await Event.deleteOne({ _id: req.params.id });
        console.log('Event successfully deleted with ID:', req.params.id);

        const eventsAfterDelete = await Event.find({ user: req.user.id });
        console.log('Events after deletion:', eventsAfterDelete.length);

        res.json({ msg: 'Event removed' });
    } catch (error) {
        console.error('Error in deleteEvent:', error.message);
        res.status(500).send('Server Error');
    }
};