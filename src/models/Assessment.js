import mongoose from 'mongoose';

const assessmentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class',
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    maxGrade: {
        type: Number,
        default: 100
    }
}, { timestamps: true });

const Assessment = mongoose.model('Assessment', assessmentSchema);

export default Assessment;