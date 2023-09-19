import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
    type: {
        type: String,// nee to make it enum CIRCLE_INVITE, POST_ACTIONS,
        enum: ['CIRCLE_INVITE', 'POST_ACTIONS'],
        required: true
    },
    tite: {
        type: String,
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    hasRead: {
        type: Boolean,
        requried: true
    },
    meta: {
        type: Object
    }
}, {
    timestamps: true
});

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
