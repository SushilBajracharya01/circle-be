import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['CIRCLE_INVITE', 'POST_ACTIONS'],
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    circleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Circle",
        required: true,
    },
    hasRead: {
        type: Boolean,
        requried: true,
        default: false
    },
    meta: {
        type: Object
    }
}, {
    timestamps: true
});

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
