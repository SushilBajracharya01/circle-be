import mongoose from 'mongoose';

//
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    name:{
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true,
    },
    roles: {
        type: [String],
        default: ["Employee"],
    },
    photo: {
        type: Object
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

