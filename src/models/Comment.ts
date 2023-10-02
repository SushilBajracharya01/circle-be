import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post"
    },
    comment: {
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

const Comment = mongoose.model("Comment", commentSchema);

export default Comment;
