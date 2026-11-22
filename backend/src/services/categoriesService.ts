import { prisma } from '../db/prisma.js';

// GET /api/categories: all categories, sorted by name.
export const listCategories = () =>
  prisma.category.findMany({
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  });
