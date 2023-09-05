import mongoose from 'mongoose';

const circleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    descriptions: {
        type: String,
    },
    moto: {
        type: String,
    },
    members: {
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }],
        required: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
}, {
    timestamps: true
})

const Circle = mongoose.model("Circle", circleSchema);

export default Circle;

