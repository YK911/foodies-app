import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import createHttpError from 'http-errors';
import { Readable } from 'node:stream';
import { prisma } from '../db/prisma.js';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

interface CreateRecipeInput {
  title: string;
  category: string;
  area: string;
  instructions: string;
  description: string;
  time: string;
  ingredients: unknown;
  thumb?: Express.Multer.File;
}

const uploadThumb = (file: Express.Multer.File): Promise<string> =>
  new Promise((resolve, reject) => {
    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      reject(createHttpError(500, 'Cloudinary is not configured'));
      return;
    }
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'foodies/recipes', resource_type: 'image' },
      (error, result: UploadApiResponse | undefined) => {
        if (error || !result) reject(error || new Error('Image upload failed'));
        else resolve(result.secure_url);
      },
    );
    Readable.from(file.buffer).pipe(stream);
  });

const parseIngredients = (value: unknown): Array<{ id: string; measure: string }> => {
  let parsed = value;
  if (typeof value === 'string') {
    try {
      parsed = JSON.parse(value);
    } catch {
      throw createHttpError(400, 'Invalid ingredients format');
    }
  }
  if (!Array.isArray(parsed)) throw createHttpError(400, 'Ingredients must be an array');
  const ingredients = parsed.map((item: unknown) => {
    if (typeof item !== 'object' || item === null) throw createHttpError(400, 'Invalid ingredient');
    const ingredient = item as Record<string, unknown>;
    const id = String(ingredient.id || ingredient.ingredientId || '');
    const measure = String(ingredient.measure || '').trim();
    if (!id || !measure) throw createHttpError(400, 'Each ingredient requires id and measure');
    return { id, measure };
  });
  if (!ingredients.length) throw createHttpError(400, 'At least one ingredient is required');
  return ingredients;
};

export const createRecipe = async (ownerId: string, input: CreateRecipeInput) => {
  const required = ['title', 'category', 'area', 'instructions', 'description', 'time'];
  for (const field of required) {
    if (!String((input as unknown as Record<string, unknown>)[field] || '').trim()) {
      throw createHttpError(400, `${field} is required`);
    }
  }

  const ingredients = parseIngredients(input.ingredients);
  const [category, area] = await Promise.all([
    prisma.category.findUnique({ where: { name: input.category } }),
    prisma.area.findUnique({ where: { name: input.area } }),
  ]);
  if (!category) throw createHttpError(400, 'Invalid category');
  if (!area) throw createHttpError(400, 'Invalid area');

  const ingredientIds = [...new Set(ingredients.map((item) => item.id))];
  const found = await prisma.ingredient.findMany({ where: { id: { in: ingredientIds } } });
  if (found.length !== ingredientIds.length) throw createHttpError(400, 'Invalid ingredient id');

  const thumb = input.thumb ? await uploadThumb(input.thumb) : null;
  return prisma.recipe.create({
    data: {
      title: input.title.trim(),
      categoryName: input.category,
      areaName: input.area,
      instructions: input.instructions.trim(),
      description: input.description.trim(),
      time: input.time.trim(),
      thumb,
      ownerId,
      ingredients: {
        create: ingredients.map((item) => ({ ingredientId: item.id, measure: item.measure })),
      },
    },
    include: {
      owner: { select: { id: true, name: true, avatar: true } },
      category: true,
      area: true,
      ingredients: { include: { ingredient: true } },
    },
  });
};

export const deleteOwnRecipe = async (ownerId: string, recipeId: string) => {
  const recipe = await prisma.recipe.findUnique({ where: { id: recipeId } });
  if (!recipe) throw createHttpError(404, 'Recipe not found');
  if (recipe.ownerId !== ownerId)
    throw createHttpError(403, 'You can only delete your own recipes');
  await prisma.recipe.delete({ where: { id: recipeId } });
};

export const getOwnRecipes = async (ownerId: string, page: number, limit: number) => {
  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    prisma.recipe.findMany({
      where: { ownerId },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        owner: { select: { id: true, name: true, avatar: true } },
        category: true,
        area: true,
        ingredients: { include: { ingredient: true } },
      },
    }),
    prisma.recipe.count({ where: { ownerId } }),
  ]);
  return { items, page, limit, total, totalPages: Math.ceil(total / limit) };
};

export const addFavorite = async (userId: string, recipeId: string) => {
  const recipe = await prisma.recipe.findUnique({ where: { id: recipeId } });
  if (!recipe) throw createHttpError(404, 'Recipe not found');
  await prisma.favorite.upsert({
    where: { userId_recipeId: { userId, recipeId } },
    update: {},
    create: { userId, recipeId },
  });
};

export const removeFavorite = async (userId: string, recipeId: string) => {
  const favorite = await prisma.favorite.findUnique({
    where: { userId_recipeId: { userId, recipeId } },
  });
  if (!favorite) throw createHttpError(404, 'Favorite not found');
  await prisma.favorite.delete({ where: { userId_recipeId: { userId, recipeId } } });
};

export const getFavorites = async (userId: string, page: number, limit: number) => {
  const skip = (page - 1) * limit;
  const [favorites, total] = await Promise.all([
    prisma.favorite.findMany({
      where: { userId },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        recipe: {
          include: {
            owner: { select: { id: true, name: true, avatar: true } },
            category: true,
            area: true,
            ingredients: { include: { ingredient: true } },
          },
        },
      },
    }),
    prisma.favorite.count({ where: { userId } }),
  ]);
  return {
    items: favorites.map((item) => item.recipe),
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
};
