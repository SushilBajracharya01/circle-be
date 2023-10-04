import expressAsyncHandler from "express-async-handler";
import { Response } from 'express';
import { IRequestModified } from "../types.js";
import Post from "../models/Post.js";
import { dataUri } from "../middleware/multer.js";
import cloudinary from "../utilities/cloudinary.js";
import Comment from "../models/Comment.js";
import { ObjectId } from "mongodb";

// @desc Get all post by userId
// @route GET /post
// @access Private
export const getPostsByCircleId = expressAsyncHandler(async (req: IRequestModified, res: Response) => {
    const { circleId } = req.params;


    let page: number = req.query.page ? +req.query.page : 1;
    let pageSize: number = req.query.pageSize ? +req.query.pageSize : 10;

    const skipValue = (page - 1) * pageSize;

    let query = { circleId };

    const totalDocuments = await Post.countDocuments(query);

    const totalPages = Math.ceil(totalDocuments / pageSize);

    if (page > totalPages) {
        res.status(400).json({ message: 'No Circles found', status: 404 });
        return null;
    }

    const agg: any = [
        {
            '$match': {
                'circleId': new ObjectId(circleId)
            }
        }, {
            '$sort': {
                'createdAt': -1
            }
        }, {
            '$skip': skipValue
        }, {
            '$limit': pageSize
        }, {
            '$lookup': {
                'from': 'users',
                'localField': 'createdBy',
                'foreignField': '_id',
                'as': 'createdBy'
            }
        }, {
            '$lookup': {
                'from': 'comments',
                'localField': '_id',
                'foreignField': 'postId',
                'as': 'comments'
            }
        }, {
            '$addFields': {
                'commentCount': {
                    '$size': '$comments'
                }
            }
        }, {
            '$project': {
                '__v': 0,
                'updatedAt': 0,
                'createdBy': {
                    '__v': 0,
                    'password': 0
                },
                'comments': 0
            }
        }, {
            '$unwind': {
                'path': '$createdBy'
            }
        }
    ];

    try {
        const posts = await Post.aggregate(agg);

        if (!posts?.length) {
            res.status(400).json({ message: 'No Circles found', status: 404 });
            return null;
        }

        res.json({
            message: 'Posts in the circle',
            status: 200,
            results: posts,
            currentPage: page,
            totalPages: totalPages,
            totalDocuments: totalDocuments,
        });
    }
    catch (err) {
        console.log(err)
    }

    // const posts = await Post.find(query).skip(skipValue).limit(pageSize).populate('createdBy', { username: 1, fullname: 1, photo: 1 }).select('-__v').sort({
    //     _id: -1
    // });


});

// @desc Get post by postId
// @route GET /get
// @access Private
export const getPostsById = expressAsyncHandler(async (req: IRequestModified, res: Response) => {
    const { postId } = req.params;

    const post = await Post.find({ _id: postId }).populate('createdBy', { username: 1, fullname: 1, photo: 1 }).select('-__v');
    if (!post) {
        res.status(400).json({ message: 'No post found' });
        return null;
    }

    res.json({
        message: "Post by Id",
        result: post,
        status: 200
    });
});

