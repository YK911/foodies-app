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
import { prisma } from '../db/prisma.js';
import { getFavoriteRecipes, getOwnRecipes } from '../services/recipesService.js';

export const getProfileTab = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const viewerId = req.user?.id;
    if (!viewerId) throw createHttpError(401, 'Unauthorized');

    const { id, tab } = req.params;
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 6);
    const validPage = Number.isSafeInteger(page) && page >= 1;
    const validLimit = Number.isInteger(limit) && limit >= 1 && limit <= 50;
    if (!validPage || !validLimit || (page - 1) * limit > 2_147_483_647) {
      throw createHttpError(400, 'Invalid pagination parameters');
    }

    const profile = await prisma.user.findUnique({ where: { id }, select: { id: true } });
    if (!profile) throw createHttpError(404, 'User not found');

    if (tab === 'followers' || tab === 'following') {
      const getPeople = tab === 'followers' ? getUserFollowers : getUserFollowing;
      res.json(await getPeople(id, page, limit, viewerId));
      return;
    }

    const getList = tab === 'recipes' ? getOwnRecipes : getFavoriteRecipes;
    const { recipes, totalItems, totalPages } = await getList({ userId: id, page, perPage: limit });
    const items = recipes.map(({ id, title, description, thumb, owner }) => ({
      id,
      title,
      description,
      thumb,
      ownerId: owner.id,
      ownerName: owner.name,
      ownerAvatar: owner.avatar,
    }));
    res.json({ items, page, limit, total: totalItems, totalPages });
  } catch (error) {
    next(error);
  }
};

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
