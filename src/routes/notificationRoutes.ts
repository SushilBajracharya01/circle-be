import { Router } from 'express';
import verifyJWT from '../middleware/verifyJWT.js';
import { createNotification, getMyNotifications } from '../controllers/notificationController.js';

const notificationRouter = Router();

notificationRouter.use(verifyJWT);

notificationRouter.route('/')
    .get(getMyNotifications)
    .post(createNotification);

export default notificationRouter;