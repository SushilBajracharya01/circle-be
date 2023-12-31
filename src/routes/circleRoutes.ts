import { Router } from 'express';
import verifyJWT from '../middleware/verifyJWT.js';
import { createNewCircle, deleteCircle, getCircleById, getCirclesByUserId, updateCircle } from '../controllers/circleController.js';
import { multerUploads } from '../middleware/multer.js';

const circleRouter = Router();

circleRouter.use(verifyJWT);

circleRouter.route('/')
    .get(getCirclesByUserId)
    .post(multerUploads, createNewCircle);

circleRouter.route('/:id')
    .get(getCircleById)
    .patch(multerUploads, updateCircle)
    .delete(deleteCircle);


export default circleRouter;