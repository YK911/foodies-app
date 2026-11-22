import { prisma } from '../db/prisma.js';

// GET /api/areas: all areas (cuisines), sorted by name.
export const listAreas = () =>
  prisma.area.findMany({
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  });
