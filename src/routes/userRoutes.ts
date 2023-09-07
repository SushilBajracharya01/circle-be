import { Router } from 'express';
import verifyJWT from '../middleware/verifyJWT.js';
import { getAllUsers, createNewUser, updateUser, getMe } from '../controllers/userController.js';
import { multerUploads } from '../middleware/multer.js';

const userRouter = Router();

userRouter.route('/').post(multerUploads, createNewUser);

userRouter.use(verifyJWT);

userRouter.route('/')
    .get(getAllUsers)
    .patch(updateUser);

userRouter.route('/me').get(getMe);

export default userRouter;