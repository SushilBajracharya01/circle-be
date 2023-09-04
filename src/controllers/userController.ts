import bcrypt from 'bcrypt';
import expressAsyncHandler from "express-async-handler";
import { Request, Response } from 'express';

import User from "../models/User.js";
import cloudinary from '../utilities/cloudinary.js';
import { dataUri } from '../middleware/multer.js';

// @desc Get all users
// @route GET /users
// @access Private
export const getAllUsers = expressAsyncHandler(async (req: Request, res: Response) => {
    const users = await User.find().select('-password').lean();
    if (!users?.length) {
        res.status(400).json({ message: 'No users found' });
        return null;
    }

    res.json(users);
});


// @desc Create new user
// @route POST /users
// @access Private
export const createNewUser = expressAsyncHandler(async (req: Request, res: Response) => {
    const { username, fullname, email, password, role, country } = req.body;

    // Confirm data
    if (!username || !email || !password || !fullname || !country) {
        res.status(400).json({ message: 'All Fields are required' });
        return;
    }

    // Check for duplicate
    const duplicate = await User.findOne({ email }).collation({ locale: 'en', strength: 2 }).lean().exec();

    if (duplicate) {
        res.status(409).json({ message: 'Duplicate Email' });
        return;
    }

    // Hash password
    const hashedPwd = await bcrypt.hash(password, 10);
    let profilePicObject = null;
    let profilePic = null;
    if (req.files && req.files[0]) {
        let tempPic = req.files[0];
        if (!tempPic) return;
        profilePic = dataUri(tempPic);
    }
    if (profilePic) {
        const uploadRes = await cloudinary.uploader.upload(profilePic, {
            upload_preset: 'user-profile-pic'
        });
        if (uploadRes) {
            profilePicObject = uploadRes;
        }
    }
    const userObject = !role ? {
        username, email, 'password': hashedPwd, fullname, country, photo: profilePicObject
    } :
        {
            username, email, 'password': hashedPwd, role, fullname, country, photo: profilePicObject
        };

    // Create and Store new user
    const user = await User.create(userObject);

    if (user) {
        res.status(201).json({ message: `New user ${username} created` });
        return;
    }
    else {
        res.status(400).json({ message: 'Invalid user data received' });
        return;
    }
});

// @desc Update user
// @route PATCH /users
// @access Private
export const updateUser = expressAsyncHandler(async (req: Request, res: Response) => {
    const { id, username, email, fullname, country, photo, role, active, password } = req.body;

    // Confirm data
    if (!id || !username || !role || typeof active !== "boolean" || !fullname) {
        res.status(400).json({ message: "All fields are required" })
        return;
    }

    const user = await User.findById(id).exec();

    if (!user) {
        res.status(400).json({ message: 'User not found' });
        return;
    }

    // check for duplicate
    const duplicate = await User.findOne({ email }).collation({ locale: 'en', strength: 2 }).lean().exec();

    if (duplicate && duplicate?._id.toString() !== id) {
        res.status(409).json({ message: 'Duplicate username' });
        return;
    }

    user.username = username;
    user.role = role;
    user.email = email;
    user.country = country;
    user.active = active;
    user.fullname = fullname;
    user.photo = photo;

    if (password) {
        user.password = await bcrypt.hash(password, 10)
    }

    const updatedUser = await user.save();

    res.json({ message: `${updatedUser.username} Updated` })
    return;
});
