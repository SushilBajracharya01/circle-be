import mongoose from 'mongoose';

const postReactionSchema = new mongoose.Schema({
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post"
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    reaction: {
        type: String,
    },
}, {
    timestamps: true
})

const PostReaction = mongoose.model("PostReaction", postReactionSchema);

export default PostReaction;
