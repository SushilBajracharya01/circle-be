import { Router } from 'express';
import verifyJWT from '../middleware/verifyJWT.js';
import { getAllUsers, createNewUser, updateUser } from '../controllers/userController.js';

const userRouter = Router();

userRouter.route('/').post(createNewUser);

userRouter.use(verifyJWT);

userRouter.route('/')
    .get(getAllUsers)
    .patch(updateUser);

export default userRouter;