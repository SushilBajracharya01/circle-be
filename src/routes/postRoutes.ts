import { Router } from 'express';
import verifyJWT from '../middleware/verifyJWT.js';
import { createNewPost, deletePost, getPostsByCircleId, updatePost } from '../controllers/postController.js';

const postRouter = Router();

postRouter.use(verifyJWT);

postRouter.route('/')
    .post(createNewPost);

postRouter.route('/:postId')
    .patch(updatePost)
    .delete(deletePost);


export default postRouter;