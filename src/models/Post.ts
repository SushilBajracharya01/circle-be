import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
    circleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Circle"
    },
    content: {
        type: String,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    photos: [{
        type: Object,
    }],
}, {
    timestamps: true
})

const Post = mongoose.model("Post", postSchema);

export default Post;

