import { Router } from 'express';
import {
  getUserById,
  getCurrentUser,
  getFollowers,
  getFollowing,
  followUserController,
  unfollowUserController,
  updateAvatar,
} from '../controllers/usersController.js';
import { uploadAvatar } from '../middlewares/uploadAvatar.js';
import { authenticate } from '../middlewares/authenticate.js';

const usersRouter = Router();

// Private routes
usersRouter.get('/current', authenticate, getCurrentUser);
usersRouter.get('/followers', authenticate, getFollowers);
usersRouter.get('/following', authenticate, getFollowing);
usersRouter.patch('/avatar', authenticate, uploadAvatar, updateAvatar);
usersRouter.post('/:id/follow', authenticate, followUserController);
usersRouter.delete('/:id/follow', authenticate, unfollowUserController);

// Public route
usersRouter.get('/:id', getUserById);

export default usersRouter;
