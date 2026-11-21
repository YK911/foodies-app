import type { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';
import {
  getPublicUserProfile,
  getCurrentUserProfile,
  getUserFollowers,
  getUserFollowing,
  followUser,
  unfollowUser,
  updateUserAvatar,
} from '../services/usersService.js';

export const getUserById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await getPublicUserProfile(req.params.id);

    if (!user) {
      throw createHttpError(404, 'User not found');
    }

    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};
export const getCurrentUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Temporary integration point for the authentication middleware.
    const userId = req.user?.id;

    if (!userId) {
      throw createHttpError(401, 'Unauthorized');
    }

    const user = await getCurrentUserProfile(userId);

    if (!user) {
      throw createHttpError(404, 'User not found');
    }

    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};
// GET /api/users/followers
export const getFollowers = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      throw createHttpError(401, 'Unauthorized');
    }

    const followers = await getUserFollowers(userId);

    res.status(200).json(followers.map((item) => item.follower));
  } catch (error) {
    next(error);
  }
};

// GET /api/users/following
export const getFollowing = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      throw createHttpError(401, 'Unauthorized');
    }

    const following = await getUserFollowing(userId);

    res.status(200).json(following.map((item) => item.following));
  } catch (error) {
    next(error);
  }
};
// POST /api/users/:id/follow
export const followUserController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const followerId = req.user?.id;

    if (!followerId) {
      throw createHttpError(401, 'Unauthorized');
    }

    const followingId = req.params.id;

    const follow = await followUser(followerId, followingId);

    res.status(201).json(follow);
  } catch (error) {
    next(error);
  }
};

// DELETE /api/users/:id/follow
export const unfollowUserController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const followerId = req.user?.id;

    if (!followerId) {
      throw createHttpError(401, 'Unauthorized');
    }

    const followingId = req.params.id;

    const result = await unfollowUser(followerId, followingId);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
// PATCH /api/users/avatar
export const updateAvatar = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      throw createHttpError(401, 'Unauthorized');
    }

    if (!req.file) {
      throw createHttpError(400, 'Avatar file is required');
    }

    const updatedUser = await updateUserAvatar(userId, req.file);

    res.status(200).json(updatedUser);
  } catch (error) {
    next(error);
  }
};
