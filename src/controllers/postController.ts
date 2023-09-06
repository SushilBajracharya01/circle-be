import expressAsyncHandler from "express-async-handler";
import { Response } from 'express';
import { IRequestModified } from "../types.js";
import Post from "../models/Post.js";

// @desc Get all post by userId
// @route GET /post
// @access Private
export const getPostsByCircleId = expressAsyncHandler(async (req: IRequestModified, res: Response) => {
    const userId = req._id;
    const { circleId } = req.params;

    const posts = await Post.find({ circleId }).lean();
    if (!posts?.length) {
        res.status(400).json({ message: 'No Circles found' });
        return null;
    }

    res.json(posts);
});


// @desc Create new post
// @route POST /post
// @access Private
export const createNewPost = expressAsyncHandler(async (req: IRequestModified, res: Response) => {
    const userId = req._id;

    const { content, circleId } = req.body;

    if(!circleId) {
        res.status(400).json({ message: 'CircleId are required' });
        return;
    }

    // Confirm data
    if (!content) {
        res.status(400).json({ message: 'Content Fields are required' });
        return;
    }

    const postObject = { circleId: circleId, content, createdBy: userId };

    // Create and Store new post
    const post = await Post.create(postObject);

    if (post) {
        res.status(201).json({ message: `Post created successfully!` });
        return;
    }
    else {
        res.status(400).json({ message: 'Invalid post data received' });
        return;
    }
});

// @desc Update post
// @route PATCH /post/postId
// @access Private
export const updatePost = expressAsyncHandler(async (req: IRequestModified, res: Response) => {
    const { postId } = req.params;
    const userId = req._id;
    const { content } = req.body;

    // Confirm data
    if (!content) {
        res.status(400).json({ message: "Content fields are required" })
        return;
    }

    const post = await Post.findById(postId).exec();

    if (!post) {
        res.status(404).json({ message: 'Post not found' });
        return;
    }

    if (`${post.createdBy}` !== userId) {
        res.status(401).json({ message: 'You do not have the permission to update this Post.' });
        return;
    }

    await post.updateOne({ _id: postId }, {
        "$set": {
            content: content
        }
    });

    res.json({ message: "Post updated successfully" })
    return;
});

// @desc Delete post
// @route DELETE /post/postId
// @access Private
export const deletePost = expressAsyncHandler(async (req: IRequestModified, res: Response) => {
    const { postId } = req.params;

    const userId = req._id;

    if (!postId) {
        res.status(400).json({ message: "postId fields are required" })
        return;
    }

    try {
        const post = await Post.findById(postId).exec();

        if (!post) {
            res.status(404).json({ message: 'Post not found!' });
            return;
        }

        if (`${post.createdBy}` !== userId) {
            res.status(401).json({ message: 'You do not have the permission to delete this Post.' });
            return;
        }

        await Post.deleteOne({ _id: userId });

        res.json({ message: `Deleted successfully` })
        return;
    }
    catch (err) {
        res.status(400).json({ message: 'Something went wrong!' });
        return;
    }
});