import expressAsyncHandler from "express-async-handler";
import { Response } from 'express';

//
import Post from "../models/Post.js";
import Circle from '../models/Circle.js';

//
import { IRequestModified } from "../types.js";
import { dataUri } from "../middleware/multer.js";
import cloudinary from "../utilities/cloudinary.js";

// @desc Get all circle by userId
// @route GET /circle
// @access Private
export const getCirclesByUserId = expressAsyncHandler(async (req: IRequestModified, res: Response) => {
    const userId = req._id;

    const circles = await Circle.find({ createdBy: userId }).select('-updatedAt -__v');
    if (!circles?.length) {
        res.status(400).json({
            results: [],
            message: 'No Circles found'
        });
        return null;
    }

    res.json({
        status: 200,
        message: 'User circles',
        results: circles
    });
});


export const getCircleById = expressAsyncHandler(async (req: IRequestModified, res: Response) => {
    const userId = req._id;
    const { id } = req.params;

    const circle = await Circle.findOne({ _id: id }).select('-updatedAt -__v');

    if (!circle) {
        res.status(400).json({
            result: null,
            message: 'No Circle found'
        });
        return null;
    }

    if (!circle.members.map(member => member.toString()).includes(userId)) {
        res.status(403).json({
            result: null,
            message: "You are not Authorized to view this circle."
        })
        return;
    }

    res.json({
        status: 200,
        message: 'Circle',
        result: circle
    });
});


// @desc Create new circle
// @route POST /circle
// @access Private
export const createNewCircle = expressAsyncHandler(async (req: IRequestModified, res: Response) => {
    const userId = req._id;
    const { name, description, moto } = req.body;

    // Confirm data
    if (!name) {
        res.status(400).json({ message: 'Name Fields are required' });
        return;
    }
    let circlePhotoObject = null;
    let circleImagePic = null;
    if (req.files && req.files[0]) {
        let tempPic = req.files[0];
        if (!tempPic) return;
        circleImagePic = dataUri(tempPic);
    }
    if (circleImagePic) {
        const uploadRes = await cloudinary.uploader.upload(circleImagePic, {
            upload_preset: 'circle-pic'
        });
        if (uploadRes) {
            circlePhotoObject = uploadRes;
        }
    }
    const circleObject = {
        name, description, moto, createdBy: userId, members: [userId], photo: circlePhotoObject
    };

    // Create and Store new circle
    const circle = await Circle.create(circleObject);

    if (circle) {
        res.status(201).json({ message: `Circle created successfully!` });
        return;
    }
    else {
        res.status(400).json({ message: 'Invalid circle data received' });
        return;
    }
});

// @desc Update circle
// @route PATCH /circle/id
// @access Private
export const updateCircle = expressAsyncHandler(async (req: IRequestModified, res: Response) => {
    const { id } = req.params;
    const userId = req._id;
    const { name, description, moto } = req.body;

    // Confirm data
    if (!name) {
        res.status(400).json({ message: "Name fields are required" })
        return;
    }

    const circle = await Circle.findById(id).exec();

    if (!circle) {
        res.status(404).json({ message: 'Circle not found' });
        return;
    }

    if (`${circle.createdBy}` !== userId) {
        res.status(401).json({ message: 'You do not have the permission to update this Circle.' });
        return;
    }

    circle.name = name;
    circle.description = description;
    circle.moto = moto;


    let circlePhotoObject = null;
    let circleImagePic = null;
    if (req.files && req.files[0]) {
        let tempPic = req.files[0];
        if (!tempPic) return;
        circleImagePic = dataUri(tempPic);
    }

    if (circleImagePic) {
        const uploadRes = await cloudinary.uploader.upload(circleImagePic, {
            upload_preset: 'circle-pic'
        });
        if (uploadRes) {
            circlePhotoObject = uploadRes;
            // remove old photo from cloudinary
            if (circle.photo?.public_id) {
                await cloudinary.uploader.destroy(circle.photo.public_id, function (error, result) {
                }).then(resp => console.log(resp)).catch(_err => console.log("Something went wrong, please try again later."));
            }
            circle.photo = circlePhotoObject;
        }
    }


    const updatedCircle = await circle.save();

    res.json({ message: `${updatedCircle.name} Updated` })
    return;
});

// @desc Delete circle
// @route DELETE /circle/id
// @access Private
export const deleteCircle = expressAsyncHandler(async (req: IRequestModified, res: Response) => {
    const { id } = req.params;

    const userId = req._id;

    if (!id) {
        res.status(400).json({ message: "circle id is required" })
        return;
    }

    try {
        const circle = await Circle.findById(id).exec();

        if (!circle) {
            res.status(404).json({ message: 'Circle not found!' });
            return;
        }

        if (`${circle.createdBy}` !== userId) {
            res.status(401).json({ message: 'You do not have the permission to delete this Circle.' });
            return;
        }

        await Circle.deleteOne({ _id: id });

        await Post.deleteMany({ circleId: id });

        res.json({ message: `Deleted successfully` })
        return;
    }
    catch (err) {
        res.status(400).json({ message: 'Something went wrong!' });
        return;

    }
});