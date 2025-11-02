import mongoose from 'mongoose';

const classSchema = new mongoose.Schema({
    subjectName: {
        type: String,
        required: true,
        trim: true,
        minlength: 3
    },
    courseGroup: {
        type: String,
        trim: true
    },
    dayOfWeek: {
        type: [String],
        required: true,
        enum: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
    },
    startTime: {
        type: String,
        required: true,
        match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ // HH:MM format
    },
    endTime: {
        type: String,
        required: true,
        match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ // HH:MM format
    },
    location: {
        type: String,
        trim: true
    },
    color: {
        type: String,
        default: '#2C5282' // Default color for calendar events
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    students: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ]
}, {
    timestamps: true
});

const Class = mongoose.model('Class', classSchema);

export default Class;