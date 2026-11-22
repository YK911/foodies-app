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
    const currentUserId = req.user?.id;

    if (!currentUserId) {
      throw createHttpError(401, 'Unauthorized');
    }

    const user = await getPublicUserProfile(req.params.id, currentUserId);

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

    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? req.query.perPage ?? 6);

    if (
      !Number.isInteger(page) ||
      page < 1 ||
      !Number.isInteger(limit) ||
      limit < 1
    ) {
      throw createHttpError(400, 'Invalid pagination parameters');
    }

    const followers = await getUserFollowers(userId, page, limit);

    res.status(200).json(followers);
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

    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? req.query.perPage ?? 6);

    if (
      !Number.isInteger(page) ||
      page < 1 ||
      !Number.isInteger(limit) ||
      limit < 1
    ) {
      throw createHttpError(400, 'Invalid pagination parameters');
    }

    const following = await getUserFollowing(userId, page, limit);

    res.status(200).json(following);
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
