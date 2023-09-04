import bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import expressAsyncHandler from "express-async-handler";

//
import User from "../models/User.js";



// @desc POST
// @route POST /auth
// @access Public
export const login = expressAsyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
        res.status(400).json({ message: 'Email and Password are required!' });
        return null;
    }

    const foundUser = await User.findOne({ email }).exec();

    if (!foundUser || !foundUser.active) {
        res.status(401).json({ message: "Email or Password does not match!" });
        return null;
    }

    const match = await bcrypt.compare(password, foundUser.password);

    if (!match) {
        res.status(401).json({ message: "Email or Password does not match!" })
        return null;
    };

    const accessToken = jwt.sign(
        {
            "UserInfo": {
                "_id": foundUser._id,
                "email": foundUser.email,
                "role": foundUser.role
            }
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '1h' }
    )

    const refreshToken = jwt.sign(
        {
            "email": foundUser.email,
        },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: '5h' }
    )

    res.json({ accessToken, refreshToken })
    return null;
});

// @desc POST
// @route GET /auth/refresh
// @access Public
export const refresh = expressAsyncHandler(async (req: Request, res: Response) => {
    const refreshToken = req.header('authorization');

    if (!refreshToken) {
        res.status(401).json({ message: "Unauthorized" })
        return null;
    };

    try {
        let decoded = jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN_SECRET,
        );

        const foundUser = await User.findOne({ email: decoded.email }).exec();

        if (!foundUser) {
            res.status(401).json({ message: "Unauthorized" });
            return null;
        }

        const accessToken = jwt.sign(
            {
                "UserInfo": {
                    "_id": foundUser._id,
                    "email": foundUser.email,
                    "role": foundUser.role
                }
            },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '1h' }
        )

        res.json({ accessToken });
    }
    catch (error) {
        res.status(403).json({ message: "Forbidden" });
        return null;
    }
});