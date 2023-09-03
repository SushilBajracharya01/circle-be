import { Router } from 'express';
import { login, refresh } from '../controllers/authController.js';
import loginLimiter from '../middleware/loginLimiter.js';

const authRouter = Router();

authRouter.route('/').post(loginLimiter, login);
authRouter.route('/refresh').get(refresh);

export default authRouter;