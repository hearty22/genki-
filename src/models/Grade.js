import mongoose from 'mongoose';

const gradeSchema = new mongoose.Schema({
    assessment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Assessment',
        required: true
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    grade: {
        type: Number,
        required: true
    }
}, { timestamps: true });

const Grade = mongoose.model('Grade', gradeSchema);

export default Grade;