import { Router } from 'express';
import verifyJWT from '../middleware/verifyJWT.js';
import { createNewComment, createNewPost, deleteComment, deletePost, getPostsByCircleId, getPostsById, updateComment, updatePost } from '../controllers/postController.js';
import { multerUploads } from '../middleware/multer.js';

const postRouter = Router();

postRouter.use(verifyJWT);

postRouter.route('/')
    .post(multerUploads, createNewPost);

postRouter.route('/:circleId')
    .get(getPostsByCircleId);

postRouter.route('/post/:postId')
    .get(getPostsById);

postRouter.route('/:postId')
    .patch(multerUploads, updatePost)
    .delete(deletePost);

postRouter.route('/:postId/comment')
    .post(multerUploads, createNewComment);

postRouter.route('/:postId/comment/:commentId')
    .patch(multerUploads, updateComment)
    .delete(deleteComment);


export default postRouter;