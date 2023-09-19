import { Request } from "express";

export interface IRequestModified extends Request {
    email: string;
    role: string;
    _id: string;
}

export interface IInviteInCircleProps {
    circleId: string;
    invitedBy: string;
    invitee: string;
}