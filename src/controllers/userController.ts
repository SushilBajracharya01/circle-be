import bcrypt from 'bcrypt';
import expressAsyncHandler from "express-async-handler";
import { Request, Response } from 'express';

import User from "../models/User.js";

// @desc Get all users
// @route GET /users
// @access Private
export const getAllUsers = expressAsyncHandler(async (req: Request, res: Response) => {
    const users = await User.find().select('-password').lean();
    if (!users?.length) {
        res.status(400).json({ message: 'No users found' });
    }

    res.json(users);
});


// @desc Create new user
// @route POST /users
// @access Private
export const createNewUser = expressAsyncHandler(async (req: Request, res: Response) => {
    const { username, name, password, roles, photo } = req.body;

    // Confirm data
    if (!username || !password || !name) {
        res.status(400).json({ message: 'All Fields are required' });
    }

    // Check for duplicate
    const duplicate = await User.findOne({ username }).collation({ locale: 'en', strength: 2 }).lean().exec();

    if (duplicate) {
        res.status(409).json({ message: 'Duplicate username' });
    }

    // Hash password
    const hashedPwd = await bcrypt.hash(password, 10);

    const userObject = (!Array.isArray(roles) || !roles.length) ? {
        username, 'password': hashedPwd, name, photo
    } :
        {
            username, 'password': hashedPwd, roles, name, photo
        };

    // Create and Store new user
    const user = await User.create(userObject);

    if (user) {
        res.status(201).json({ message: `New user ${username} created` });
    }
    else {
        res.status(400).json({ message: 'Invalid user data received' });
    }
});

// @desc Update user
// @route PATCH /users
// @access Private
export const updateUser = expressAsyncHandler(async (req: Request, res: Response) => {
    const { id, username, name, photo, roles, active, password } = req.body;

    // Confirm data
    if (!id || !username || !Array.isArray(roles) || !roles.length || typeof active !== "boolean" || !name) {
        res.status(400).json({ message: "All fields are required" })
    }

    const user = await User.findById(id).exec();

    if (!user) {
        res.status(400).json({ message: 'User not found' });
    }

    // check for duplicate
    const duplicate = await User.findOne({ username }).collation({ locale: 'en', strength: 2 }).lean().exec();

    if (duplicate && duplicate?._id.toString() !== id) {
        res.status(409).json({ message: 'Duplicate username' });
    }

    user.username = username;
    user.roles = roles;
    user.active = active;
    user.name = name;
    user.photo = photo;

    if (password) {
        user.password = await bcrypt.hash(password, 10)
    }

    const updatedUser = await user.save();

    res.json({ message: `${updatedUser.username} Updated` })
});
