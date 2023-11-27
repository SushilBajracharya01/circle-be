import bcrypt from 'bcrypt';
import expressAsyncHandler from "express-async-handler";
import { Request, Response } from 'express';

import { IRequestModified } from '../types.js';
import Notification from '../models/Notification.js';
import { ObjectId } from 'mongodb';

// @desc Get me
// @route GET /me
// @access Private
export const getMyNotifications = expressAsyncHandler(async (req: IRequestModified, res: Response) => {
    const userId = req._id;

    let query = { userId };

    let page: number = req.query.page ? +req.query.page : 1;
    let pageSize: number = req.query.pageSize ? +req.query.pageSize : 10;

    const skipValue = (page - 1) * pageSize;
    const totalDocuments = await Notification.countDocuments(query);

    const totalPages = Math.ceil(totalDocuments / pageSize);

    const agg = [
        {
            '$match': {
                'userId': new ObjectId(userId)
            }
        }, {
            '$limit': 10
        }, {
            '$skip': 0
        }, {
            '$lookup': {
                'from': 'users',
                'localField': 'userId',
                'foreignField': '_id',
                'as': 'user'
            }
        }, {
            '$lookup': {
                'from': 'users',
                'localField': 'senderId',
                'foreignField': '_id',
                'as': 'sender'
            }
        }, {
            '$unwind': {
                'path': '$user'
            }
        }, {
            '$unwind': {
                'path': '$sender'
            }
        }, {
            '$project': {
                'user': {
                    'fullname': 1,
                    '_id': 1
                },
                'sender': {
                    'fullname': 1,
                    '_id': 1
                }
            }
        }
    ];
    const notifications = await Notification.aggregate(agg);

    if (!notifications) {
        res.status(400).json({ message: 'No user found' });
        return null;
    }

    res.json({
        status: 200,
        message: 'Notification',
        results: notifications
    });
});

// @desc Create new notification
// @route POST /notification
// @access Private
export const createNotification = expressAsyncHandler(async (req: Request, res: Response) => {
    const { type, userId, senderId, circleId, meta } = req.body;

    // Confirm data
    if (!type || !userId || !senderId || !circleId) {
        res.status(400).json({ message: 'All Fields are required' });
        return;
    }

    const notificationObject = {
        type, userId, senderId, circleId, meta
    };
    // Create and Store new user
    const user = await Notification.create(notificationObject);

    if (user) {
        res.status(201).json({ message: `New notification created` });
        return;
    }
    else {
        res.status(400).json({ message: 'Invalid notification data received' });
        return;
    }
});
