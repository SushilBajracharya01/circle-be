import { Router } from 'express';
import verifyJWT from '../middleware/verifyJWT.js';
import { getAllUsers, createNewUser, updateUser } from '../controllers/userController.js';

const userRouter = Router();

userRouter.use(verifyJWT);

userRouter.route('/')
    .get(getAllUsers)
    .post(createNewUser)
    .patch(updateUser);


export default userRouter;