// @desc Create new post
// @route POST /post
// @access Private
export const createNewPost = expressAsyncHandler(async (req: IRequestModified, res: Response) => {
    const userId = req._id;

    const { content, circleId } = req.body;

    if (!circleId) {
        res.status(400).json({ message: 'CircleId are required' });
        return;
    }

    // Confirm data
    if (!content) {
        res.status(400).json({ message: 'Content Fields are required' });
        return;
    }

    let photoPhotos = [];
    const FILES: any = req.files;
    if (FILES) {
        const resp = await Promise.all(
            FILES.map(async (file) => {
                if (!file) return;
                let data_uri = dataUri(file);

                if (data_uri) {
                    const uploadRes = await cloudinary.uploader.upload(data_uri, {
                        upload_preset: 'post-pic'
                    });
                    return uploadRes;
                }
                return null;
            })
        );
        photoPhotos = resp;
    }

    const postObject = { circleId: circleId, content, createdBy: userId, photos: photoPhotos };

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
    const { content, deletedImages } = req.body;

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

    let tempPhotos = [...post.photos];
    if (deletedImages) {
        if (typeof deletedImages === 'string') {
            await cloudinary.uploader.destroy(deletedImages, function (error, result) {
                tempPhotos = tempPhotos.filter(photo => photo.public_id !== deletedImages);
            }).then(resp => console.log(resp)).catch(_err => console.log("Something went wrong, please try again later."));
        }
        else {
            deletedImages.forEach(async (publicId: string) => {
                await cloudinary.uploader.destroy(publicId, function (error, result) {
                    tempPhotos = tempPhotos.filter(photo => photo.public_id !== publicId);
                    console.log(result, error);
                }).then(resp => console.log(resp)).catch(_err => console.log("Something went wrong, please try again later."));
            })
        }
    }

    let photoPhotos = [];
    const FILES: any = req.files;
    if (FILES) {
        const resp = await Promise.all(
            FILES.map(async (file) => {
                if (!file) return;
                let data_uri = dataUri(file);

                if (data_uri) {
                    const uploadRes = await cloudinary.uploader.upload(data_uri, {
                        upload_preset: 'post-pic'
                    });
                    return uploadRes;
                }
                return null;
            })
        );
        photoPhotos = resp;
    }
    tempPhotos = [...tempPhotos, ...photoPhotos];

    const respo = await Post.updateOne({ _id: postId }, {
        $set: {
            "content": content,
            'photos': tempPhotos
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

        post.photos.forEach(async photo => {
            await cloudinary.uploader.destroy(photo.public_id, function (error, result) {
                console.log(result, error);
            }).then(resp => console.log(resp)).catch(_err => console.log("Something went wrong, please try again later."));
        })

        await Post.deleteOne({ _id: postId });

        res.json({ message: `Deleted successfully` })
        return;
    }
    catch (err) {
        res.status(400).json({ message: 'Something went wrong!' });
        return;
    }
});


// post comments

// @desc Get comments by postId
// @route GET /get
// @access Private
export const getComments = expressAsyncHandler(async (req: IRequestModified, res: Response) => {
    const { postId } = req.params;

    let pipeline: any = [
        {
            '$match': {
                'postId': new ObjectId(postId)
            },
        }, {
            '$lookup': {
                'from': 'users',
                'localField': 'createdBy',
                'foreignField': '_id',
                'as': 'createdBy'
            }
        }, {
            '$unwind': {
                'path': '$createdBy'
            }
        }, {
            '$project': {
                '__v': 0,
                'updatedAt': 0,
                'createdBy': {
                    '__v': 0,
                    'password': 0
                },
            }
        },
    ]

    const comments = await Comment.aggregate(pipeline);

    if (!comments) {
        res.status(400).json({ message: 'No comments found' });
        return null;
    }

    res.json({
        message: "Comments by Id",
        result: comments,
        status: 200
    });
});
// @desc Create new comment
// @route POST /posts/postId/comment
// @access Private
export const createNewComment = expressAsyncHandler(async (req: IRequestModified, res: Response) => {
    const userId = req._id;
    const { postId } = req.params;

    const { comment } = req.body;

    if (!postId) {
        res.status(400).json({ message: 'PostId is required' });
        return;
    }

    // Confirm data
    if (!comment) {
        res.status(400).json({ message: 'Comment Field is required' });
        return;
    }

    let photos = [];
    const FILES: any = req.files;
    if (FILES) {
        const resp = await Promise.all(
            FILES.map(async (file) => {
                if (!file) return;
                let data_uri = dataUri(file);

                if (data_uri) {
                    const uploadRes = await cloudinary.uploader.upload(data_uri, {
                        upload_preset: 'comment-pic'
                    });
                    return uploadRes;
                }
                return null;
            })
        );
        photos = resp;
    }

    const commentObject = { postId: postId, comment, createdBy: userId, photos: photos };

    // Create and Store new post
    const commentRes = await Comment.create(commentObject);

    if (commentRes) {
        res.status(201).json({ message: `Comment created successfully!` });
        return;
    }
    else {
        res.status(400).json({ message: 'Invalid comment data received' });
        return;
    }
});


// @desc Update comment
// @route PATCH /posts/postId/comment
// @access Private
export const updateComment = expressAsyncHandler(async (req: IRequestModified, res: Response) => {
    const { commentId } = req.params;
    const userId = req._id;
    const { comment, deletedImages } = req.body;

    // Confirm data
    if (!comment) {
        res.status(400).json({ message: "Comment field is required" })
        return;
    }

    const commentData = await Comment.findById(commentId).exec();

    if (!commentData) {
        res.status(404).json({ message: 'Comment not found' });
        return;
    }

    if (`${commentData.createdBy}` !== userId) {
        res.status(401).json({ message: 'You do not have the permission to update this Comment.' });
        return;
    }

    let tempPhotos = [...commentData.photos];
    if (deletedImages) {
        if (typeof deletedImages === 'string') {
            await cloudinary.uploader.destroy(deletedImages, function (error, result) {
                tempPhotos = tempPhotos.filter(photo => photo.public_id !== deletedImages);
            }).then(resp => console.log(resp)).catch(_err => console.log("Something went wrong, please try again later."));
        }
        else {
            deletedImages.forEach(async (publicId: string) => {
                await cloudinary.uploader.destroy(publicId, function (error, result) {
                    tempPhotos = tempPhotos.filter(photo => photo.public_id !== publicId);
                    console.log(result, error);
                }).then(resp => console.log(resp)).catch(_err => console.log("Something went wrong, please try again later."));
            })
        }
    }

    let photoPhotos = [];
    const FILES: any = req.files;
    if (FILES) {
        const resp = await Promise.all(
            FILES.map(async (file) => {
                if (!file) return;
                let data_uri = dataUri(file);

                if (data_uri) {
                    const uploadRes = await cloudinary.uploader.upload(data_uri, {
                        upload_preset: 'comment-pic'
                    });
                    return uploadRes;
                }
                return null;
            })
        );
        photoPhotos = resp;
    }
    tempPhotos = [...tempPhotos, ...photoPhotos];

    const respo = await Comment.updateOne({ _id: commentId }, {
        $set: {
            "comment": comment,
            'photos': tempPhotos
        }
    });

    res.json({ message: "Comment updated successfully" })
    return;
});

// @desc Delete post
// @route DELETE /posts/postId/comment/commentId
// @access Private
export const deleteComment = expressAsyncHandler(async (req: IRequestModified, res: Response) => {
    const { commentId } = req.params;

    const userId = req._id;

    if (!commentId) {
        res.status(400).json({ message: "CommentId field is required" })
        return;
    }

    try {
        const comment = await Comment.findById(commentId).exec();

        if (!comment) {
            res.status(404).json({ message: 'Comment not found!' });
            return;
        }

        if (`${comment.createdBy}` !== userId) {
            res.status(401).json({ message: 'You do not have the permission to delete this Comment.' });
            return;
        }

        comment.photos.forEach(async photo => {
            await cloudinary.uploader.destroy(photo.public_id, function (error, result) {
                console.log(result, error);
            }).then(resp => console.log(resp)).catch(_err => console.log("Something went wrong, please try again later."));
        })

        await Comment.deleteOne({ _id: commentId });

        res.json({ message: `Deleted successfully` })
        return;
    }
    catch (err) {
        res.status(400).json({ message: 'Something went wrong!' });
        return;
    }
});