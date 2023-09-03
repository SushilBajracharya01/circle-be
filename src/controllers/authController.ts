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
    const { username, password } = req.body;

    if (!username || !password) {
        res.status(400).json({ message: 'Username and Password are required!' });
        return null;
    }

    const foundUser = await User.findOne({ username }).exec();

    if (!foundUser || !foundUser.active) {
        res.status(401).json({ message: "Username or Password does not match!" });
        return null;
    }

    const match = await bcrypt.compare(password, foundUser.password);

    if (!match) {
        res.status(401).json({ message: "Username or Password does not match!" })
        return null;
    };

    const accessToken = jwt.sign(
        {
            "UserInfo": {
                "username": foundUser.username,
                "roles": foundUser.roles
            }
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '1h' }
    )

    const refreshToken = jwt.sign(
        {
            "username": foundUser.username,
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
    console.log(refreshToken, 'refreshToken');

    if (!refreshToken) {
        res.status(401).json({ message: "Unauthorized" })
        return null;
    };

    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        expressAsyncHandler(async (err, res) => {
            if (err) {
                res.status(403).json({ message: "Forbidden" });
                return null;
            }

            // const foundUser = await User.findOne({ username: decoded.username }).exec();

            // if (!foundUser) {
            //     res.status(401).json({ message: "Unauthorized" });
            //     return null;
            // }

            // const accessToken = jwt.sign(
            //     {
            //         "UserInfo": {
            //             "username": foundUser.username,
            //             "roles": foundUser.roles
            //         }
            //     },
            //     process.env.ACCESS_TOKEN_SECRET,
            //     { expiresIn: '1h' }
            // )

            // res.json({ accessToken });
            return null;
        })
    )

});

// @desc POST
// @route POST /auth/logout
// @access Public
export const logout = expressAsyncHandler(async (req: Request, res: Response) => {
    const cookies = req.cookies;

    if (!cookies?.jwt) {
        res.sendStatus(204)
        return null;
    };

    res.clearCookie('jwt', {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({ message: "Cookie cleared" })
    return null;
})
