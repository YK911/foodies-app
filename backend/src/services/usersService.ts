import { prisma } from '../db/prisma.js';
import createHttpError from 'http-errors';
import { Prisma } from '@prisma/client';
import cloudinary from '../utils/cloudinary.js';

// GET /api/users/:id
// Returns another user's profile with recipe and follower counts.
export const getPublicUserProfile = async (
  userId: string,
  currentUserId: string,
) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      avatar: true,
      _count: {
        select: {
          recipes: true,
          followers: true,
        },
      },
      followers: {
        where: { followerId: currentUserId },
        select: { id: true },
      },
    },
  });

  if (!user) return null;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    recipesCount: user._count.recipes,
    followersCount: user._count.followers,
    isFollowing: user.followers.length > 0,
  };
};
// GET /api/users/current
// Returns the current user's profile with activity counters.
export const getCurrentUserProfile = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      avatar: true,
      _count: {
        select: {
          recipes: true,
          favorites: true,
          followers: true,
          following: true,
        },
      },
    },
  });

  if (!user) return null;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    recipesCount: user._count.recipes,
    favoritesCount: user._count.favorites,
    followersCount: user._count.followers,
    followingCount: user._count.following,
    isFollowing: false,
  };
};
// GET /api/users/followers
// Returns paginated users who follow the current user.
export const getUserFollowers = async (
  userId: string,
  page: number,
  limit: number,
) => {
  const where = { followingId: userId };
  const skip = (page - 1) * limit;

  const [followers, total] = await Promise.all([
    prisma.follower.findMany({
      where,
      skip,
      take: limit,
      select: {
        follower: {
          select: {
            id: true,
            name: true,
            avatar: true,
            _count: {
              select: { recipes: true },
            },
            recipes: {
              take: 4,
              orderBy: { createdAt: 'desc' },
              select: {
                id: true,
                title: true,
                thumb: true,
              },
            },
            followers: {
              where: { followerId: userId },
              select: { id: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.follower.count({ where }),
  ]);

  return {
    items: followers.map(({ follower }) => ({
      id: follower.id,
      name: follower.name,
      avatar: follower.avatar,
      recipesCount: follower._count.recipes,
      recipes: follower.recipes,
      isFollowing: follower.followers.length > 0,
    })),
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
};

// GET /api/users/following
// Returns paginated users followed by the current user.
export const getUserFollowing = async (
  userId: string,
  page: number,
  limit: number,
) => {
  const where = { followerId: userId };
  const skip = (page - 1) * limit;

  const [following, total] = await Promise.all([
    prisma.follower.findMany({
      where,
      skip,
      take: limit,
      select: {
        following: {
          select: {
            id: true,
            name: true,
            avatar: true,
            _count: {
              select: { recipes: true },
            },
            recipes: {
              take: 4,
              orderBy: { createdAt: 'desc' },
              select: {
                id: true,
                title: true,
                thumb: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.follower.count({ where }),
  ]);

  return {
    items: following.map(({ following: user }) => ({
      id: user.id,
      name: user.name,
      avatar: user.avatar,
      recipesCount: user._count.recipes,
      recipes: user.recipes,
      isFollowing: true,
    })),
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
};

// POST /api/users/:id/follow
// Creates a subscription to another user.
export const followUser = async (followerId: string, followingId: string) => {
  if (followerId === followingId) {
    throw createHttpError(400, 'You cannot follow yourself');
  }

  const targetUser = await prisma.user.findUnique({
    where: { id: followingId },
    select: { id: true },
  });

  if (!targetUser) {
    throw createHttpError(404, 'User not found');
  }

  const existingFollow = await prisma.follower.findUnique({
    where: {
      followerId_followingId: {
        followerId,
        followingId,
      },
    },
  });

  if (existingFollow) {
    throw createHttpError(409, 'You are already following this user');
  }

  try {
    return await prisma.follower.create({
      data: {
        followerId,
        followingId,
      },
    });
  } catch (error) {
    // Handles a duplicate request arriving at the same time.
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw createHttpError(409, 'You are already following this user');
    }

    throw error;
  }
};

// DELETE /api/users/:id/follow
// Removes a subscription.
export const unfollowUser = async (followerId: string, followingId: string) => {
  const result = await prisma.follower.deleteMany({
    where: {
      followerId,
      followingId,
    },
  });

  if (result.count === 0) {
    throw createHttpError(404, 'Follow relationship not found');
  }

  return { message: 'Successfully unfollowed user' };
};
// PATCH /api/users/avatar
// Uploads an avatar to Cloudinary and updates the user profile.
export const updateUserAvatar = async (
  userId: string,
  file: Express.Multer.File,
) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });

  if (!user) {
    throw createHttpError(404, 'User not found');
  }

  const uploadResult = await new Promise<{ secure_url: string }>(
    (resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'foodies/avatars',
          resource_type: 'image',
        },
        (error, result) => {
          if (error || !result) {
            reject(error ?? new Error('Avatar upload failed'));
            return;
          }

          resolve({ secure_url: result.secure_url });
        },
      );

      uploadStream.end(file.buffer);
    },
  );

  return prisma.user.update({
    where: { id: userId },
    data: {
      avatar: uploadResult.secure_url,
    },
    select: {
      id: true,
      name: true,
      avatar: true,
    },
  });
};
