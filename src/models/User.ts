import mongoose from 'mongoose';

//
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    fullname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true,
    },
    photo: {
        type: Object
    },
    about: {
        type: String
    },
    country: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        default: "User",
    },
    active: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
})

const User = mongoose.model("User", userSchema);

export default User;

