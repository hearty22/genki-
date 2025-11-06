import mongoose from 'mongoose';

const calculationComponentSchema = new mongoose.Schema({
    assessment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Assessment',
        required: true
    },
    weight: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    }
}, { _id: false });

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
    },
    isCalculated: {
        type: Boolean,
        default: false
    },
    calculationFormula: [calculationComponentSchema],
    rounding: {
        type: Number,
        default: 1 // e.g., 0 for no decimals, 1 for 1 decimal place, etc.
    }
}, { timestamps: true });

const Assessment = mongoose.model('Assessment', assessmentSchema);

export default Assessment;