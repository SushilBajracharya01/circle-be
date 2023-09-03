import jwt from 'jsonwebtoken';
import { NextFunction, Request, Response } from 'express';

export interface IVefifyJWTRequest extends Request {
    username: string;
    roles: string[];
}

/**
 * 
 * @param req 
 * @param res 
 * @param next 
 * @returns 
 */
const verifyJWT = (req: IVefifyJWTRequest, res: Response, next: NextFunction) => {
    let authHeader = req.headers.authorization || req.headers.Authorization;

    if (Array.isArray(authHeader)) {
        if (authHeader.length) {
            authHeader = authHeader[0];
        }
        else {
            return false;
        }
    }
    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ message: "Invalid Token" });
    }

    const token = authHeader.split(' ')[1];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err: any, decoded: { UserInfo: { username: string, roles: string[] } }) => {
        if (err) return res.status(403).json({ message: 'Forbidden' });
        req.username = decoded.UserInfo.username;
        req.roles = decoded.UserInfo.roles;

        next();
    });
}

export default verifyJWT;