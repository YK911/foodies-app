import { prisma } from '../db/prisma.js';

// GET /api/ingredients: all ingredients, sorted by name.
export const listIngredients = () =>
  prisma.ingredient.findMany({
    select: { id: true, name: true, desc: true, img: true },
    orderBy: { name: 'asc' },
  });
