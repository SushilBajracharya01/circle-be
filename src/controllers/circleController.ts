import expressAsyncHandler from "express-async-handler";
import { Request, Response } from 'express';
import Circle from '../models/Circle.js';


interface IRequestModified extends Request {
    email: string;
    role: string;
    _id: string;
}
// @desc Get all circle by userId
// @route GET /circle
// @access Private
export const getCirclesByUserId = expressAsyncHandler(async (req: IRequestModified, res: Response) => {
    const userId = req._id;
    const circles = await Circle.find({ creator: userId }).lean();
    if (!circles?.length) {
        res.status(400).json({ message: 'No Circles found' });
        return null;
    }

    res.json(circles);
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
    const circleObject = { name, description, moto, creator: userId, members: [userId] };

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
    const { name, descriptions, moto } = req.body;

    // Confirm data
    if (!name) {
        res.status(400).json({ message: "Name fields are required" })
        return;
    }

    const circle = await Circle.findById(id).exec();

    if (!circle) {
        res.status(400).json({ message: 'Circle not found' });
        return;
    }

    if (`${circle.creator}` !== userId) {
        res.status(401).json({ message: 'You do not have the permission to update this Circle.' });
        return;
    }

    circle.name = name;
    circle.descriptions = descriptions;
    circle.moto = moto;

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
        res.status(400).json({ message: "id fields are required" })
        return;
    }

    try {
        const circle = await Circle.findById(id).exec();

        if (!circle) {
            res.status(404).json({ message: 'Circle not found!' });
            return;
        }

        if (`${circle.creator}` !== userId) {
            res.status(401).json({ message: 'You do not have the permission to delete this Circle.' });
            return;
        }

        await Circle.deleteOne({ _id: id });

        res.json({ message: `Deleted successfully` })
        return;
    }
    catch (err) {
        res.status(400).json({ message: 'Something went wrong!' });
        return;

    }
});